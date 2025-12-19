<template>
  <div class="split-layout">
    <div class="sidebar-panel">
      <div class="sidebar-header">

        <div class="filter-container">
          <div class="filter-row mixed-controls">
            <div class="gender-toggle">
              <el-radio-group v-model="filters.gender" size="small">
                <el-radio-button v-for="g in genderOptions" :key="g.value" :label="g.value">
                  {{ g.label }}
                </el-radio-button>
              </el-radio-group>
            </div>

            <div class="group-toggle">
              <el-radio-group v-model="filters.group" size="small">
                <el-radio-button label="">全</el-radio-button>
                <el-radio-button
                  v-for="dept in departmentOptions"
                  :key="dept.value"
                  :label="dept.value"
                >
                  {{ dept.label }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>

        <!-- <div class="status-bar">
          <span class="status-text">
            已选 <span class="count-highlight">{{ selectedIds.length }}</span> 人
          </span>

          <button
            v-if="currentTab === 'assigned' && selectedIds.length > 0"
            class="btn-action-text danger"
            @click="handleUnassign"
          >
            移出房间
          </button>
          <button
            v-else
            class="btn-action-text"
            :disabled="selectedIds.length === 0"
            @click="clearSelection"
          >
            取消选择
          </button>
        </div> -->
      </div>
      <div
        ref="scrollRef"
        class="member-list-scroll"
        v-loading="loading"
        @scroll="handleScroll"
      >
        <div class="virtual-spacer" :style="{ height: topPadding + 'px' }"></div>

        <MemberCard
          v-for="item in visibleMembers"
          :key="(item as any).__key"
          :member="item"
          :is-selected="selectedIds.includes(getSelectId(item))"
          :show-room-info="currentTab === 'assigned'"
          @toggle-selection="() => toggleSelection(getSelectId(item), item)"
        />

        <div class="virtual-spacer" :style="{ height: bottomPadding + 'px' }"></div>
      </div>
      <div v-if="!loading && filteredMembers.length === 0" class="empty-state">暂无数据</div>
    </div>

    <div class="main-content">
      <div class="room-grid"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import MemberCard from '@/components/MemberCard.vue'
import { getPendingAssignments, getAssignedList } from '@/api/assignment'
import type { AssignmentListItemVO, AssignedLodgingVO } from '@/types/assignment'
import { departmentOptions, DepartmentMap } from '@/utils/constants'

const emits = defineEmits(['addMember'])

type MemberKey = string | number
type MemberWithKey<T> = T & { __key: MemberKey }

// --- 数据状态 ---
const allUnassignedMembers = ref<AssignmentListItemVO[]>([]) // 存储所有待分配数据
const allAssignedMembers = ref<AssignedLodgingVO[]>([]) // 存储所有已分配数据
const loading = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const itemHeight = 88 // 80px 卡片 + 8px 间距
const overscanCount = 6
const reachEndThreshold = 100

const scrollTop = ref(0)
const viewportHeight = ref(0)
let resizeObserver: ResizeObserver | null = null

// --- 分页状态 ---
const pageSize = 10
const unassignedPage = ref(1)
const assignedPage = ref(1)
const hasMoreUnassigned = ref(true)
const hasMoreAssigned = ref(true)

const inflightUnassignedPage = ref<number | null>(null)
const inflightAssignedPage = ref<number | null>(null)

const selectedMembers = ref<Array<AssignmentListItemVO | AssignedLodgingVO>>([])

// --- 状态管理 ---
const currentTab = ref('unassigned') // 'unassigned' | 'assigned'
const selectedIds = ref<MemberKey[]>([])
const filters = ref({ dateRange: null, gender: 'all', group: '' })

const genderOptions = [
  { label: '全', value: 'all' },
  { label: '男', value: 'M' },
  { label: '女', value: 'F' }
]

const getMemberKey = (member: any): MemberKey => {
  return (
    member?.applicationId ??
    member?.personId ??
    member?.bedStayId ??
    member?.id ??
    `${member?.idCardMasked ?? ''}-${member?.name ?? 'member'}-${member?.checkinDate ?? ''}-${member?.checkoutDate ?? ''}`
  )
}

const normalizeMembers = <T extends Record<string, any>>(
  records: Array<T | null | undefined>,
  _baseIndex: number
): Array<MemberWithKey<T>> => {
  const used = new Map<MemberKey, number>()
  return records
    .filter(Boolean)
    .map((member) => {
      const baseKey = getMemberKey(member)
      const count = used.get(baseKey) ?? 0
      used.set(baseKey, count + 1)
      const uniqueKey = count === 0 ? baseKey : `${baseKey}-${count}`
      return { ...(member as T), __key: uniqueKey }
    })
}

const getSelectId = (member: any): MemberKey => {
  return member?.applicationId ?? member?.__key
}

const mergeUnique = <T extends { __key?: MemberKey }>(
  existing: T[],
  incoming: T[]
): T[] => {
  const seen = new Set<MemberKey>()
  for (const item of existing) {
    const key = (item as any)?.applicationId ?? (item as any)?.__key
    if (key != null) seen.add(key)
  }

  const merged = [...existing]
  for (const item of incoming) {
    const key = (item as any)?.applicationId ?? (item as any)?.__key
    if (key == null || seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }
  return merged
}


const filteredMembers = computed(() => {
  const source =
    currentTab.value === 'unassigned' ? allUnassignedMembers.value : allAssignedMembers.value

  return source.filter((m) => {
    if (filters.value.gender !== 'all') {
      const memberGender = (m as any)?.gender
      if (memberGender !== filters.value.gender) return false
    }
    if (filters.value.group) {
      const memberDepartmentCode = (m as any)?.departmentCode
      if (memberDepartmentCode) {
        if (memberDepartmentCode !== filters.value.group) return false
      } else {
        const memberGroupName = (m as any)?.group
        const selectedLabel = DepartmentMap[filters.value.group] ?? filters.value.group
        if (memberGroupName && memberGroupName !== selectedLabel) return false
      }
    }
    return true
  })
})

const startIndex = computed(() => {
  const raw = Math.floor(scrollTop.value / itemHeight) - overscanCount
  return Math.max(0, raw)
})

const endIndex = computed(() => {
  const raw = Math.ceil((scrollTop.value + viewportHeight.value) / itemHeight) + overscanCount
  return Math.min(filteredMembers.value.length, raw)
})

const visibleMembers = computed(() => {
  return filteredMembers.value.slice(startIndex.value, endIndex.value)
})

const topPadding = computed(() => startIndex.value * itemHeight)
const bottomPadding = computed(() => (filteredMembers.value.length - endIndex.value) * itemHeight)

const fetchUnassigned = async (append = false) => {
  try {
    const pageNo = append ? unassignedPage.value : 1
    if (loading.value) return
    if (inflightUnassignedPage.value === pageNo) return

    inflightUnassignedPage.value = pageNo
    loading.value = true
    const params = {
      pageNo,
      pageSize,
      keyword: ''
    }
    const response = await getPendingAssignments(params)
    const records = response?.records || response?.data?.records || []
    const normalized = normalizeMembers(records, append ? allUnassignedMembers.value.length : 0)

    allUnassignedMembers.value = append
      ? (mergeUnique(allUnassignedMembers.value as any, normalized as any) as any)
      : (normalized as any)
    hasMoreUnassigned.value = normalized.length === pageSize
    if (hasMoreUnassigned.value) unassignedPage.value += 1
  } catch (error) {
    console.error('获取待分配人员列表失败:', error)
  } finally {
    inflightUnassignedPage.value = null
    loading.value = false
  }
}

const fetchAssignedMembers = async (append = false) => {
  try {
    const pageNo = append ? assignedPage.value : 1
    if (loading.value) return
    if (inflightAssignedPage.value === pageNo) return

    inflightAssignedPage.value = pageNo
    loading.value = true
    const params = {
      pageNo,
      pageSize,
      keyword: ''
    }
    const response = await getAssignedList(params)
    const records = response?.records || response?.data?.records || []
    const normalized = normalizeMembers(records, append ? allAssignedMembers.value.length : 0)
    allAssignedMembers.value = append
      ? (mergeUnique(allAssignedMembers.value as any, normalized as any) as any)
      : (normalized as any)
    hasMoreAssigned.value = normalized.length === pageSize
    if (hasMoreAssigned.value) assignedPage.value += 1
  } catch (error) {
    console.error('获取已分配人员列表失败:', error)
  } finally {
    inflightAssignedPage.value = null
    loading.value = false
  }
}

const fetchData = () => {
  if (currentTab.value === 'unassigned') {
    unassignedPage.value = 1
    hasMoreUnassigned.value = true
    fetchUnassigned(false)
  } else {
    assignedPage.value = 1
    hasMoreAssigned.value = true
    fetchAssignedMembers(false)
  }
}

const handleReachEnd = async () => {
  if (loading.value) return
  if (currentTab.value === 'unassigned' && hasMoreUnassigned.value) {
    await fetchUnassigned(true)
  } else if (currentTab.value === 'assigned' && hasMoreAssigned.value) {
    await fetchAssignedMembers(true)
  }
}

const updateViewport = () => {
  if (!scrollRef.value) return
  viewportHeight.value = scrollRef.value.clientHeight
}

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return
  scrollTop.value = target.scrollTop

  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight
  if (!loading.value && distanceToBottom <= reachEndThreshold) {
    handleReachEnd()
  }
}

watch(selectedMembers, () => emits('addMember', selectedMembers.value), { deep: true })

// 切换选中状态的函数
const toggleSelection = (id: MemberKey, item: any) => {
  const idx = selectedIds.value.indexOf(id);
  
  if (idx > -1) {
    selectedIds.value.splice(idx, 1);
    selectedMembers.value.splice(idx, 1);
  } else {
    selectedIds.value.push(id);
    selectedMembers.value.push(item);
  }
};

const clearSelection = () => (selectedIds.value = [])

const handleUnassign = () => {
  alert(`将 ${selectedIds.value.length} 人移出房间，变为待分配状态`)
  // 实际逻辑：API请求 -> 成功后将数据从 assigned 移到 unassigned
  clearSelection()
}

watch(
  [filters],
  () => {
    resetScroll()
  },
  { deep: true }
)

const resetScroll = () => {
  if (scrollRef.value) scrollRef.value.scrollTop = 0
  scrollTop.value = 0
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchData()
  await nextTick()
  updateViewport()
  if (scrollRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => updateViewport())
    resizeObserver.observe(scrollRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.split-layout {
  display: flex;
  /* height: calc(100vh - 170px); */
  background: #f5f7fa;
  font-family: sans-serif;
  border-radius: 12px;
}
.sidebar-panel {
  width: 290px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* === Header 区域 === */
.sidebar-header {
  background: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* === 1. 页签切换器 (Tab Switcher) === */
.tab-switcher {
  display: flex;
  position: relative;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 4px;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  padding: 6px 0;
  cursor: pointer;
  z-index: 2;
  position: relative;
  transition: color 0.2s;
}

.tab-item.active {
  color: #111827;
  font-weight: 600;
}

.tab-count {
  font-size: 12px;
  margin-left: 2px;
  opacity: 0.8;
}
.tab-count.sub {
  color: #999;
} /* 非选中态淡一点 */
.tab-item.active .tab-count {
  color: #1890ff;
  font-weight: bold;
}

/* 背景滑块动画 (简单实现，实际可用 left/width 动态计算) */
.tab-glider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  z-index: 1;
}
.tab-glider.unassigned {
  transform: translateX(0);
}
.tab-glider.assigned {
  transform: translateX(100%);
  left: 4px; /* offset adjust */
}

/* === 2. 筛选容器 === */
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 样式复用之前的... */
.icon-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0 8px;
  height: 32px;
}
.custom-select {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 12px;
  appearance: none;
  outline: none;
}
.mixed-controls {
  justify-content: space-between;
}
.gender-toggle {
  display: flex;
  border-radius: 6px;
  padding: 2px;
  height: 28px;
  align-items: center;
  background: transparent;
  border: 1px solid var(--el-border-color-light);
}
.group-toggle {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  height: 28px;
  padding: 2px;
  flex: 1;
  overflow: hidden;
}
.gender-toggle :deep(.el-radio-group) {
  display: flex;
  width: 100%;
}
.group-toggle :deep(.el-radio-group) {
  display: flex;
  flex: 1;
  width: 100%;
}
.gender-toggle :deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: none;
}
.group-toggle :deep(.el-radio-button) {
  flex: 1;
}
.group-toggle :deep(.el-radio-button__inner) {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #6b7280;
  padding: 4px 6px;
  border-radius: 4px;
  box-shadow: none;
  text-align: center;
}
.gender-toggle :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  box-shadow: none;
}
.group-toggle :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #fff;
  color: #1890ff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.gender-toggle :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.gender-toggle :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.group-toggle :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.group-toggle :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* === 3. 状态栏 === */
.status-bar {
  background-color: #e6f7ff;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-top: 4px;
}
.status-text {
  color: #0050b3;
}
.count-highlight {
  font-weight: bold;
}
.btn-action-text {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
}
.btn-action-text:hover {
  color: #333;
}
.btn-action-text.danger {
  color: #ff4d4f;
} /* 红色操作 */
.btn-action-text.danger:hover {
  color: #cf1322;
}

/* === 列表区域 === */
.member-list-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  position: relative;
}

.member-list-scroll :deep(.member-card) {
  margin-bottom: 8px;
}

.virtual-spacer {
  width: 100%;
}

/* 虚拟滚动容器 */
.virtual-scroll-content {
  position: relative;
}

.virtual-list {
  position: relative;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
  gap: 8px;
}

.loading-state .el-icon {
  font-size: 24px;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
  font-size: 13px;
  width: 100%;
}
</style>
