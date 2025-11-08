<template>
  <!-- 放在页面最底层（或任意容器内作为背景） -->
  <canvas ref="canvasEl" class="starfield-canvas" :style="wrapperStyle"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { gsap } from 'gsap'

/**
 * 可调参数
 */
interface Props {
  /** 星星密度（每 10,000 像素多少颗） */
  density?: number
  /** 星星基础速度（px/s），会叠加深度 */
  baseSpeed?: number
  /** 视差强度，0~1 建议 0.05~0.3 */
  parallax?: number
  /** 星星最小/最大半径（像素，未乘 DPI） */
  minRadius?: number
  maxRadius?: number
  /** 星星颜色（可传多色随机） */
  colors?: string[]
  /** 是否覆盖全屏 */
  fullscreen?: boolean
  /** 背景色 */
  background?: string
}

const props = withDefaults(defineProps<Props>(), {
  density: 0.12,        // 每 10k px 约 0.12 颗（会乘画布面积）
  baseSpeed: 30,        // 30 px/s
  parallax: 0.18,       // 视差强度
  minRadius: 0.6,
  maxRadius: 1.8,
  colors: ['#ffffff', '#a3c9ff', '#ffd5a3'],
  fullscreen: true,
  background: 'transparent',
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

type Star = {
  x: number
  y: number
  z: number       // 深度 0~1（越大越靠前）
  r: number       // 半径
  color: string
  vx: number      // 水平速度（随深度变化）
}

let stars: Star[] = []
let rafAdded = false
let resizeObserver: ResizeObserver | null = null

// 逻辑尺寸（不乘 dpr），用于计算视觉中心
let logicalW = 0
let logicalH = 0

// 平滑的鼠标坐标（相对画布中心），用 GSAP 插值
const mouse = { x: 0, y: 0 }
const mouseTarget = { x: 0, y: 0 }

// 样式：全屏时固定铺满；否则跟随父容器
const wrapperStyle = computed(() => {
  if (props.fullscreen) {
    return {
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      background: props.background,
    } as Record<string, string | number>
  }
  return { background: props.background } as Record<string, string | number>
})

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function pick<T>(arr: T[]) {
  return arr[(Math.random() * arr.length) | 0]
}

function logicalSize(el: HTMLCanvasElement) {
  const rect = el.getBoundingClientRect()
  return { w: rect.width, h: rect.height }
}

function setupCanvas() {
  const el = canvasEl.value!
  const dpr = Math.min(devicePixelRatio || 1, 2) // 限制到 2，避免超高 DPR 过重
  const { w, h } = logicalSize(el)
  logicalW = Math.max(1, Math.floor(w))
  logicalH = Math.max(1, Math.floor(h))

  el.width = Math.max(1, Math.floor(w * dpr))
  el.height = Math.max(1, Math.floor(h * dpr))
  el.style.width = `${w}px`
  el.style.height = `${h}px`

  ctx = el.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // 用逻辑坐标绘制
}

function createStars() {
  stars = []
  const area = logicalW * logicalH
  // 以 10,000 像素为单位计算数量
  const count = Math.max(20, Math.floor((area / 10000) * props.density))
  for (let i = 0; i < count; i++) {
    const z = Math.pow(Math.random(), 1.8) // 偏向靠后（小 z）/你也可以改成 (Math.random()) 让分布更均匀
    const r = rand(props.minRadius, props.maxRadius) * (0.6 + z * 0.8)
    const speed = props.baseSpeed * (0.2 + z * 1.2) // 深度越大越快
    stars.push({
      x: Math.random() * logicalW,
      y: Math.random() * logicalH,
      z,
      r,
      color: pick(props.colors),
      vx: speed * (Math.random() < 0.5 ? -1 : 1), // 左右随机
    })
  }
}

/** 根据时间推进星星位置，出界则回卷到另一侧 */
function stepStars(dt: number) {
  const w = logicalW
  const h = logicalH
  for (const s of stars) {
    s.x += s.vx * dt
    // 回卷
    if (s.vx > 0 && s.x - s.r > w) s.x = -s.r
    else if (s.vx < 0 && s.x + s.r < 0) s.x = w + s.r
  }
}

function draw() {
  if (!ctx) return
  const c = ctx
  c.clearRect(0, 0, logicalW, logicalH)

  // 计算视差偏移（鼠标相对中心）
  const offsetX = mouse.x * props.parallax
  const offsetY = mouse.y * props.parallax

  // 简单星星：用 fill 圆点；可升级为发光描边（shadow）
  for (const s of stars) {
    // 每个星星也做一点与深度相关的视差（更近的偏移更大）
    const px = s.x + offsetX * (0.2 + s.z * 0.8)
    const py = s.y + offsetY * (0.2 + s.z * 0.8)

    c.beginPath()
    c.arc(px, py, s.r, 0, Math.PI * 2)
    c.fillStyle = s.color
    c.globalAlpha = 0.6 + s.z * 0.4 // 近的更亮
    c.fill()
  }
  // 还原 alpha
  c.globalAlpha = 1
}

/** 主循环：使用 GSAP 的 ticker（内部就是高性能 rAF） */
let lastTime = performance.now()
const loop = () => {
  const now = performance.now()
  const dt = Math.min(0.05, (now - lastTime) / 1000) // 限 50ms，避免切后台后跃迁
  lastTime = now
  stepStars(dt)
  draw()
}

function onPointerMove(e: PointerEvent | MouseEvent | TouchEvent) {
  let clientX = 0
  let clientY = 0
  if (e instanceof TouchEvent) {
    const t = e.touches[0] || e.changedTouches[0]
    clientX = t?.clientX ?? 0
    clientY = t?.clientY ?? 0
  } else if (e instanceof PointerEvent || e instanceof MouseEvent) {
    clientX = (e as PointerEvent).clientX
    clientY = (e as PointerEvent).clientY
  }
  // 转为相对中心坐标
  mouseTarget.x = clientX - logicalW / 2
  mouseTarget.y = clientY - logicalH / 2
}

function addListeners() {
  const el = canvasEl.value!
  // 平滑插值：把 mouse 缓动追随到 mouseTarget
  gsap.ticker.lagSmoothing(1000, 16) // 默认即可
  gsap.ticker.add(tickFollow)
  rafAdded = true

  // 事件：支持鼠标/触摸/指针
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('touchmove', onPointerMove, { passive: true })

  // 尺寸监听（非全屏也能自适应）
  resizeObserver = new ResizeObserver(() => {
    setupCanvas()
    createStars()
  })
  resizeObserver.observe(el)
}

function removeListeners() {
  if (rafAdded) {
    gsap.ticker.remove(tickFollow)
    rafAdded = false
  }
  window.removeEventListener('pointermove', onPointerMove as any)
  window.removeEventListener('touchmove', onPointerMove as any)
  resizeObserver?.disconnect()
  resizeObserver = null
}

// 让鼠标坐标平滑追随目标，再驱动渲染循环
function tickFollow() {
  // 以 0.1 的插值跟随（你也可以用 gsap.to 定时 tween）
  mouse.x += (mouseTarget.x - mouse.x) * 0.1
  mouse.y += (mouseTarget.y - mouse.y) * 0.1
  loop()
}

onMounted(() => {
  setupCanvas()
  createStars()
  addListeners()
})

onBeforeUnmount(() => {
  removeListeners()
})
</script>

<style scoped>
.starfield-canvas {
  display: block;
  /* 全屏时通过内联 style: position: fixed; inset: 0; z-index: -1; */
}
</style>
