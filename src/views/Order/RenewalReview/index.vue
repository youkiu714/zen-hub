<template>
  <div class="renewal-review">
    <!-- 页面头部 -->
    <PageHeader title="续单审核" description="审核各种类型的续单申请" />

    <!-- 搜索筛选区域 -->
    <div class="filter-container">
      <SearchFilter @filter-change="handleFilterChange" />
    </div>

    <!-- 状态标签页 -->
    <div class="tabs-container">
      <StatusTabs
        :model-value="activeTab"
        :tabs="statusTabs"
        @update:model-value="handleTabChange"
        @tab-change="handleTabChange"
      />
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        empty-text="暂无数据"
      >
        <!-- 申请人 -->
        <el-table-column label="申请人" width="120" align="center">
          <template #default="{ row }">
            <div class="applicant-cell">
              <el-avatar
                :src="row.avatar || ''"
                :size="40"
                class="applicant-avatar"
              >
                {{ row.applicant.charAt(0) }}
              </el-avatar>
              <span class="applicant-name">{{ row.applicant }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 身份证号 -->
        <el-table-column label="身份证号" width="180" align="center">
          <template #default="{ row }">
            <span class="id-card">{{ formatIdCard(row.idCard) }}</span>
          </template>
        </el-table-column>

        <!-- 申请类型 -->
        <el-table-column label="申请类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getApplicationTypeTag(row.applicationType)">
              {{ getApplicationTypeLabel(row.applicationType) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 原挂单日期 -->
        <el-table-column label="原挂单日期" width="220" align="center">
          <template #default="{ row }">
            <span>{{ formatDateRange(row.originalStartDate, row.originalEndDate) }}</span>
          </template>
        </el-table-column>

        <!-- 续单日期 -->
        <el-table-column label="续单日期" width="220" align="center">
          <template #default="{ row }">
            <span>{{ formatDateRange(row.renewalStartDate, row.renewalEndDate) }}</span>
          </template>
        </el-table-column>

        <!-- 续住天数 -->
        <el-table-column label="续住天数" width="100" align="center">
          <template #default="{ row }">
            <span class="stay-days">{{ row.renewalDays }}天</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleViewDetail(row)"
              >
                查看
              </el-button>
              <el-button
                v-if="canReview(row.status)"
                type="success"
                size="small"
                link
                @click="handleReview(row)"
              >
                审核
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 查看详情对话框 -->
    <RenewalDetailDialog
      v-model="detailDialogVisible"
      :order-data="selectedOrder"
    />

    <!-- 审核对话框 -->
    <ReviewDialog
      :visible="reviewDialogVisible"
      :order-data="selectedOrder"
      @close="reviewDialogVisible = false"
      @confirm="handleReviewConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import SearchFilter from '../components/SearchFilter.vue'
import StatusTabs from '../components/StatusTabs.vue'
import RenewalDetailDialog from './components/RenewalDetailDialog.vue'
import ReviewDialog from '../components/ReviewDialog.vue'
import type {
  OrderApplication,
  FilterOptions,
  TabConfig,
  PaginationConfig,
  ApplicationStatus
} from '../types'

// 响应式数据
const loading = ref(false)
const activeTab = ref('pending_review')
const detailDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const selectedOrder = ref<OrderApplication | null>(null)

// 分页配置
const pagination = reactive<PaginationConfig>({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

// 筛选条件
const currentFilters = ref<FilterOptions>({
  applicationType: '',
  dateRange: '',
  searchKeyword: ''
})

// 状态标签页配置
const statusTabs = ref<TabConfig[]>([
  { name: 'pending_review', label: '待审核', count: 0 },
  { name: 'pending_monk', label: '待法师审核', count: 0 },
  { name: 'approved', label: '已通过', count: 0 },
  { name: 'rejected', label: '已驳回', count: 0 }
])

// 表格数据
const tableData = ref<OrderApplication[]>([])

// 模拟数据
const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const yesterdayStr = yesterday.toISOString().split('T')[0]

const mockData: OrderApplication[] = [
  {
    id: '1',
    applicant: '张三',
    avatar: '', // https://via.placeholder.com/40
    applicationType: 'short_stay',
    originalStartDate: '2023-07-01',
    originalEndDate: '2023-07-15',
    renewalStartDate: todayStr,
    renewalEndDate: '2023-07-30',
    renewalDays: 15,
    status: 'pending_review',
    idCard: '110101199001011234',
    phone: '13800138000',
    reason: '需要继续学修',
    remark: '表现良好'
  },
  {
    id: '2',
    applicant: '李四',
    applicationType: 'express',
    originalStartDate: '2023-07-01',
    originalEndDate: '2023-07-10',
    renewalStartDate: '2023-07-11',
    renewalEndDate: '2023-07-25',
    renewalDays: 14,
    status: 'pending_monk',
    idCard: '110101199002022345',
    phone: '13800138001'
  },
  {
    id: '3',
    applicant: '王五',
    applicationType: 'monk_family',
    originalStartDate: '2023-06-15',
    originalEndDate: '2023-07-15',
    renewalStartDate: '2023-07-16',
    renewalEndDate: '2023-08-15',
    renewalDays: 30,
    status: 'approved',
    idCard: '110101199003033456',
    phone: '13800138002'
  },
  {
    id: '4',
    applicant: '赵六',
    applicationType: 'team',
    originalStartDate: '2023-07-01',
    originalEndDate: '2023-07-20',
    renewalStartDate: '2023-07-21',
    renewalEndDate: '2023-08-10',
    renewalDays: 20,
    status: 'rejected',
    idCard: '110101199004044567',
    phone: '13800138003',
    reason: '申请续住时间过长'
  },
  {
    id: '5',
    applicant: '孙七',
    applicationType: 'special',
    originalStartDate: '2023-07-05',
    originalEndDate: '2023-07-20',
    renewalStartDate: '2023-07-21',
    renewalEndDate: '2023-08-05',
    renewalDays: 15,
    status: 'pending_review',
    idCard: '110101199005055678',
    phone: '13800138004'
  }
]

// 计算属性
const filteredData = computed(() => {
  let data = mockData.filter(item => item.status === activeTab.value)

  // 根据搜索条件过滤
  if (currentFilters.value.searchKeyword) {
    const keyword = currentFilters.value.searchKeyword.toLowerCase()
    data = data.filter(item =>
      item.applicant.toLowerCase().includes(keyword) ||
      item.idCard.includes(keyword)
    )
  }

  // 根据申请类型过滤
  if (currentFilters.value.applicationType) {
    data = data.filter(item => item.applicationType === currentFilters.value.applicationType)
  }

  // 根据日期范围过滤
  if (currentFilters.value.dateRange) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    data = data.filter(item => {
      if (!item.renewalStartDate) return true

      const renewalDate = new Date(item.renewalStartDate)

      switch (currentFilters.value.dateRange) {
        case 'today':
          return renewalDate.toDateString() === today.toDateString()
        case 'this_week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return renewalDate >= weekStart && renewalDate <= weekEnd
        case 'this_month':
          return renewalDate.getMonth() === today.getMonth() &&
                 renewalDate.getFullYear() === today.getFullYear()
        case 'this_quarter':
          const quarter = Math.floor(today.getMonth() / 3)
          const quarterStart = new Date(today.getFullYear(), quarter * 3, 1)
          const quarterEnd = new Date(today.getFullYear(), (quarter + 1) * 3, 0)
          return renewalDate >= quarterStart && renewalDate <= quarterEnd
        default:
          return true
      }
    })
  }

  return data
})

// 方法
const fetchData = () => {
  loading.value = true

  // 模拟API请求
  setTimeout(() => {
    const data = filteredData.value
    tableData.value = data.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    )
    pagination.total = data.length

    // 更新标签页计数
    statusTabs.value.forEach(tab => {
      tab.count = mockData.filter(item => item.status === tab.name).length
    })

    loading.value = false
  }, 500)
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  pagination.currentPage = 1
  fetchData()
}

const handleFilterChange = (filters: FilterOptions) => {
  currentFilters.value = { ...filters }
  pagination.currentPage = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  pagination.currentPage = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchData()
}

const handleViewDetail = (row: OrderApplication) => {
  selectedOrder.value = row
  detailDialogVisible.value = true
}

const handleReview = (row: OrderApplication) => {
  selectedOrder.value = row
  reviewDialogVisible.value = true
}

const handleReviewConfirm = (result: { approved: boolean; comment: string }) => {
  if (selectedOrder.value) {
    // 模拟审核操作
    const newStatus = result.approved ? 'approved' : 'rejected'
    const index = mockData.findIndex(item => item.id === selectedOrder.value?.id)
    if (index !== -1) {
      mockData[index].status = newStatus
      mockData[index].remark = result.comment
    }

    ElMessage.success(`审核${result.approved ? '通过' : '驳回'}成功`)
    reviewDialogVisible.value = false
    selectedOrder.value = null
    fetchData()
  }
}

// 工具方法
const formatIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 10) return idCard
  return `${idCard.slice(0, 6)}****${idCard.slice(-4)}`
}

const formatDateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return '-'
  return `${startDate} 至 ${endDate}`
}

const getApplicationTypeLabel = (type: string) => {
  const typeMap = {
    'short_stay': '短住',
    'express': '直通车',
    'monk_family': '僧亲',
    'team': '团队挂单',
    'special': '特殊客人'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

const getApplicationTypeTag = (type: string) => {
  const tagMap = {
    'short_stay': '',
    'express': 'success',
    'monk_family': 'warning',
    'team': 'info',
    'special': 'danger'
  }
  return tagMap[type as keyof typeof tagMap] || ''
}

const getStatusLabel = (status: string) => {
  const statusMap = {
    'pending_review': '待审核',
    'pending_monk': '待法师审核',
    'approved': '已通过',
    'rejected': '已驳回'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    'pending_review': 'warning',
    'pending_monk': 'info',
    'approved': 'success',
    'rejected': 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || ''
}

const canReview = (status: ApplicationStatus) => {
  return status === 'pending_review' || status === 'pending_monk'
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.renewal-review {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.filter-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tabs-container {
  background: white;
  border-radius: 8px;
  padding: 20px 20px 0 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: right;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.applicant-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .applicant-avatar {
    flex-shrink: 0;
  }

  .applicant-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
}

.id-card {
  font-family: 'Courier New', monospace;
  color: #606266;
  font-size: 13px;
}

.stay-days {
  font-weight: 600;
  color: #409eff;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.el-table) {
  .el-table__header-wrapper {
    background: #fafafa;
  }

  .el-table__body-wrapper {
    .el-table__row {
      &:hover {
        background: #f5f7fa;
      }
    }
  }
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-pagination) {
  justify-content: flex-end;
}

// 响应式设计
@media (max-width: 768px) {
  .renewal-review {
    padding: 16px;
  }

  .filter-container,
  .tabs-container,
  .table-container,
  .pagination-container {
    padding: 16px;
    margin-bottom: 12px;
  }

  .applicant-cell {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>