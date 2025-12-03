<template>
  <div
    ref="containerRef"
    class="virtual-list-container"
    :class="containerClass"
    :style="containerStyle"
    @scroll="onScroll"
  >
    <div class="virtual-scroll-content" :style="{ height: totalHeight + 'px' }">
      <div class="virtual-list" :style="{ transform: `translateY(${offsetY}px)` }">
        <slot
          v-for="(item, idx) in visibleItems"
          :key="itemKey ? itemKey(item, startIndex + idx) : startIndex + idx"
          :item="item"
          :index="startIndex + idx"
        />
      </div>
    </div>
    <div v-if="!loading && items.length === 0" class="virtual-empty">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    items: any[]
    itemHeight: number
    buffer?: number
    height?: number | string
    containerClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
    loading?: boolean
    itemKey?: (item: any, index: number) => string | number
    reachEndThreshold?: number
  }>(),
  {
    buffer: 5,
    height: '420px',
    loading: false,
    reachEndThreshold: 120
  }
)

const emit = defineEmits<{
  (e: 'reach-end'): void
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)
const resizeObserver = ref<ResizeObserver | null>(null)

const startIndex = computed(() => Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer))
const endIndex = computed(() =>
  Math.min(props.items.length - 1, startIndex.value + Math.ceil(containerHeight.value / props.itemHeight) + props.buffer * 2)
)
const visibleItems = computed(() => props.items.slice(startIndex.value, endIndex.value + 1))
const totalHeight = computed(() => Math.max(props.items.length * props.itemHeight, containerHeight.value))
const offsetY = computed(() => startIndex.value * props.itemHeight)

const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const onScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
    const distanceToBottom =
      containerRef.value.scrollHeight - containerRef.value.scrollTop - containerRef.value.clientHeight
    if (!props.loading && distanceToBottom <= props.reachEndThreshold!) {
      emit('reach-end')
    }
  }
}

const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

const resetScroll = () => {
  if (containerRef.value) {
    containerRef.value.scrollTo({ top: 0 })
    scrollTop.value = 0
  }
}

defineExpose({ resetScroll })

onMounted(() => {
  updateContainerHeight()
  resizeObserver.value = new ResizeObserver(updateContainerHeight)
  if (containerRef.value) {
    resizeObserver.value.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver.value?.disconnect()
})

watch(
  () => props.items.length,
  () => {
    // 当数据变化时保持滚动位置有效
    if (scrollTop.value > totalHeight.value) {
      resetScroll()
    }
  }
)

watch(
  () => props.height,
  () => {
    updateContainerHeight()
  }
)
</script>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

.virtual-scroll-content {
  position: relative;
}

.virtual-list {
  position: relative;
}

.virtual-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 13px;
  text-align: center;
  width: 100%;
}
</style>
