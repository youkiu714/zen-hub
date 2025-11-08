<template>
  <el-card class="hero-card" shadow="hover" :body-style="{ padding: 0 }">
    <div
      class="hero"
      ref="heroRef"
      @pointermove="onPointerMove"
      @pointerleave="resetTarget"
      @touchmove.passive="onTouchMove"
    >
      <!-- 底层：原图（静止） -->
      <img class="img img-base" :src="src" alt="cover base" />

      <!-- 上层：同一张图，仅显示“天空区域”，随鼠标轻微平移 -->
      <img
        class="img img-clouds"
        :src="src"
        alt="moving clouds"
        :style="overlayStyle"
      />

      <!-- 可选标题区/操作槽位 -->
      <div class="hero-overlay">
        <slot />
      </div>
    </div>

    <!-- 控制面板（可删） -->
    <div class="panel">
      <el-form label-width="98px" size="small">
        <el-form-item label="视差强度X">
          <el-slider v-model="rangeX" :min="10" :max="160" :step="1" />
        </el-form-item>
        <el-form-item label="视差强度Y">
          <el-slider v-model="rangeY" :min="0" :max="80" :step="1" />
        </el-form-item>
        <el-form-item label="天空裁剪高度">
          <el-slider
            v-model="maskTop"
            :min="30"
            :max="65"
            :step="1"
            :format-tooltip="v => v + '%'"
          />
        </el-form-item>
        <el-form-item label="陀螺仪(移动端)">
          <el-switch v-model="useGyro" />
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, computed } from 'vue'

/**
 * props
 * - src：你的封面图地址（只有这一张）
 * - height：封面高度，默认 60vh
 */
const props = withDefaults(
  defineProps<{
    src: string
    height?: string
    initialMaskTop?: number
  }>(),
  {
    initialMaskTop: 48, // 仅显示顶部 ~48% 作为“天空层”
  }
)

const heroRef = ref<HTMLDivElement | null>(null)

// 交互参数（可在面板调节）
const rangeX = ref(60) // 左右最大位移 px
const rangeY = ref(25) // 上下最大位移 px
const maskTop = ref(props.initialMaskTop) // 天空裁剪高度（%）
const useGyro = ref(false)
const ease = 0.08 // 缓动（0~1）

// 位移状态
const state = reactive({
  targetX: 0,
  targetY: 0,
  currX: 0,
  currY: 0,
  rafId: 0 as number | undefined,
})

const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const setTargetFromRatio = (rx: number, ry: number) => {
  // rx, ry in [-0.5, 0.5]; 居中为 0
  state.targetX = rx * 2 * rangeX.value
  state.targetY = ry * 2 * rangeY.value
}

const onPointerMove = (e: PointerEvent) => {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const rx = (e.clientX - rect.left) / rect.width - 0.5
  const ry = (e.clientY - rect.top) / rect.height - 0.5
  setTargetFromRatio(rx, ry)
}

const onTouchMove = (e: TouchEvent) => {
  if (!heroRef.value) return
  const t = e.touches[0]
  if (!t) return
  const rect = heroRef.value.getBoundingClientRect()
  const rx = (t.clientX - rect.left) / rect.width - 0.5
  const ry = (t.clientY - rect.top) / rect.height - 0.5
  setTargetFromRatio(rx, ry)
}

const resetTarget = () => {
  state.targetX = 0
  state.targetY = 0
}

const animate = () => {
  state.currX += (state.targetX - state.currX) * ease
  state.currY += (state.targetY - state.currY) * ease
  state.rafId = requestAnimationFrame(animate)
}

const onDeviceOrientation = (e: DeviceOrientationEvent) => {
  if (!useGyro.value) return
  // gamma 左右 (-90..90)；beta 前后 (-180..180) —— 简单归一
  const rx = (e.gamma ?? 0) / 90 / 2
  const ry = (e.beta ?? 0) / 180 / 2
  setTargetFromRatio(rx, ry)
}

onMounted(() => {
  if (!prefersReduced) animate()
  window.addEventListener('deviceorientation', onDeviceOrientation)
})

onBeforeUnmount(() => {
  if (state.rafId) cancelAnimationFrame(state.rafId)
  window.removeEventListener('deviceorientation', onDeviceOrientation)
})

// 供上层 img 使用的 transform 和 mask
const overlayStyle = computed(() => ({
  transform: `translate3d(${state.currX}px, ${state.currY}px, 0)`,
  // 仅显示顶部 maskTop% 的“天空”
  '--mask-top': `${maskTop.value}%`,
} as any))
</script>

<style scoped>
.hero-card {
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

/* 画布容器高度可配 */
.hero {
  position: relative;
  width: 100%;
  height: v-bind('props.height');
  overflow: hidden;
  background: #f2efe8;
  user-select: none;
}

/* 两层同图 */
.img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translateZ(0);
}

/* 上层：只显示“天空区域”，并平滑移动 */
.img-clouds {
  will-change: transform;
  transition: transform 0.12s linear; /* 鼠标停下时迅速回稳 */
  /* 线性遮罩，将下半部(屋顶及以下)裁掉，只保留上方“天空” */
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 var(--mask-top, 48%),
    transparent calc(var(--mask-top, 48%) + 1%)
  );
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 var(--mask-top, 48%),
    transparent calc(var(--mask-top, 48%) + 1%)
  );
}

/* 上方内容槽位（标题、按钮等） */
.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 16px 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.24), rgba(0,0,0,0) 40%);
  color: #fff;
  pointer-events: none; /* 不挡鼠标 */
}

/* 控制面板（示例） */
.panel {
  padding: 12px 16px 8px;
}
</style>
