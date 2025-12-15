<template>
  <div class="room-panel zen-theme">
    <div class="content-header">
      <h2>
        <span class="title-text">寮房概览</span>
        <span class="header-subtitle" v-if="selectedCount === 0">请择选人员以安单</span>
        <span class="header-subtitle highlight" v-else>已选 {{ selectedCount }} 位，请择绿框安置</span>
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
          
          <div 
            class="room-card" 
            :class="getRoomStateClass(room)"
          >
            <div class="card-header">
              <div class="header-main">
                <span class="room-number">{{ room.number }}</span>
                <span class="room-suffix">室</span>
              </div>
              <div class="header-meta">
                <span class="gender-stamp" :class="room.gender">
                  {{ room.gender === 'F' ? '女众' : '男众' }}
                </span>
                <div class="room-availability">
                  余 <span class="count" :class="{ zero: getFreeCount(room) === 0 }">{{ getFreeCount(room) }}</span> 榻
                </div>
              </div>
            </div>

            <div class="bed-grid-zen">
              <div
                v-for="bed in room.beds"
                :key="bed.id"
                class="bed-tile"
                :class="{
                  'is-occupied': bed.assigned,
                  'is-vacant': !bed.assigned
                }"
              >
                <div class="status-deco"></div>

                <div class="bed-inner">
                  <div class="bed-info">
                    <span class="bed-id">{{ bed.id }}号</span>
                    <span class="bed-pos">{{ bed.type === 'lower' ? '下铺' : '上铺' }}</span>
                  </div>

                  <div class="bed-status">
                    <template v-if="bed.assigned">
                      <span class="user-name" :title="bed.assigned.name">{{ bed.assigned.name }}</span>
                    </template>
                    <template v-else>
                      <span class="vacant-label">虚席</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button
                v-if="selectedCount > 0"
                class="action-btn assign"
                @click="() => openAssignModal(room)"
                :disabled="!canAssignTo(room)"
              >
                <template v-if="canAssignTo(room)"> 安单 ({{ selectedCount }}) </template>
                <template v-else> {{ getDisabledReason(room) }} </template>
              </button>

              <div v-else class="zen-toolbar">
                <button class="tool-text" @click="$emit('view-room', room)">查看</button>
                <span class="separator">·</span>
                <button class="tool-text" @click="$emit('edit-room', room)">编辑</button>
                <span class="separator">·</span>
                <button class="tool-text danger" @click="$emit('remove-room', room)">移除</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content-zen">
          <div class="modal-header">
            <h3>{{ targetRoom.number }}室 · 确认排布</h3>
            <p class="sub-text">点击两处床位可互换</p>
          </div>

          <div class="preview-grid-zen">
            <div
              v-for="bed in previewBeds"
              :key="bed.id"
              class="preview-tile"
              :class="{
                'is-selected-swap': swapSourceId === bed.id,
                'is-locked': bed.isOriginalOccupied
              }"
              @click="handleBedSwapClick(bed)"
            >
              <div class="tile-header">
                <span>{{ bed.id }}号 {{ bed.type === 'lower' ? '下铺' : '上铺' }}</span>
              </div>
              <div class="tile-body">
                <template v-if="bed.assigned">
                  <span class="p-name">{{ bed.assigned.name }}</span>
                  <span v-if="bed.assigned.age >= 60" class="tag-elder">长者</span>
                  <div v-if="bed.type === 'upper' && bed.assigned.age >= 60" class="tag-warn">建议调至下铺</div>
                </template>
                <template v-else>
                  <span class="p-empty">虚席</span>
                </template>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-zen cancel" @click="closeModal">取消</button>
            <button class="btn-zen confirm" @click="confirmAssignment">确认安单</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
// (Script 部分逻辑保持完全一致，无需修改，直接复用原有的逻辑代码即可)
// 为了篇幅，这里折叠 Script 内容，重点在 Template 和下面的 CSS
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { getRooms } from '@/api/room'
import type { RoomSummaryVO } from '@/types/room'
import { batchBeds } from '@/api/bed'

const props = defineProps({ selectedMembers: { type: Array as () => any[], default: () => [] } })
const emit = defineEmits(['confirm-assign', 'manage-room', 'view-room', 'edit-room', 'remove-room'])

const showModal = ref(false)
const targetRoom = ref<any>(null)
const previewBeds = ref<any[]>([])
const swapSourceId = ref<number | null>(null)
const allRooms = ref<any[]>([])
const loading = ref(false)
const scrollerWrapper = ref<HTMLElement | null>(null)

// 虚拟滚动配置
const itemHeight = 300 // 高度微调
const scrollerRef = ref<InstanceType<typeof RecycleScroller> | null>(null)
const desiredColumns = 3
const minCardWidth = 280
const columnGap = 20
const cardWidth = ref(320)
const columnStride = ref(cardWidth.value + columnGap)
let resizeObserver: ResizeObserver | null = null

const gridItemStyle = computed(() => ({ width: `${cardWidth.value}px`, height: `${itemHeight}px` }))

// 分页与数据逻辑 (保持不变)
const pageSize = 10
const currentPage = ref(1)
const hasMore = ref(true)
const isLoadingMore = ref(false)
const selectedCount = computed(() => props.selectedMembers.length)
const selectedGender = computed(() => props.selectedMembers.length ? props.selectedMembers[0].gender : null)

const fetchRooms = async (page: number = 1, append: boolean = false) => {
  try {
    if (!append) loading.value = true; else isLoadingMore.value = true
    const params = { pageNo: page, pageSize: pageSize }
    const response = await getRooms(params)
    if (response.records && response.records.length > 0) {
      const transformedData = response.records.map(transformRoomData)
      allRooms.value = append ? [...allRooms.value, ...transformedData] : transformedData
      hasMore.value = response.records.length === pageSize
    } else { hasMore.value = false }
  } catch (error) { console.error(error) } finally { loading.value = false; isLoadingMore.value = false }
}
const loadMore = async () => { if (!hasMore.value || isLoadingMore.value) return; currentPage.value++; await fetchRooms(currentPage.value, true) }
const transformRoomData = (room: RoomSummaryVO) => ({
  id: room.id, number: room.roomNo, gender: room?.gender === 1 ? 'M' : 'F',
  beds: generateMockBeds(room.bedCount || 0, room.usedBedCount || 0),
  capacity: room.bedCount || 0, occupied: room.usedBedCount || 0
})
const generateMockBeds = (total: number, used: number) => {
  const beds = []; for (let i = 1; i <= total; i++) {
    beds.push({ id: i, type: i % 2 === 1 ? 'lower' : 'upper', assigned: i <= used ? { name: `住户${i}`, age: 30 + i } : null })
  } return beds
}
const getFreeCount = (room: any) => room.beds.filter((b: any) => !b.assigned).length
const canAssignTo = (room: any) => {
  if (selectedCount.value === 0) return false
  if (getFreeCount(room) < selectedCount.value) return false
//   if (selectedGender.value && room.gender !== selectedGender.value) return false
  return true
}
const getDisabledReason = (room: any) => {
  if (getFreeCount(room) < selectedCount.value) return '容量不足'
  return '不可用'
}
const getRoomStateClass = (room: any) => {
  if (selectedCount.value === 0) return ''
  return canAssignTo(room) ? 'is-match' : 'is-disabled'
}
const openAssignModal = (room: any) => {
  targetRoom.value = room; swapSourceId.value = null
  const bedsClone = JSON.parse(JSON.stringify(room.beds))
  bedsClone.forEach((b: any) => { if (b.assigned) b.isOriginalOccupied = true })
  const peopleToAssign = [...props.selectedMembers].sort((a: any, b: any) => b.age - a.age)
  const freeBeds = bedsClone.filter((b: any) => !b.assigned).sort((a: any, b: any) => {
    if (a.type === 'lower' && b.type !== 'lower') return -1
    if (a.type !== 'lower' && b.type === 'lower') return 1
    return a.id - b.id
  })
  peopleToAssign.forEach((person: any, idx: number) => {
    if (idx < freeBeds.length) { freeBeds[idx].assigned = person; freeBeds[idx].isNew = true }
  })
  previewBeds.value = bedsClone; showModal.value = true
}
const handleBedSwapClick = (bed: any) => {
  if (bed.isOriginalOccupied) return
  if (swapSourceId.value === null) { swapSourceId.value = bed.id } else {
    if (swapSourceId.value === bed.id) { swapSourceId.value = null; return }
    const source = previewBeds.value.find((b: any) => b.id === swapSourceId.value)
    const target = bed; const temp = source.assigned; source.assigned = target.assigned; target.assigned = temp; swapSourceId.value = null
  }
}
const closeModal = () => (showModal.value = false)
const confirmAssignment = async () => {
  const beds: any[] = []
  emit('confirm-assign', { roomId: targetRoom.value.id, newBeds: previewBeds.value })
  previewBeds.value.map((item) => {
    if (item.assigned) { beds.push({ applicationId: item.assigned.applicationId, checkinAt: item.assigned.checkinDate, checkoutAt: item.assigned.checkoutDate, type: 1 }) }
  })
  const data = await batchBeds(beds); console.log(data); closeModal()
}
const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = container
  if (scrollHeight - scrollTop - clientHeight <= 350 && !isLoadingMore.value) loadMore()
}
const updateGridMetrics = () => {
  const containerWidth = scrollerWrapper.value?.clientWidth || 0
  if (!containerWidth) return
  const possibleColumns = Math.floor(containerWidth / (minCardWidth + columnGap))
  const columns = Math.min(desiredColumns, Math.max(1, possibleColumns))
  const stride = Math.floor(containerWidth / columns)
  const nextCardWidth = Math.max(minCardWidth, stride - columnGap)
  cardWidth.value = nextCardWidth; columnStride.value = stride; (scrollerRef.value as any)?.forceUpdate?.()
}
onMounted(async () => { updateGridMetrics(); if (scrollerWrapper.value) { resizeObserver = new ResizeObserver(() => updateGridMetrics()); resizeObserver.observe(scrollerWrapper.value) }; await fetchRooms() })
onBeforeUnmount(() => { if (resizeObserver) resizeObserver.disconnect() })
</script>

<style scoped>
/* 引入宋体/衬线体 (fallback to system serif) */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

/* --- 禅意配色变量 --- */
.zen-theme {
  --zen-bg: #f7f5f0;          /* 米宣色 (背景) */
  --zen-card: #ffffff;        /* 纯白 (卡片) */
  --zen-ink: #4a4238;         /* 沉香褐 (主文字) */
  --zen-ink-light: #968e85;   /* 暖灰 (副文字) */
  --zen-green: #5e7a63;       /* 竹青 (强调/按钮) */
  --zen-border: #e6e2d8;      /* 暖边框 */
  --zen-red: #a86262;         /* 胭脂 (警告) */
  --zen-occupied: #f2f0eb;    /* 占位灰 */
}

/* 全局容器 */
.room-panel {
  flex: 1;
  background-color: var(--zen-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  font-family: "Noto Serif SC", "SimSun", "Songti SC", serif; /* 核心：衬线体 */
  color: var(--zen-ink);
}

/* 头部 */
.content-header { margin-bottom: 24px; flex-shrink: 0; }
.content-header h2 {
  margin: 0; font-size: 26px; font-weight: 600; color: #2c2621;
  display: flex; align-items: baseline; gap: 12px;
}
.title-text { letter-spacing: 2px; }
.header-subtitle {
  font-size: 14px; font-family: -apple-system, sans-serif;
  color: var(--zen-ink-light); font-weight: 400;
}
.header-subtitle.highlight { color: var(--zen-green); }

/* 虚拟滚动 */
.virtual-scroll-container { flex: 1; overflow-y: auto; overflow-x: hidden; }
.virtual-scroll-content { position: relative; }
.virtual-scroll-container::-webkit-scrollbar { display: none; } /* 隐藏滚动条 */

/* 网格容器 */
.room-card-wrapper { box-sizing: border-box; padding: 0 10px 20px; height: 100%; }

/* --- 禅意卡片 --- */
.room-card {
  background: var(--zen-card);
  border: 1px solid var(--zen-border);
  border-radius: 4px; /* 微圆角，偏方正 */
  box-shadow: 0 4px 16px rgba(162, 155, 142, 0.1); /* 暖色柔光阴影 */
  display: flex; flex-direction: column;
  height: 100%; min-height: 280px;
  transition: all 0.3s ease;
  overflow: hidden;
}
.room-card.is-match { border-color: var(--zen-green); background-color: #fcfdfc; }
.room-card.is-disabled { opacity: 0.6; filter: grayscale(0.5); }

/* 1. 卡片头部 */
.card-header {
  padding: 16px 20px;
  border-bottom: 1px dashed var(--zen-border); /* 虚线分割 */
  display: flex; justify-content: space-between; align-items: center;
}
.header-main { display: flex; align-items: baseline; }
.room-number { font-size: 24px; font-weight: 600; color: #2c2621; }
.room-suffix { font-size: 14px; color: var(--zen-ink-light); margin-left: 4px; }

.header-meta { text-align: right; }
.gender-stamp {
  display: inline-block; font-size: 12px; padding: 1px 6px;
  border: 1px solid currentColor; border-radius: 2px;
  margin-bottom: 2px; opacity: 0.8;
}
.gender-stamp.M { color: #5c6b7f; border-color: #5c6b7f; } /* 靛蓝 */
.gender-stamp.F { color: var(--zen-red); border-color: var(--zen-red); } /* 胭脂 */

.room-availability { font-size: 13px; color: var(--zen-ink-light); }
.room-availability .count { color: var(--zen-green); font-weight: 600; font-size: 15px; margin: 0 2px; }
.room-availability .count.zero { color: var(--zen-ink-light); }

/* 2. 床位布局 */
.bed-grid-zen {
  padding: 16px 20px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  flex: 1; overflow-y: auto;
  /* 极淡的纹理背景 (可选) */
  background-image: radial-gradient(var(--zen-occupied) 1px, transparent 1px);
  background-size: 20px 20px;
}

.bed-tile {
  position: relative; background-color: #fff;
  border: 1px solid var(--zen-border); border-radius: 2px;
  padding: 0; display: flex;
  min-height: 64px; transition: all 0.2s;
}

/* 状态：虚席 (空闲) */
.bed-tile.is-vacant { border-color: #e0ded9; background-color: #fff; }
.bed-tile.is-vacant:hover { border-color: var(--zen-green); box-shadow: 0 2px 8px rgba(94, 122, 99, 0.1); }
.bed-tile.is-vacant .status-deco { background-color: #d1d9d1; } /* 极淡绿 */
.bed-tile.is-vacant:hover .status-deco { background-color: var(--zen-green); }
.vacant-label { color: var(--zen-green); letter-spacing: 2px; font-size: 14px; opacity: 0.8; }

/* 状态：已住 */
.bed-tile.is-occupied { background-color: var(--zen-occupied); border-color: transparent; }
.bed-tile.is-occupied .status-deco { background-color: #d6d3ce; } /* 暖灰 */
.bed-tile.is-occupied .user-name { color: #5c5247; font-weight: 600; font-size: 14px; font-family: sans-serif; }

/* 床位内部结构 */
.status-deco { width: 4px; height: 100%; transition: background 0.3s; }
.bed-inner { flex: 1; padding: 8px 10px; display: flex; flex-direction: column; justify-content: center; }
.bed-info { display: flex; justify-content: space-between; font-size: 12px; color: #aaa399; margin-bottom: 4px; }
.bed-status { display: flex; align-items: center; }

/* 3. 底部功能区 (核心修改：工具栏) */
.card-footer {
  padding: 0;
  border-top: 1px solid var(--zen-border);
  background: #fbfaf8;
  height: 48px;
  display: flex; align-items: center;
}

/* 安单按钮 (印章风格) */
.action-btn.assign {
  width: 100%; height: 100%; border: none;
  background-color: var(--zen-green); color: #fff;
  font-family: "Noto Serif SC", serif; font-size: 16px; letter-spacing: 2px;
  cursor: pointer; transition: background 0.3s;
}
.action-btn.assign:hover { background-color: #4b6350; }
.action-btn.assign:disabled { background-color: #e0ded9; color: #fff; cursor: not-allowed; }

/* 管理工具栏 (文字+分隔符) */
.zen-toolbar {
  width: 100%; display: flex; justify-content: space-evenly; align-items: center;
}
.tool-text {
  background: none; border: none; cursor: pointer;
  font-family: "Noto Serif SC", serif; font-size: 14px; color: var(--zen-ink);
  opacity: 0.7; transition: all 0.2s; padding: 10px;
}
.tool-text:hover { opacity: 1; font-weight: 600; background-color: rgba(0,0,0,0.02); border-radius: 4px;}
.tool-text.danger { color: var(--zen-red); }
.separator { color: #dcdcdc; font-weight: bold; font-family: sans-serif; }

/* --- 弹窗样式 --- */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center; z-index: 999;
  backdrop-filter: blur(2px);
}
.modal-content-zen {
  background: var(--zen-card); width: 600px; padding: 32px;
  border-radius: 4px; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  border: 1px solid var(--zen-border);
}
.modal-header { margin-bottom: 24px; text-align: center; }
.modal-header h3 { margin: 0 0 8px 0; font-size: 22px; color: #2c2621; }
.sub-text { font-size: 13px; color: var(--zen-ink-light); }

.preview-grid-zen {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;
}
.preview-tile {
  border: 1px solid var(--zen-border); border-radius: 2px; padding: 12px;
  cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; gap: 8px;
}
.preview-tile:hover { border-color: var(--zen-ink-light); }
.preview-tile.is-selected-swap {
  border: 1px solid var(--zen-green); background-color: #f4f8f4;
}
.preview-tile.is-locked { background-color: #f9f9f9; opacity: 0.6; cursor: not-allowed; }

.tile-header { font-size: 13px; color: var(--zen-ink-light); border-bottom: 1px dashed #eee; padding-bottom: 4px;}
.tile-body { display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 600; color: #4a4238;}
.tag-elder { font-size: 11px; background: #fff5e6; color: #d46b08; padding: 1px 4px; border-radius: 2px; }
.tag-warn { font-size: 11px; color: var(--zen-red); }
.p-empty { color: #ccc; font-weight: 400; font-style: italic; }

.modal-actions { display: flex; justify-content: center; gap: 16px; }
.btn-zen {
  width: 120px; padding: 10px; border-radius: 2px; font-size: 14px; cursor: pointer; border: 1px solid transparent;
  font-family: "Noto Serif SC", serif; letter-spacing: 1px;
}
.btn-zen.confirm { background: var(--zen-green); color: white; }
.btn-zen.confirm:hover { background: #4b6350; }
.btn-zen.cancel { background: transparent; border-color: var(--zen-border); color: var(--zen-ink); }
.btn-zen.cancel:hover { background: #f9f9f9; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>