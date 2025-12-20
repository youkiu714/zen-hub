<template>
  <div class="room-panel">
    <div class="virtual-scroll-container">
      <div v-for="room in visibleRooms" :key="room.id">
        <div class="room-card-wrapper">
          <div class="room-card" :class="getRoomStateClass(room)">
            <div class="card-header">
              <div class="header-left">
                <span class="room-number">{{ room.roomNo }}</span>
                <span class="room-gender">{{ room.gender === 1 ? '男众' : '女众' }}</span>
              </div>
              <div class="room-availability">
                <span class="occupied-count">{{
                  room.occupiedCount || (room.beds ? room.beds.filter((b) => b.occupant).length : 0)
                }}</span>
                <span class="separator">/</span>
                <span class="total-count">{{ room.capacity }}</span>
                <span class="label">已住</span>
              </div>
            </div>

            <div class="bed-grid-visual">
              <div
                v-for="bed in room.beds"
                :key="bed.bedId"
                class="bed-tile"
                :class="{
                  'is-occupied': isBedOccupied(bed),
                  'is-vacant': !isBedOccupied(bed)
                }"
              >
                <span class="bed-pos-tag">{{ bed.bedNo }}</span>

                <template v-if="isBedOccupied(bed)">
                  <div>
                    <!-- <el-popconfirm
                      class="box-item"
                      :title="`确定要移除${bed.occupant?.name}吗`"
                      placement="top"
                      trigger="click"
                      :icon="null"
                      confirm-button-text="确认"
                      cancel-button-text="取消"
                      @confirm="handleDeleteBed(room, bed)"
                    >
                      <template #reference>
                        <div
                          class="action-icon delete-icon"
                          @click.stop
                          title="移出人员"
                        >
                          ×
                        </div>
                      </template>
                    </el-popconfirm> -->

                    <!-- <div
                      class="action-icon info-icon"
                      @click.stop="handleShowDetail(bed)"
                      title="查看详情"
                    >
                      i
                    </div> -->
                  </div>

                  <div class="occupant-name" :title="bed.occupant?.name">
                    {{ bed.occupant?.name }}
                  </div>
                </template>

                <template v-else>
                  <div class="vacant-center">
                    <span class="vacant-text">空</span>
                  </div>
                </template>
              </div>
            </div>

            <div class="card-footer">
              <button class="action-btn view" type="button" @click="$emit('manage-room', room)">
                编辑
              </button>
              <button
                class="action-btn assign"
                type="button"
                :disabled="selectedCount === 0 || !canAssignTo(room)"
                @click="openAssignModal(room)"
              >
                <template v-if="selectedCount > 0">分配 {{ selectedCount }}人</template>
                <template v-else>暂未分配</template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AssignModal
      v-model="showModal"
      :target-room="targetRoom"
      :preview-beds="previewBeds"
      :swap-source-id="swapSourceId"
      :current-info="currentInfo"
      @bed-swap="handleBedSwapClick"
      @confirm="confirmAssignment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { batchBeds } from '@/api/bed'
import AssignModal from './AssignModal.vue'

// ==========================================
// 以下保留您提供的原始逻辑代码
// ==========================================

const props = defineProps({
  selectedMembers: {
    type: Array as () => any[],
    default: () => []
  },
  rooms: {
    type: Array as () => any[],
    required: true
  }
})

const emit = defineEmits(['confirm-assign', 'manage-room', 'assignment-success'])

const showModal = ref(false)
const targetRoom = ref<any>(null)
const previewBeds = ref<any[]>([])
const swapSourceId = ref<number | null>(null)
const currentInfo = ref(null)

const selectedMembersList = computed<any[]>(() =>
  Array.isArray(props.selectedMembers) ? props.selectedMembers : []
)

const getPersonKey = (person: any): string | number | null => {
  return person?.applicationId ?? person?.personId ?? person?.id ?? person?.__key ?? null
}

const normalizeBedType = (bed: any): 'upper' | 'lower' | 'unknown' => {
  if (bed?.type === 'upper' || bed?.type === 'lower') return bed.type
  if (bed?.bedType === 1) return 'upper'
  if (bed?.bedType === 2) return 'lower'
  if (typeof bed?.bedTypeName === 'string') {
    if (bed.bedTypeName.includes('上')) return 'upper'
    if (bed.bedTypeName.includes('下')) return 'lower'
  }
  if (typeof bed?.bedNo === 'string') {
    if (bed.bedNo.includes('上')) return 'upper'
    if (bed.bedNo.includes('下')) return 'lower'
  }
  return 'unknown'
}

const getBedId = (bed: any): number | null => {
  const id = bed?.bedId ?? bed?.id
  return typeof id === 'number' ? id : Number(id)
}

const getBedSortKey = (bed: any): number => {
  const bedNo = bed?.bedNo
  if (typeof bedNo === 'number') return bedNo
  if (typeof bedNo === 'string') {
    const digits = bedNo.match(/\d+/g)
    if (digits && digits.length > 0) return Number(digits.join(''))
  }
  return getBedId(bed) ?? 0
}

const getBunkKey = (bed: any): string => {
  const bedNo = bed?.bedNo
  if (typeof bedNo === 'string') {
    const digits = bedNo.match(/\d+/g)
    if (digits && digits.length > 0) return digits.join('')
    return bedNo
  }
  if (typeof bedNo === 'number') return String(bedNo)
  return String(getBedId(bed) ?? getBedSortKey(bed))
}

const getBedAssigned = (bed: any) => bed?.assigned ?? bed?.occupant ?? null

const isBedOccupied = (bed: any): boolean => {
  if (getBedAssigned(bed)) return true
  if (bed?.occupied === true) return true
  if (bed?.status === 1) return true
  return false
}

const isBedBlocked = (bed: any): boolean => {
  if (bed?.status === 2 || bed?.status === 3) return true
  if (bed?.locked === true || bed?.isLocked === true) return true
  return false
}

const isBedAssignable = (bed: any): boolean => {
  return !isBedOccupied(bed) && !isBedBlocked(bed)
}

// --- 计算属性 ---
const selectedCount = computed(() => selectedMembersList.value.length)

const selectedGender = computed(() => {
  if (selectedMembersList.value.length === 0) return null
  return selectedMembersList.value[0]?.gender ?? null
})

// === 新增/修改的处理函数 ===
const handleDeleteBed = (room: any, bed: any) => {
  // 这里可以添加二次确认弹窗
  console.log('点击了移除:', { room, bed })
  // 实际业务逻辑：调用 API 移除该床位的人员
  // emit('remove-member', { roomId: room.id, bedId: bed.bedId })
}

const handleShowDetail = (bed: any) => {
  console.log('点击了详情:', bed)
  // 实际业务逻辑：展示详情弹窗
  // emit('show-detail', bed.occupant)
}
// =========================

// --- 辅助逻辑 (保持不变) ---
const getFreeCount = (room: any) => (room?.beds ?? []).filter((b: any) => isBedAssignable(b)).length

const visibleRooms = computed(() => {
  const list = Array.isArray(props.rooms) ? props.rooms : []
  // if (selectedCount.value === 0) return list // 如果需要只在选人时筛选，取消注释
  // 仅展示“可被分配”的房间逻辑如果不需要可以注释掉，或者保留
  if (selectedCount.value > 0) {
    return list.filter((room: any) => canAssignTo(room))
  }
  return list
})

const canAssignTo = (room: any) => {
  if (selectedCount.value === 0) return false
  if (getFreeCount(room) < selectedCount.value) return false
  if (selectedGender.value && room.gender !== selectedGender.value) return false
  return true
}

const getRoomStateClass = (room: any) => {
  if (selectedCount.value === 0) return ''
  return canAssignTo(room) ? 'is-match' : 'is-disabled'
}

// --- 弹窗逻辑 (完全保留原逻辑) ---
const openAssignModal = (room: any) => {
  console.log('room:', room)
  targetRoom.value = room
  swapSourceId.value = null
  currentInfo.value = room

  const selectedKeySet = new Set(
    selectedMembersList.value.map((m: any) => getPersonKey(m)).filter((k: any) => k != null)
  )

  const bedsClone = JSON.parse(JSON.stringify(room?.beds ?? []))
  bedsClone.forEach((bed: any) => {
    bed.bedId = getBedId(bed)
    bed.type = normalizeBedType(bed)
    bed.assigned = getBedAssigned(bed)
    bed.isOriginalOccupied = isBedOccupied(bed)
    bed.isBlocked = isBedBlocked(bed)
    bed.isNew = false
  })

  const peopleToAssign = [...selectedMembersList.value]
  const assignableBeds = bedsClone.filter((b: any) => isBedAssignable(b))

  // 您的原始排序与分配逻辑
  const lowerBeds = assignableBeds
    .filter((b: any) => b.type === 'lower')
    .sort((a: any, b: any) => getBedSortKey(a) - getBedSortKey(b))
  const upperBeds = assignableBeds
    .filter((b: any) => b.type === 'upper')
    .sort((a: any, b: any) => getBedSortKey(a) - getBedSortKey(b))
  const unknownBeds = assignableBeds
    .filter((b: any) => b.type !== 'upper' && b.type !== 'lower')
    .sort((a: any, b: any) => getBedSortKey(a) - getBedSortKey(b))

  const ageValue = (p: any) => (typeof p?.age === 'number' ? p.age : 0)
  const remainingPeople = [...peopleToAssign].sort((a: any, b: any) => ageValue(a) - ageValue(b))

  const bunkMap = new Map()
  ;[...lowerBeds, ...upperBeds].forEach((bed: any) => {
    const key = getBunkKey(bed)
    const sortKey = getBedSortKey(bed)
    const existing = bunkMap.get(key) ?? { key, sortKey }
    existing.sortKey = Math.min(existing.sortKey ?? sortKey, sortKey)
    if (bed.type === 'lower') existing.lower = bed
    if (bed.type === 'upper') existing.upper = bed
    bunkMap.set(key, existing)
  })

  const getBunkRank = (bunk: any) => {
    if (bunk.lower && bunk.upper) return 0
    if (bunk.upper) return 1
    if (bunk.lower) return 2
    return 3
  }

  const bunks = Array.from(bunkMap.values()).sort((a: any, b: any) => {
    const rankDiff = getBunkRank(a) - getBunkRank(b)
    if (rankDiff !== 0) return rankDiff
    return (a.sortKey ?? 0) - (b.sortKey ?? 0)
  })

  for (const bunk of bunks) {
    if (remainingPeople.length === 0) break
    if (bunk.lower && remainingPeople.length > 0) {
      bunk.lower.assigned = remainingPeople.pop()
    }
    if (bunk.upper && remainingPeople.length > 0) {
      bunk.upper.assigned = remainingPeople.shift()
    }
  }

  unknownBeds.forEach((bed: any) => {
    if (remainingPeople.length === 0) return
    bed.assigned = remainingPeople.pop()
  })

  const refreshNewFlags = () => {
    bedsClone.forEach((bed: any) => {
      const key = getPersonKey(bed.assigned)
      bed.isNew =
        !bed.isOriginalOccupied && !bed.isBlocked && key != null && selectedKeySet.has(key)
    })
  }
  refreshNewFlags()

  previewBeds.value = bedsClone
  showModal.value = true
}

const handleBedSwapClick = (bed: any) => {
  if (bed.isOriginalOccupied || bed.isBlocked) return

  const selectedKeySet = new Set(
    selectedMembersList.value.map((m: any) => getPersonKey(m)).filter((k: any) => k != null)
  )

  const refreshNewFlags = () => {
    previewBeds.value.forEach((b: any) => {
      const key = getPersonKey(b.assigned)
      b.isNew = !b.isOriginalOccupied && !b.isBlocked && key != null && selectedKeySet.has(key)
    })
  }

  if (swapSourceId.value === null) {
    if (!bed.isNew) return
    swapSourceId.value = bed.bedId
  } else {
    if (swapSourceId.value === bed.bedId) {
      swapSourceId.value = null
      return
    }
    const target = bed
    const source = previewBeds.value.find((b: any) => b.bedId === swapSourceId.value)
    if (!source || !source.isNew || !target.isNew) {
      swapSourceId.value = null
      return
    }
    const temp = source.assigned
    source.assigned = target.assigned
    target.assigned = temp
    swapSourceId.value = null
    refreshNewFlags()
  }
}

const confirmAssignment = async () => {
  try {
    const beds: any[] = []
    const selectedKeySet = new Set(
      selectedMembersList.value.map((m: any) => getPersonKey(m)).filter((k: any) => k != null)
    )

    previewBeds.value.forEach((item: any) => {
      const assigned = item?.assigned
      const key = getPersonKey(assigned)
      if (!assigned || key == null || !selectedKeySet.has(key)) return
      if (item.isOriginalOccupied || item.isBlocked) return
      const bedId = getBedId(item)
      if (!bedId) return
      beds.push({
        applicationId: assigned.applicationId,
        bedId,
        checkinAt: assigned.checkinDate ?? assigned.expectedCheckinDate,
        checkoutAt: assigned.checkoutDate ?? assigned.expectedCheckoutDate,
        type: 1
      })
    })

    console.log('提交分配数据:', beds)
    const data = await batchBeds(beds) // 假设这是您的 API
    console.log('分配成功:', data)
    showModal.value = false
    emit('assignment-success')
    emit('confirm-assign', {
      roomId: targetRoom.value.id,
      newBeds: previewBeds.value
    })
  } catch (error) {
    console.error('分配失败:', error)
  }
}
</script>

<style scoped>
.room-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.virtual-scroll-container {
  flex: 1;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  overflow-y: auto;
}

.room-card-wrapper {
  height: 100%;
}

.room-card {
  background: white;
  border-radius: 12px;
  /* 基础状态：轻微阴影 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: auto;
  min-height: 300px; /* 保证卡片有一定高度 */
  transition: all 0.2s;
}

/* 匹配状态（可选）：分配模式下高亮 */
.room-card.is-match {
  border-color: #34c759;
  box-shadow: 0 0 0 2px rgba(52, 199, 89, 0.1);
}
.room-card.is-disabled {
  opacity: 0.6;
}

/* --- Header --- */
.card-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.room-number {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}
.room-gender {
  font-size: 14px;
  color: #666;
}

.room-availability {
  font-size: 14px;
  color: #999;
}
.occupied-count {
  color: #e6a23c; /* 橙色高亮已住 */
  font-weight: bold;
}
.label {
  margin-left: 4px;
  font-size: 12px;
}

/* --- Grid 核心区域 --- */
.bed-grid-visual {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #fff;
  flex: 1; /* 撑满中间区域 */
  max-height: 240px;
  overflow: auto;
}

/* 单个床位块 */
.bed-tile {
  position: relative;
  aspect-ratio: 1; /* 强制正方形 */
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
  cursor: default;
}

/* 床位号 (左上角) */
.bed-pos-tag {
  position: absolute;
  top: 4px;
  left: 6px;
  font-size: 12px;
  color: inherit;
  opacity: 0.6;
}

.bed-tile.is-occupied {
  background-color: rgba(251, 189, 189, 0.2);
  color: #333;
  border: 1px solid transparent;
}

/* 中间人名 */
.occupant-name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  text-align: center;
  width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6px;
}

/* 按钮图标通用样式 */
.action-icon {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  opacity: 0.8;
  transition:
    transform 0.1s,
    opacity 0.1s;
}
.action-icon:hover {
  transform: scale(1.1);
  opacity: 1;
}

/* 右上角移除按钮 (红底 x) */
.delete-icon {
  top: 4px;
  right: 4px;
  background-color: #ef4444; /* Red */
  line-height: 1;
  opacity: 0;
  pointer-events: none;
}

.bed-tile:hover .delete-icon {
  opacity: 0.9;
  pointer-events: auto;
}

/* 右下角详情按钮 (蓝底 i) */
.info-icon {
  bottom: 4px;
  right: 4px;
  background-color: #3b82f6; /* Blue */
  font-family: serif;
  font-style: italic;
}

/* === 状态：空闲 (Dashed Style) === */
.bed-tile.is-vacant {
  background-color: #fff;
  border: 1px dashed #d1d5db; /* 灰色虚线 */
  color: #9ca3af;
}
.bed-tile.is-vacant:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.vacant-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.vacant-text {
  font-size: 14px;
  color: #9ca3af;
}

/* --- Footer --- */
.card-footer {
  padding: 12px 16px 16px;
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  height: 36px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

/* 编辑按钮 (灰) */
.action-btn.view {
  background: #f3f4f6;
  color: #374151;
}
.action-btn.view:hover {
  background: #e5e7eb;
}

/* 分配按钮 (绿) */
.action-btn.assign {
  background: #10b981; /* Green */
  color: white;
}
.action-btn.assign:hover {
  background: #059669;
}
.action-btn.assign:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
