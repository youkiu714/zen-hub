<template>
  <div class="assignment-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon class="title-icon"><House /></el-icon>
            挂单分房
          </h1>
          <p class="page-description">管理待分配房间和床位的人员申请</p>
        </div>
        <div class="header-right">
          <el-button type="primary" size="large" @click="handleBatchAssign" :disabled="selectedRows.length === 0">
            <el-icon><Plus /></el-icon>
            批量分配
          </el-button>
        </div>
      </div>
    </div>

    <!-- Tabs区域 -->
    <div class="tabs-container">
      <el-tabs v-model="activeTab" class="assignment-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="待分配" name="pending">
          <template #label>
            <span class="tab-label">待分配</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已分配" name="assigned">
          <template #label>
            <span class="tab-label">已分配</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已入住" name="checkedIn">
          <template #label>
            <span class="tab-label">已入住</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已退住" name="checkedOut">
          <template #label>
            <span class="tab-label">已退住</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 标题区和操作区 -->
    <div class="content-header">
      <div class="title-section">
        <h2 class="content-title">{{ getTabTitle() }}</h2>
        <p class="content-subtitle">{{ getTabSubtitle() }}</p>
      </div>

      <div class="filter-actions">
        <el-select v-model="genderFilter" placeholder="全部性别" clearable style="width: 150px; margin-right: 16px;">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>

        <el-select v-model="groupFilter" placeholder="全部分组" clearable style="width: 150px; margin-right: 16px;">
          <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
        </el-select>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-card class="table-card">
        <div v-loading="loading" class="table-wrapper">
          <el-table
            :data="assignmentList"
            stripe
            style="width: 100%"
            :empty-text="getEmptyText()"
            @selection-change="handleSelectionChange"
          >
            <!-- 选择列 - 只在待分配tab显示 -->
            <el-table-column v-if="activeTab === 'pending'" type="selection" width="55" />

            <!-- 人员信息列 -->
            <el-table-column prop="name" label="人员信息" min-width="200">
              <template #default="{ row }">
                <div class="person-info">
                  <el-avatar :size="40" icon="User" />
                  <div class="info-text">
                    <div class="name">{{ row.name }}</div>
                    <div class="id-card">身份证号: {{ row.idCardMasked }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 性别列 -->
            <el-table-column prop="gender" label="性别" width="80">
              <template #default="{ row }">
                <el-tag
                  v-if="row.gender"
                  :color="GENDER_MAP[row.gender]?.color"
                  effect="light"
                  size="small"
                >
                  {{ GENDER_MAP[row.gender]?.label }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <!-- 年龄列 -->
            <el-table-column prop="age" label="年龄" width="80">
              <template #default="{ row }">
                <span>{{ row.age !== null && row.age !== undefined ? row.age : '-' }}</span>
              </template>
            </el-table-column>

            <!-- 分组列 -->
            <el-table-column prop="groupName" label="分组" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.groupName" size="small" type="info">{{ row.groupName }}</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <!-- 入住时长列 -->
            <el-table-column prop="stayDays" label="入住时长" width="100">
              <template #default="{ row }">
                <span v-if="row.stayDays !== null && row.stayDays !== undefined">
                  {{ row.stayDays }}天
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <!-- 申请日期列 -->
            <el-table-column prop="applyDate" label="申请日期" width="120">
              <template #default="{ row }">
                <span>{{ formatDate(row.applyDate) || '-' }}</span>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    v-if="activeTab === 'pending'"
                    type="primary"
                    circle
                    @click="handleAssign(row)"
                    title="分配床位"
                  >
                    <el-icon><CirclePlus /></el-icon>
                  </el-button>
                  <el-button
                    type="info"
                    circle
                    @click="handleViewDetails(row)"
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="total > 0" class="pagination-container">
            <span class="pagination-info">显示 {{ pagination.startRow }}-{{ pagination.endRow }} 条, 共 {{ pagination.total }} 条</span>
            <el-pagination
              background
              layout="prev, pager, next, jumper"
              :total="total"
              :page-size="pagination.pageSize"
              :current-page="pagination.currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分配床位弹窗 -->
    <AssignBedModal
      v-model="showAssignBedModal"
      :selected-person="selectedPerson"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { House, Plus, CirclePlus, InfoFilled } from '@element-plus/icons-vue'
import { getPendingAssignments } from '@/api/assignment'
import type { AssignmentListItemVO, AssignmentRequest } from '@/types/assignment'
import { GENDER_MAP, TYPE_MAP } from '@/types/assignment'
import AssignBedModal from '@/components/AssignBed/AssignBedModal.vue'

// 响应式数据
const loading = ref(false)
const assignmentList = ref<AssignmentListItemVO[]>([])
const selectedRows = ref<AssignmentListItemVO[]>([])
const total = ref(0)

// 分配床位弹窗
const showAssignBedModal = ref(false)
const selectedPerson = ref<AssignmentListItemVO | null>(null)

// Tab状态
const activeTab = ref('pending') // 默认激活"待分配"Tab

// 筛选条件
const genderFilter = ref<number | undefined>(undefined)
const groupFilter = ref<string | undefined>(undefined)

// 分组选项
const groupOptions = ref(['第一组', '第二组', '第三组'])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  startRow: 0,
  endRow: 0
})

// 计算属性：根据当前页码和页大小计算显示范围
const paginationRange = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize + 1
  const end = Math.min(start + pagination.pageSize - 1, total.value)
  return { start, end }
})

// 获取Tab标题
const getTabTitle = () => {
  const titles = {
    pending: '待分配人员',
    assigned: '已分配人员',
    checkedIn: '已入住人员',
    checkedOut: '已退住人员'
  }
  return titles[activeTab.value] || '人员列表'
}

// 获取Tab副标题
const getTabSubtitle = () => {
  const subtitles = {
    pending: '需要安排床位的挂单人员列表',
    assigned: '已分配床位但尚未入住的人员列表',
    checkedIn: '已经正式入住的人员列表',
    checkedOut: '已经退住的人员列表'
  }
  return subtitles[activeTab.value] || ''
}

// 获取空数据提示文本
const getEmptyText = () => {
  const texts = {
    pending: '暂无待分配人员',
    assigned: '暂无已分配人员',
    checkedIn: '暂无已入住人员',
    checkedOut: '暂无已退住人员'
  }
  return texts[activeTab.value] || '暂无数据'
}

// 加载数据
const fetchData = async () => {
  try {
    loading.value = true
    const params: AssignmentRequest = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize,
      gender: genderFilter.value,
      groupName: groupFilter.value
    }

    const response = await getPendingAssignments(params)

    console.log(response)

      assignmentList.value = response.records || []
      total.value = response.total || 0
      pagination.currentPage = response.current || 1
      pagination.pageSize = response.size || 10

      // 更新显示范围
      pagination.startRow = paginationRange.value.start
      pagination.endRow = paginationRange.value.end
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// Tab切换处理
const handleTabChange = (tabName: string) => {
  console.log(`切换到Tab: ${tabName}`)
  // 重置分页和筛选条件
  pagination.currentPage = 1
  genderFilter.value = undefined
  groupFilter.value = undefined
  // 根据不同的Tab加载不同的数据
  fetchData()
}

// 分页变化处理
const handlePageChange = (newPage: number) => {
  pagination.currentPage = newPage
  fetchData()
}

// 选择行变化处理
const handleSelectionChange = (selection: AssignmentListItemVO[]) => {
  selectedRows.value = selection
}

// 批量分配
const handleBatchAssign = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要分配的人员')
    return
  }
  ElMessageBox.confirm(
    `确定要为选中的 ${selectedRows.value.length} 位人员进行批量分配吗？`,
    '批量分配',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行批量分配逻辑
    ElMessage.success(`已成功为 ${selectedRows.value.length} 位人员分配床位`)
    // 刷新数据
    fetchData()
  }).catch(() => {
    // 取消操作
  })
}

// 单个分配
const handleAssign = (row: AssignmentListItemVO) => {
  selectedPerson.value = row
  showAssignBedModal.value = true
}

// 查看详情
const handleViewDetails = (row: AssignmentListItemVO) => {
  ElMessage.info(`查看 ${row.name} 的详细信息`)
  // 实际项目中，这里会打开一个详情弹窗或跳转到详情页
}

// 分配成功回调
const handleAssignSuccess = () => {
  ElMessage.success('床位分配成功')
  fetchData() // 刷新列表
}

// 格式化日期
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('zh-CN')
  } catch {
    return dateString
  }
}

// 监听筛选条件变化
watch([genderFilter, groupFilter], () => {
  pagination.currentPage = 1 // 重置到第一页
  fetchData()
}, { deep: true })

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.assignment-management {
  padding: 20px;
  background-color: #fdf6e3; /* 原型图背景色 */
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
}

.page-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Tabs区域样式 */
.tabs-container {
  margin-bottom: 20px;
}

.assignment-tabs {
  :deep(.el-tabs__nav-wrap::after) {
    background-color: #f5f5f5; /* 与原型图一致的浅灰色下划线 */
  }
  :deep(.el-tabs__item) {
    color: #999; /* 原型图Tab文字颜色 */
    font-size: 14px;
    &.is-active {
      color: #8B5E3C; /* 原型图选中Tab的文字颜色 */
      border-bottom-color: #8B5E3C; /* 原型图选中Tab的下划线颜色 */
    }
  }
  :deep(.el-tabs__active-bar) {
    background-color: #8B5E3C; /* 原型图选中Tab的下划线颜色 */
  }
}

.tab-label {
  font-weight: 500;
}

/* 内容区域样式 */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  h2 {
    font-size: 20px;
    color: #333;
    margin: 0;
  }

  .content-subtitle {
    font-size: 14px;
    color: #999;
    margin: 5px 0 0;
  }
}

.filter-actions {
  display: flex;
  align-items: center;
}

/* 表格区域样式 */
.table-container {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.table-wrapper {
  min-height: 400px;
}

/* 人员信息样式 */
.person-info {
  display: flex;
  align-items: center;

  .info-text {
    margin-left: 10px;

    .name {
      font-weight: bold;
      color: #333;
    }

    .id-card {
      font-size: 12px;
      color: #999;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;

  .pagination-info {
    font-size: 14px;
    color: #999;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .assignment-management {
    padding: 10px;
  }

  .page-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .page-title {
    font-size: 24px;
  }

  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .filter-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

/* 表格行悬停效果 */
:deep(.el-table__body tr:hover > td) {
  background-color: #f8f9ff !important;
}

/* 卡片间距 */
:deep(.el-card__body) {
  padding: 24px;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

/* 标签样式优化 */
:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

/* 输入框样式优化 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
}

/* 选择器样式优化 */
:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

/* 分页器样式优化 */
:deep(.el-pagination) {
  .el-pager li {
    border-radius: 6px;
  }

  .btn-prev, .btn-next {
    border-radius: 6px;
  }
}
</style>