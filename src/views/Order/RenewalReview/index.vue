<template>
  <div class="renewal-review">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">续单审核</h1>
      <p class="page-description">对已入住挂单人发起的续单申请进行审核管理，客堂义工需填写在寺表现并提交给客堂法师审核</p>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="filter-container">
      <div class="filter-header">
        <h3 class="filter-title">续单申请列表</h3>
      </div>
      <div class="filter-controls">
        <div class="search-box">
          <el-input
            v-model="currentFilters.keyword"
            placeholder="搜索申请人姓名或身份证号"
            clearable
            @input="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select
          v-model="currentFilters.type"
          placeholder="全部申请类型"
          clearable
          @change="handleFilterChange"
          style="width: 150px"
        >
          <el-option label="短住" value="1" />
          <el-option label="直通车" value="2" />
          <el-option label="僧亲" value="3" />
          <el-option label="团队挂单" value="4" />
          <el-option label="特殊客人" value="5" />
        </el-select>
        <el-select
          v-model="currentFilters.dateRange"
          placeholder="全部日期"
          clearable
          @change="handleFilterChange"
          style="width: 150px"
        >
          <el-option label="今天" value="today" />
          <el-option label="本周" value="this_week" />
          <el-option label="本月" value="this_month" />
          <el-option label="本季度" value="this_quarter" />
        </el-select>
      </div>
    </div>

    <!-- 状态标签页 -->
    <div class="tabs-container">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane
          v-for="tab in statusTabs"
          :key="tab.name"
          :label="`${tab.label} (${tab.count})`"
          :name="tab.name"
        >
        </el-tab-pane>
      </el-tabs>
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
                :size="32"
                class="applicant-avatar"
              >
                {{ row.applicantName?.charAt(0) || '申' }}
              </el-avatar>
              <span class="applicant-name">{{ row.applicantName || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 身份证号 -->
        <el-table-column label="身份证号" width="180" align="center">
          <template #default="{ row }">
            <span class="id-card">{{ formatIdCard(row.idCardMasked) }}</span>
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
            <span>{{ formatDateRange(row.checkinDate, row.checkoutDate) }}</span>
          </template>
        </el-table-column>

        <!-- 续单日期 -->
        <el-table-column label="续单日期" width="220" align="center">
          <template #default="{ row }">
            <span>{{ formatDateRange(row.checkinDate, row.checkoutDate) }}</span>
          </template>
        </el-table-column>

        <!-- 续住天数 -->
        <el-table-column label="续住天数" width="100" align="center">
          <template #default="{ row }">
            <span class="stay-days">{{ row.days || 0 }}天</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.reviewStatus)">
              {{ getStatusLabel(row.reviewStatus) }}
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
                v-if="canReview(row.reviewStatus)"
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
      <div class="pagination-wrapper">
        <div class="pagination-info">
          显示 {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }} 至 {{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} 条，共 {{ pagination.total }} 条
        </div>
        <div class="pagination-controls">
          <el-pagination
            :current-page="pagination.currentPage"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[5, 10, 20, 50]"
            layout="prev, pager, next"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
          <div class="pagination-sizes">
            <span class="sizes-label">每页显示</span>
            <el-select
              :model-value="pagination.pageSize"
              @update:model-value="handleSizeChange"
              size="small"
              style="width: 80px"
            >
              <el-option
                v-for="size in [5, 10, 20, 50]"
                :key="size"
                :label="size"
                :value="size"
              />
            </el-select>
            <span class="sizes-label">条</span>
          </div>
        </div>
      </div>
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
import { Search } from '@element-plus/icons-vue'
import { getReviews, reception } from '@/api/review'
import {
  ReviewListItemVO,
  ReviewListResponse,
  ApplicationTypeMap,
  ReviewStatusMap
} from '@/types/review'

// 响应式数据
const loading = ref(false)
const activeTab = ref('10') // 使用数字状态码
const detailDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const selectedOrder = ref<ReviewListItemVO | null>(null)

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 筛选条件
const currentFilters = ref({
  keyword: '',
  type: '', // 申请类型数字
  dateRange: '',
  status: '10' // 状态码
})

// 表格数据
const tableData = ref<ReviewListItemVO[]>([])

// 所有数据（用于计算标签页计数）
const allData = ref<ReviewListItemVO[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true

  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : parseInt(activeTab.value)
    }

    // 添加搜索关键词
    if (currentFilters.value.keyword) {
      params.keyword = currentFilters.value.keyword
    }

    // 添加申请类型筛选
    if (currentFilters.value.type) {
      params.type = parseInt(currentFilters.value.type)
    }

    // 处理日期范围筛选
    if (currentFilters.value.dateRange) {
      const today = new Date()
      switch (currentFilters.value.dateRange) {
        case 'today':
          params.startFrom = today.toISOString().split('T')[0]
          params.startTo = today.toISOString().split('T')[0]
          break
        case 'this_week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          params.startFrom = weekStart.toISOString().split('T')[0]
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          params.startTo = weekEnd.toISOString().split('T')[0]
          break
        case 'this_month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          params.startFrom = monthStart.toISOString().split('T')[0]
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          params.startTo = monthEnd.toISOString().split('T')[0]
          break
        case 'this_quarter':
          const quarter = Math.floor(today.getMonth() / 3)
          const quarterStart = new Date(today.getFullYear(), quarter * 3, 1)
          params.startFrom = quarterStart.toISOString().split('T')[0]
          const quarterEnd = new Date(today.getFullYear(), (quarter + 1) * 3, 0)
          params.startTo = quarterEnd.toISOString().split('T')[0]
          break
      }
    }

    const response = await getReviews(params)
    console.log(response);
    tableData.value = response

    // if (response.code === 200 && response.data) {
    //   tableData.value = response.data
    //   // 这里API没有返回总数，暂时使用当前数据长度
    //   pagination.total = response.data.length

    //   // 如果需要获取所有数据来计算标签页计数
    //   if (allData.value.length === 0) {
    //     await fetchAllData()
    //   }
    // } else {
    //   ElMessage.error(response.message || '获取数据失败')
    //   tableData.value = []
    // }
  } catch (error) {
    console.error('获取续单审核数据失败:', error)
    ElMessage.error('获取数据失败，请检查网络连接')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 获取所有数据用于计算标签页计数
const fetchAllData = async () => {
  try {
    const response = await getReviews({
      pageNo: 1,
      pageSize: 1000 // 获取足够多的数据
    })

    if (response.code === 200 && response.data) {
      allData.value = response.data
    }
  } catch (error) {
    console.error('获取所有数据失败:', error)
  }
}

// 标签页计数
const tabCounts = computed(() => {
  const counts = {
    '10': 0, // 待审核
    '20': 0, // 待法师审核
    '30': 0, // 已通过
    '40': 0  // 已驳回
  }

  allData.value.forEach(item => {
    if (item.reviewStatus && counts[item.reviewStatus] !== undefined) {
      counts[item.reviewStatus]++
    }
  })

  return counts
})

// 状态标签页配置
const statusTabs = computed(() => [
  { name: '10', label: '待审核', count: tabCounts.value['10'] },
  { name: '20', label: '待法师审核', count: tabCounts.value['20'] },
  { name: '30', label: '已通过', count: tabCounts.value['30'] },
  { name: '40', label: '已驳回', count: tabCounts.value['40'] }
])

// 事件处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  pagination.currentPage = 1
  fetchData()
}

const handleFilterChange = () => {
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

const handleViewDetail = (row: ReviewListItemVO) => {
  selectedOrder.value = row
  detailDialogVisible.value = true
}

const handleReview = (row: ReviewListItemVO) => {
  selectedOrder.value = row
  reviewDialogVisible.value = true
}

const handleReviewConfirm = async (result: { approved: boolean; comment: string }) => {
  if (selectedOrder.value) {
    try {
      loading.value = true

      const response = await reception({
        pass: result.approved,
        comment: result.comment
      }, selectedOrder.value.id!)

      if (response.code === 200) {
        ElMessage.success(`审核${result.approved ? '通过' : '驳回'}成功`)
        reviewDialogVisible.value = false
        selectedOrder.value = null
        fetchData()
      } else {
        ElMessage.error(response.message || '审核失败')
      }
    } catch (error) {
      console.error('审核失败:', error)
      ElMessage.error('审核失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }
}

// 工具方法
const formatIdCard = (idCard?: string) => {
  if (!idCard || idCard.length < 10) return idCard || '-'
  return `${idCard.slice(0, 6)}****${idCard.slice(-4)}`
}

const formatDateRange = (checkinDate?: string, checkoutDate?: string) => {
  if (!checkinDate || !checkoutDate) return '-'
  return `${checkinDate} 至 ${checkoutDate}`
}

const getApplicationTypeLabel = (type?: number) => {
  if (!type) return '-'
  return ApplicationTypeMap[type] || '未知'
}

const getApplicationTypeTag = (type?: number) => {
  const tagMap: Record<number, string> = {
    1: '', // 短住
    2: 'success', // 直通车
    3: 'warning', // 僧亲
    4: 'info', // 团队挂单
    5: 'danger' // 特殊客人
  }
  return tagMap[type!] || ''
}

const getStatusLabel = (status?: number) => {
  if (!status) return '-'
  return ReviewStatusMap[status] || '未知'
}

const getStatusTagType = (status?: number) => {
  const typeMap: Record<number, string> = {
    10: 'warning', // 待审核
    20: 'info', // 待法师审核
    30: 'success', // 已通过
    40: 'danger' // 已驳回
  }
  return typeMap[status!] || ''
}

const canReview = (status?: number) => {
  return status === 10 || status === 20 // 待审核或待法师审核
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.renewal-review {
  padding: 24px;
  background: #FFF8E7;
  min-height: calc(100vh - 64px);
}

.page-header {
  text-align: center;
  margin-bottom: 32px;

  .page-title {
    font-size: 32px;
    font-weight: 600;
    color: #8B5A2B;
    margin-bottom: 12px;
  }

  .page-description {
    color: #666;
    font-size: 16px;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
  }
}

.filter-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .filter-title {
      font-size: 20px;
      font-weight: 600;
      color: #8B5A2B;
      margin: 0;
    }
  }

  .filter-controls {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .search-box {
      flex: 1;
      min-width: 200px;
      max-width: 300px;
    }
  }
}

.tabs-container {
  background: white;
  border-radius: 16px;
  padding: 0;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
}

.pagination-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;

    .pagination-info {
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 24px;

      .pagination-sizes {
        display: flex;
        align-items: center;
        gap: 8px;

        .sizes-label {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        .el-select {
          .el-select__wrapper {
            border-radius: 6px;
            border: 1px solid #D0D0D0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-height: 28px;

            &:hover {
              border-color: #8B5A2B;
            }

            &.is-focus {
              border-color: #8B5A2B;
              box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.2);
            }
          }
        }
      }
    }
  }
}

.applicant-cell {
  display: flex;
  align-items: center;
  gap: 12px;

  .applicant-avatar {
    flex-shrink: 0;
    border: 2px solid #8B5A2B;
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
  color: #8B5A2B;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;

  .el-button {
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// Element Plus 样式覆盖
:deep(.el-table) {
  .el-table__header-wrapper {
    background: #F5F5DC;
  }

  .el-table__header th {
    background: #F5F5DC !important;
    color: #666;
    font-weight: 500;
    border-bottom: 1px solid #E0E0E0;
  }

  .el-table__body-wrapper {
    .el-table__row {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(245, 245, 220, 0.3);
      }
    }
  }
}

:deep(.el-tabs__header) {
  margin: 0;
  background: white;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 24px;
}

:deep(.el-tabs__nav) {
  border: none;
}

:deep(.el-tabs__item) {
  border: none !important;
  padding: 16px 24px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: #8B5A2B;
    background: rgba(139, 90, 43, 0.05);
  }

  &.is-active {
    color: #8B5A2B;
    border-bottom: 2px solid #8B5A2B !important;
    background: rgba(139, 90, 43, 0.05);
  }
}

// 自定义分页样式
:deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: 4px;

  .btn-prev,
  .btn-next {
    border: 1px solid #D0D0D0 !important;
    border-radius: 4px !important;
    margin: 0 2px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    font-weight: 500 !important;
    min-width: 32px !important;
    height: 32px !important;
    background: white !important;
    color: #666 !important;

    &:hover:not(:disabled) {
      background: #F5F5DC !important;
      border-color: #8B5A2B !important;
      color: #8B5A2B !important;
    }

    &:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }
  }

  .el-pager {
    display: flex;
    gap: 4px;

    .number {
      border: 1px solid #D0D0D0 !important;
      border-radius: 4px !important;
      margin: 0 2px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      font-weight: 500 !important;
      min-width: 32px !important;
      height: 32px !important;
      line-height: 30px !important;
      background: white !important;
      color: #666 !important;

      &:hover {
        background: #F5F5DC !important;
        border-color: #8B5A2B !important;
        color: #8B5A2B !important;
      }

      &.is-active {
        background: #8B5A2B !important;
        border-color: #8B5A2B !important;
        color: white !important;
      }
    }

    .more {
      border: none !important;
      background: transparent !important;
      color: #666 !important;

      &:hover {
        background: transparent !important;
        color: #8B5A2B !important;
      }
    }
  }

  // 隐藏不需要的元素
  .el-pagination__total,
  .el-pagination__sizes,
  .el-pagination__jump {
    display: none !important;
  }
}

// 标签样式
:deep(.el-tag) {
  border-radius: 12px;
  font-weight: 500;
  border: none;
  padding: 4px 12px;
}

// 搜索筛选组件样式
.filter-controls {
  .el-input {
    .el-input__wrapper {
      border-radius: 8px;
      border: 1px solid #D0D0D0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: #8B5A2B;
      }

      &.is-focus {
        border-color: #8B5A2B;
        box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.2);
      }
    }
  }

  .el-select {
    .el-select__wrapper {
      border-radius: 8px;
      border: 1px solid #D0D0D0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: #8B5A2B;
      }

      &.is-focus {
        border-color: #8B5A2B;
        box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.2);
      }
    }
  }

  .el-button {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .renewal-review {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
    }

    .page-description {
      font-size: 14px;
    }
  }

  .filter-container,
  .tabs-container,
  .table-container,
  .pagination-container {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .filter-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;

    .filter-title {
      font-size: 18px;
    }
  }

  .filter-controls {
    flex-direction: column;
    width: 100%;

    .search-box {
      width: 100%;
      max-width: none;
    }

    .el-select {
      width: 100% !important;
    }
  }

  .pagination-container .pagination-wrapper {
    flex-direction: column;
    gap: 16px;

    .pagination-controls {
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }
  }

  .applicant-cell {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
</style>