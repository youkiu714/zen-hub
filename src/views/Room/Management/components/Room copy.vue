<template>
  <div class="room-panel">
    <div class="content-header">
      <h2>
        房间资源
        <span class="header-subtitle" v-if="selectedCount < 1 || !selectedCount"
          >请在左侧选择人员</span
        >
        <span class="header-subtitle highlight" v-else>已选择 {{ selectedCount }} 人</span>
      </h2>
    </div>

    <div
      class="virtual-scroll-container"
      ref="scrollerWrapper"
      @scroll="handleScroll"
      v-loading="loading"
    >
      <div v-for="room in allRooms" :key="room.id">
        <div class="room-card-wrapper" :style="gridItemStyle">
          <div class="room-card" :class="getRoomStateClass(room)">
            <div class="card-header">
              <div class="header-left">
                <span class="room-number">{{ room.number }}</span>
                <span class="room-gender">{{ room.gender === 'F' ? '女众' : '男众' }}</span>
              </div>
              <div class="room-availability">
                余
                <span class="count" :class="{ zero: getFreeCount(room) === 0 }">{{
                  getFreeCount(room)
                }}</span>
                床
              </div>
            </div>

            <div class="bed-grid-minimal">
              <div
                v-for="bed in room.beds"
                :key="bed.id"
                class="bed-tile"
                :class="{
                  'is-occupied': bed.assigned,
                  'is-vacant': !bed.assigned
                }"
              >
                <div class="bed-info-row">
                  <span class="bed-id">{{ bed.id }}号</span>
                  <span class="bed-position"> · {{ bed.type === 'lower' ? '下铺' : '上铺' }}</span>
                </div>

                <div class="bed-status-row">
                  <template v-if="bed.assigned">
                    <span class="user-name" :title="bed.assigned.name">{{
                      bed.assigned.name
                    }}</span>
                  </template>
                  <template v-else>
                    <span class="vacant-label">空闲</span>
                  </template>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button
                v-if="selectedCount > 0"
                class="action-btn assign"
                @click="() => openAssignModal(room)"
              >

                分配 {{ selectedCount }} 人 
              </button>

              <button v-else class="action-btn view" @click="$emit('manage-room', room)">
                管理
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content-minimal">
          <div class="modal-header">
            <h3>
              {{ targetRoom.number }}室 - 确认排布<span class="sub-text"
                >(如需调整，请直接点击两个床位进行互换)</span
              >
            </h3>
          </div>

          <div class="preview-grid-minimal">
            <div
              v-for="bed in previewBeds"
              :key="bed.id"
              class="preview-tile"
              :class="{
                'is-lower': bed.type === 'lower',
                'is-selected-swap': swapSourceId === bed.id,
                'is-locked': bed.isOriginalOccupied
              }"
              @click="handleBedSwapClick(bed)"
            >
              <div class="tile-header">
                <span class="bed-idx">{{ bed.id }}号</span>
                <span class="bed-pos" :class="bed.type">{{
                  bed.type === 'lower' ? '下铺' : '上铺'
                }}</span>
              </div>

              <div class="tile-body">
                <template v-if="bed.assigned">
                  <div class="p-name">{{ bed.assigned.name }}</div>
                  <div class="p-meta">
                    <span>{{ bed.assigned.age }}岁</span>
                    <span v-if="bed.assigned.age >= 60" class="elder-indicator">长者</span>
                  </div>
                  <div
                    v-if="bed.type === 'upper' && bed.assigned.age >= 60"
                    class="warning-indicator"
                  >
                    建议调至下铺
                  </div>
                </template>
                <template v-else>
                  <div class="p-empty">空闲</div>
                </template>
              </div>
            </div>
          </div>

          <div class="modal-actions-minimal">
            <button class="btn-minimal cancel" @click="closeModal">取消</button>
            <button class="btn-minimal confirm" @click="confirmAssignment">确认分配</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { getRooms } from '@/api/room'
import type { RoomSummaryVO } from '@/types/room'
import { batchBeds } from '@/api/bed'

// --- Props & Emits ---
const props = defineProps({
  selectedMembers: {
    type: Array as () => any[],
    default: () => []
  }
})

const emit = defineEmits(['confirm-assign', 'manage-room'])

const showModal = ref(false)
const targetRoom = ref<any>(null)
const previewBeds = ref<any[]>([])
const swapSourceId = ref<number | null>(null)
const allRooms = ref<any[]>([])
const loading = ref(false)
const scrollerWrapper = ref<HTMLElement | null>(null)

// --- 虚拟滚动配置 ---
const itemHeight = 320 // 每个房间卡片的高度
const scrollerRef = ref<InstanceType<typeof RecycleScroller> | null>(null)
const desiredColumns = 3
const minCardWidth = 280
const columnGap = 16
const cardWidth = ref(320)
const columnStride = ref(cardWidth.value + columnGap) // item-secondary-size
let resizeObserver: ResizeObserver | null = null

const gridItemStyle = computed(() => ({
  width: `${cardWidth.value}px`,
  height: `${itemHeight}px`
}))

// --- 分页加载状态 ---
const pageSize = 10
const currentPage = ref(1)
const hasMore = ref(true)
const isLoadingMore = ref(false)

// --- 计算属性 ---
const selectedCount = computed(() => props.selectedMembers.length)

const selectedGender = computed(() => {
  if (props.selectedMembers.length === 0) return null
  return props.selectedMembers?.length > 0 && props.selectedMembers[0].gender
})

// --- API 调用 ---
const fetchRooms = async (page: number = 1, append: boolean = false) => {
  try {
    if (!append) {
      loading.value = true
    } else {
      isLoadingMore.value = true
    }

    const params = { pageNo: page, pageSize: pageSize }
    const response = await getRooms(params)

    if (response.records && response.records.length > 0) {
      const transformedData = response.records.map(transformRoomData)

      if (append) {
        allRooms.value = [...allRooms.value, ...transformedData]
      } else {
        allRooms.value = transformedData
      }

      // 检查是否还有更多数据
      hasMore.value = response.records.length === pageSize
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('获取房间列表失败:', error)
  } finally {
    loading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || isLoadingMore.value) return

  currentPage.value++
  await fetchRooms(currentPage.value, true)
}

const transformRoomData = (room: RoomSummaryVO) => ({
  id: room.id,
  number: room.roomNo,
  gender: room?.gender === 1 ? 'M' : 'F',
  beds: generateMockBeds(room.bedCount || 0, room.usedBedCount || 0),
  capacity: room.bedCount || 0,
  occupied: room.usedBedCount || 0
})

const generateMockBeds = (totalBeds: number, usedBeds: number) => {
  const beds = []
  for (let i = 1; i <= totalBeds; i++) {
    beds.push({
      id: i,
      type: i % 2 === 1 ? 'lower' : 'upper',
      assigned: i <= usedBeds ? { name: `住户${i}`, age: 30 + i } : null
    })
  }
  return beds
}

// --- 辅助逻辑 (保持不变) ---
const getFreeCount = (room: any) => room.beds.filter((b: any) => !b.assigned).length

const canAssignTo = (room: any) => {
    console.log('room:', room)
    console.log("selectedCount.value:",selectedCount.value)
    console.log("getFreeCount(room) :",getFreeCount(room) )
  if (selectedCount.value === 0) return false
  if (getFreeCount(room) < selectedCount.value) return false
  return true
}

const getDisabledReason = (room: any) => {
  if (selectedGender.value && room.gender !== selectedGender.value) return '性别不符'
  if (getFreeCount(room) < selectedCount.value) return '容量不足'
  return '不可用'
}

const getRoomStateClass = (room: any) => {
  if (selectedCount.value === 0) return ''
  // 移除过于显眼的绿色边框，改用更微妙的交互
  return canAssignTo(room) ? 'is-match' : 'is-disabled'
}

// --- 弹窗逻辑 (保持不变) ---
const openAssignModal = (room: any) => {
  console.log('room:', room)
  targetRoom.value = room
  swapSourceId.value = null

  const bedsClone = JSON.parse(JSON.stringify(room.beds))
  bedsClone.forEach((b: any) => {
    if (b.assigned) b.isOriginalOccupied = true
  })

  const peopleToAssign = [...props.selectedMembers].sort((a: any, b: any) => b.age - a.age)

  const freeBeds = bedsClone
    .filter((b: any) => !b.assigned)
    .sort((a: any, b: any) => {
      if (a.type === 'lower' && b.type !== 'lower') return -1
      if (a.type !== 'lower' && b.type === 'lower') return 1
      return a.id - b.id
    })

  peopleToAssign.forEach((person: any, idx: number) => {
    if (idx < freeBeds.length) {
      freeBeds[idx].assigned = person
      freeBeds[idx].isNew = true
    }
  })

  previewBeds.value = bedsClone
  showModal.value = true
}

const handleBedSwapClick = (bed: any) => {
  if (bed.isOriginalOccupied) return
  if (swapSourceId.value === null) {
    swapSourceId.value = bed.id
  } else {
    if (swapSourceId.value === bed.id) {
      swapSourceId.value = null
      return
    }
    const source = previewBeds.value.find((b: any) => b.id === swapSourceId.value)
    const target = bed
    const temp = source.assigned
    source.assigned = target.assigned
    target.assigned = temp
    swapSourceId.value = null
  }
}

const closeModal = () => (showModal.value = false)

const confirmAssignment = async () => {
  const beds = []

  console.log('targetRoom.value.id:', targetRoom.value.id)
  console.log('previewBeds.value:', previewBeds.value)
  emit('confirm-assign', {
    roomId: targetRoom.value.id,
    newBeds: previewBeds.value
  })
//   todo 少一个床id
  previewBeds.value.map((item) => {
    if (item.assigned) {
      beds.push({
        applicationId: item.assigned.applicationId,
        checkinAt: item.assigned.checkinDate,
        checkoutAt: item.assigned.checkoutDate,
        type: 1
      })
    }
  })

  const data = await batchBeds(beds)
  console.log('data:', data)
  //   closeModal()
}

const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = container
  if (scrollHeight - scrollTop - clientHeight <= 350 && !isLoadingMore.value) {
    loadMore()
  }
}

const updateGridMetrics = () => {
  const containerWidth = scrollerWrapper.value?.clientWidth || 0
  if (!containerWidth) return

  const possibleColumns = Math.floor(containerWidth / (minCardWidth + columnGap))
  const columns = Math.min(desiredColumns, Math.max(1, possibleColumns))
  const stride = Math.floor(containerWidth / columns)
  const nextCardWidth = Math.max(minCardWidth, stride - columnGap)

  cardWidth.value = nextCardWidth
  columnStride.value = stride
  ;(scrollerRef.value as any)?.forceUpdate?.()
}

onMounted(async () => {
  updateGridMetrics()
  if (scrollerWrapper.value) {
    resizeObserver = new ResizeObserver(() => updateGridMetrics())
    resizeObserver.observe(scrollerWrapper.value)
  }
  await fetchRooms()
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
/* --- 全局容器与字体 --- */
.room-panel {
  flex: 1;
  /* 使用更干净的背景色 */
  background-color: #f8f9fa;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

/* --- 顶部标题栏 (极简) --- */
.content-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}
.content-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f; /* Apple 深灰 */
  letter-spacing: -0.5px;
}
.header-subtitle {
  font-size: 14px;
  color: #86868b;
  font-weight: 400;
  margin-left: 8px;
}
.header-subtitle.highlight {
  color: #007aff; /* Apple Blue 用于强调提示 */
}

/* --- 虚拟滚动区域 --- */
.virtual-scroll-wrapper {
  flex: 1;
  height: 100%;
  width: 100%;
}
.virtual-scroll-container {
  flex: 1;
  height: 100%;
  padding: 10px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 三列布局 */
  gap: 16px; /* 添加列间距 */
  overflow: auto;
}
.room-card-wrapper {
  box-sizing: border-box;
  padding: 0 8px 16px;
  height: 100%;
}

/* --- 房间卡片 (核心重构：扁平、无阴影) --- */
.room-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
  transition: border-color 0.2s;
  overflow: hidden;
}
/* 匹配状态：仅改变边框颜色，不加阴影 */
.room-card.is-match {
  border-color: #34c759; /* Apple Green */
}
.room-card.is-disabled {
  opacity: 0.5;
  background-color: #fafafa;
}

/* --- 1. 卡片头部 (去装饰化) --- */
.card-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.room-number {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  font-feature-settings: 'tnum'; /* 等宽数字 */
}
.room-gender {
  font-size: 13px;
  color: #86868b;
}
.room-availability {
  font-size: 13px;
  color: #86868b;
}
.room-availability .count {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 14px;
}
.room-availability .count.zero {
  color: #86868b;
}

/* --- 2. 床位 Grid (核心重构：极简方块) --- */
.bed-grid-minimal {
  padding: 0 16px 16px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: #fff;
  flex: 1;
  overflow-y: auto;
}

/* 单个床位块 (Tile) */
.bed-tile {
  border-radius: 8px;
  /* 增加内边距让内容呼吸 */
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.2s;
  min-height: 70px;
}

/* ==== 状态A: 空闲 (重点：干净、邀请感) ==== */
.bed-tile.is-vacant {
  background-color: #fff;
  /* 极细的灰色边框，取代虚线 */
  border: 1px solid #e5e5e5;
  align-items: center; /* 空闲状态内容居中 */
  height: 44px;
}
/* Hover 时 subtle 的变化 */
.bed-tile.is-vacant:hover {
  border-color: #34c759;
  background-color: #f2fff5;
}

.bed-tile.is-vacant .bed-info-row {
  /* 空闲时，床号信息淡化 */
  color: #adadad;
  margin-bottom: 4px;
}
.vacant-label {
  /* 核心信息：清晰、克制的绿色 */
  font-size: 14px;
  color: #34c759;
  font-weight: 500;
}

/* ==== 状态B: 已住 (重点：后退、不抢戏) ==== */
.bed-tile.is-occupied {
  /* 极淡的灰色背景，让出视觉中心 */
  background-color: #f2f2f7;
  border: 1px solid transparent; /* 占位 */
  align-items: flex-start;
}
.bed-tile.is-occupied .user-name {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.bed-tile.is-occupied .bed-info-row {
  color: #86868b;
  margin-bottom: 6px;
}

/* 床位辅助信息 (统一风格) */
.bed-info-row {
  font-size: 12px;
  display: flex;
  align-items: center;
}
.bed-id {
  font-weight: 500;
}
.bed-position {
  font-weight: 400;
  margin-left: 4px;
}

/* --- 3. 底部按钮 (扁平化) --- */
.card-footer {
  padding: 16px;
  padding-top: 0;
  background: #fff;
  margin-top: 12px;
}
.action-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}
/* 分配按钮：克制的深绿色，无渐变，无阴影 */
.action-btn.assign {
  background-color: #34c759;
  color: white;
}
.action-btn.assign:hover {
  background-color: #2da84e;
}
.action-btn.assign:disabled {
  background: #e5e5e5;
  color: #adadad;
  cursor: not-allowed;
}
/* 管理按钮：极简灰 */
.action-btn.view {
  background: #f2f2f7;
  color: #1d1d1f;
}
.action-btn.view:hover {
  background: #e5e5e5;
}

/* --- 加载状态 --- */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #86868b;
}
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid #e5e5e5;
  border-top: 2.5px solid #86868b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ================= 弹窗样式 (极简重构) ================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(5px);
}
.modal-content-minimal {
  background: white;
  width: 600px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
}
.modal-header {
  margin-bottom: 24px;
  text-align: center;
}
.modal-header h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #1d1d1f;
}
.modal-header .sub-text {
  color: #86868b;
  font-size: 14px;
  line-height: 1.5;
}

.preview-grid-minimal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

/* 弹窗内的床位块 */
.preview-tile {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}
.preview-tile:hover {
  border-color: #adadad;
}
/* 选中交换状态：清晰的蓝色轮廓 */
.preview-tile.is-selected-swap {
  border: 2px solid #007aff;
  background: #f5fafe;
  box-shadow: none;
}
.preview-tile.is-locked {
  background: #f9f9f9;
  opacity: 0.7;
  cursor: not-allowed;
}

.tile-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: #86868b;
}
.bed-pos.lower {
  color: #34c759;
}
.bed-pos.upper {
  color: #ff9f0a;
}

.tile-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.p-name {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}
.p-meta {
  font-size: 13px;
  color: #86868b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.elder-indicator {
  font-size: 11px;
  color: #ff9f0a;
  background: #fff5e6;
  padding: 1px 5px;
  border-radius: 4px;
}
.p-empty {
  color: #adadad;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
}
.warning-indicator {
  margin-top: 8px;
  font-size: 12px;
  color: #ff3b30;
  background: #fff2f2;
  padding: 4px 8px;
  border-radius: 6px;
  text-align: center;
}

.modal-actions-minimal {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.btn-minimal {
  width: 120px;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-minimal.confirm {
  background: #1d1d1f;
  color: white;
} /* 确认用黑色，极致强调 */
.btn-minimal.confirm:hover {
  background: #333;
}
.btn-minimal.cancel {
  background: #f2f2f7;
  color: #1d1d1f;
}
.btn-minimal.cancel:hover {
  background: #e5e5e5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.virtual-scroll-container::-webkit-scrollbar {
  display: none;
}
</style>
