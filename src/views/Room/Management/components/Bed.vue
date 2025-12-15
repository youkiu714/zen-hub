<template>
  <div class="split-layout">
    <div class="sidebar-panel">
      <div class="sidebar-header">
        <div class="tab-switcher">
          <div
            class="tab-item"
            :class="{ active: currentTab === 'unassigned' }"
            @click="switchTab('unassigned')"
          >
            待分配
            <span class="tab-count">{{
              currentTab === 'unassigned'
                ? allUnassignedMembers.length
                : allUnassignedMembers.length
            }}</span>
          </div>
          <div
            class="tab-item"
            :class="{ active: currentTab === 'assigned' }"
            @click="switchTab('assigned')"
          >
            已分配
            <span class="tab-count sub">{{
              currentTab === 'assigned' ? allAssignedMembers.length : allAssignedMembers.length
            }}</span>
          </div>
          <div class="tab-glider" :class="currentTab"></div>
        </div>

        <div class="filter-container">
          <div class="filter-row">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              size="default"
              style="width: 100%"
            />
          </div>
          <div class="filter-row mixed-controls">
            <div class="gender-toggle">
              <button
                v-for="g in genderOptions"
                :key="g.value"
                :class="{ active: filters.gender === g.value }"
                @click="filters.gender = g.value"
              >
                {{ g.label }}
              </button>
            </div>
            <div class="mini-select-wrapper group-select">
              <select v-model="filters.group" class="custom-select mini">
                <option value="汇编">汇编</option>
                <option value="短住">短住</option>
              </select>
            </div>
          </div>
        </div>

        <div class="status-bar">
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
        </div>
      </div>
      <RecycleScroller
        ref="scrollerRef"
        class="member-list-scroll"
        :items="filteredMembers"
        :item-size="itemHeight"
        :min-item-size="itemHeight"
        :buffer="bufferSize"
        key-field="applicationId"
        v-loading="loading"
        @scroll="handleRecycleScroll"
      >
        <template #default="{ item }">
          <MemberCard
            :member="item"
            :is-selected="selectedIds.includes(item.applicationId)"
            :show-room-info="currentTab === 'assigned'"
            @toggle-selection="() => toggleSelection(item.applicationId, item)"
          />
        </template>
      </RecycleScroller>
      <div v-if="!loading && filteredMembers.length === 0" class="empty-state">暂无数据</div>
    </div>

    <div class="main-content">
      <div class="room-grid"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import MemberCard from '@/components/MemberCard.vue'
import { getPendingAssignments, getAssignedList } from '@/api/assignment'
import type { AssignmentListItemVO, AssignedLodgingVO } from '@/types/assignment'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const emits = defineEmits(['addMember'])

// --- 数据状态 ---
const allUnassignedMembers = ref<AssignmentListItemVO[]>([]) // 存储所有待分配数据
const allAssignedMembers = ref<AssignedLodgingVO[]>([]) // 存储所有已分配数据
const loading = ref(false)
const scrollerRef = ref<InstanceType<typeof RecycleScroller> | null>(null)
const itemHeight = 80
const bufferSize = 6
const reachEndThreshold = 100

// --- 分页状态 ---
const pageSize = 10
const unassignedPage = ref(1)
const assignedPage = ref(1)
const hasMoreUnassigned = ref(true)
const hasMoreAssigned = ref(true)

const selectedMembers = ref([])

// --- 状态管理 ---
const currentTab = ref('unassigned') // 'unassigned' | 'assigned'
const selectedIds = ref<number[]>([])
const filters = ref({ dateRange: null, gender: 'all', group: '' })

const genderOptions = [
  { label: '全', value: 'all' },
  { label: '男', value: 'M' },
  { label: '女', value: 'F' }
]

const filteredMembers = computed(() => {
  const source =
    currentTab.value === 'unassigned' ? allUnassignedMembers.value : allAssignedMembers.value

  return source.filter((m) => {
    if (filters.value.gender !== 'all' && m.gender !== filters.value.gender) return false
    if (filters.value.group && m.group !== filters.value.group) return false
    return true
  })
})

const fetchUnassigned = async (append = false) => {
  try {
    if (loading.value) return
    loading.value = true
    const params = {
      pageNo: append ? unassignedPage.value : 1,
      pageSize,
      keyword: ''
    }
    const response = await getPendingAssignments(params)
    const records = response?.records || []

    allUnassignedMembers.value = append ? [...allUnassignedMembers.value, ...records] : records
    hasMoreUnassigned.value = records.length === pageSize
    if (hasMoreUnassigned.value) unassignedPage.value += 1
  } catch (error) {
    console.error('获取待分配人员列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchAssignedMembers = async (append = false) => {
  try {
    if (loading.value) return
    loading.value = true
    const params = {
      pageNo: append ? assignedPage.value : 1,
      pageSize,
      keyword: ''
    }
    const response = await getAssignedList(params)
    const records = response?.data?.records || []
    allAssignedMembers.value = append ? [...allAssignedMembers.value, ...records] : records
    hasMoreAssigned.value = records.length === pageSize
    if (hasMoreAssigned.value) assignedPage.value += 1
  } catch (error) {
    console.error('获取已分配人员列表失败:', error)
  } finally {
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

const handleRecycleScroll = (event: Event | { target?: HTMLElement }) => {
  const target = (event as any)?.target as HTMLElement
  if (!target) return
  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight
  if (!loading.value && distanceToBottom <= reachEndThreshold) {
    handleReachEnd()
  }
}

const switchTab = (tab: string) => {
  currentTab.value = tab
  selectedIds.value = []
  fetchData()
  resetScroll()
}

watch(selectedMembers.value, () => emits('addMember', selectedMembers.value))

// 切换选中状态的函数
const toggleSelection = (id: number, item: any) => {
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
  scrollerRef.value?.scrollToPosition(0)
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchData()
  await nextTick()
})
</script>

<style scoped>
.split-layout {
  display: flex;
  height: calc(100vh - 170px);
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
}

/* === Header 区域 === */
.sidebar-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 16px 10px 16px;
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
  background: #f3f4f6;
  border-radius: 6px;
  padding: 2px;
}
.gender-toggle button {
  border: none;
  background: none;
  font-size: 12px;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.gender-toggle button.active {
  background: white;
  color: #1890ff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.mini-select-wrapper {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 4px;
  flex: 1;
}
.custom-select.mini {
  text-align: center;
  text-align-last: center;
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
