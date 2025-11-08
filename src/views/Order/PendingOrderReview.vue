<template>
  <div class="pending-order-review">
    <PageHeader title="挂单审核" description="管理各类挂单申请的审核流程" />

    <!-- 状态标签页 -->
    <div class="tabs-section">
      <el-card>
        <StatusTabs v-model="activeTab" :tabs="tabConfig" @tab-change="handleTabChange" />

        <!-- 搜索筛选 -->
        <SearchFilter @filter-change="handleFilterChange" />

        <!-- 数据表格 -->
        <OrderTable :loading="loading" :data="tableData" :pagination="pagination" @view-detail="handleViewDetail"
          @review="handleReview" @evaluate="handleEvaluate" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-card>
    </div>

    <!-- 查看详情弹窗 -->
    <OrderDetailDialog v-model="detailVisible" :record="currentRecord" />

    <!-- 审核弹窗 -->
    <ReviewDialog v-model="reviewVisible" :record="currentRecord" @submit="handleSubmitReview" />

    <!-- 评价弹窗 -->
    <EvaluateDialog v-model="evaluateVisible" :record="currentRecord" @submit="handleSubmitEvaluate" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import PageHeader from './components/PageHeader.vue'
import SearchFilter from './components/SearchFilter.vue'
import StatusTabs from './components/StatusTabs.vue'
import OrderTable from './components/OrderTable.vue'
import OrderDetailDialog from './components/OrderDetailDialog.vue'
import ReviewDialog from './components/ReviewDialog.vue'
import EvaluateDialog from './components/EvaluateDialog.vue'

import type { OrderApplication, TabConfig, ReviewForm, EvaluateForm, FilterOptions } from './types'

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const reviewVisible = ref(false)
const evaluateVisible = ref(false)
const activeTab = ref('pending_review')
const currentRecord = ref<OrderApplication | null>(null)
const currentFilters = ref<FilterOptions>({
  applicationType: '',
  dateRange: '',
  searchKeyword: ''
})

// 表格数据
const tableData = ref<OrderApplication[]>([])

// 标签页配置
const tabConfig = ref<TabConfig[]>([
  { name: 'pending_review', label: '待审核', count: 5 },
  { name: 'pending_monk', label: '待法师审核', count: 1 },
  { name: 'approved', label: '已通过', count: 1 },
  { name: 'rejected', label: '已驳回', count: 1 }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据 - 基于新的数据结构
const mockData: OrderApplication[] = [
  {
    id: '1',
    applicant: '释觉定',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'short_stay',
    startDate: '2024-11-01',
    endDate: '2024-11-03',
    stayDays: 3,
    status: 'pending_review',
    idCard: '350102197305013711',
    phone: '13171006599',
    reason: '回家探亲',
    remark: ''
  },
  {
    id: '2',
    applicant: '释子清',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'express',
    startDate: '2024-11-01',
    endDate: '2024-11-03',
    stayDays: 3,
    status: 'pending_review',
    idCard: '350102200311153711',
    phone: '18874002987',
    reason: '学习交流',
    remark: ''
  },
  {
    id: '3',
    applicant: '释当觉',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'monk_family',
    startDate: '2024-11-02',
    endDate: '2024-11-05',
    stayDays: 4,
    status: 'pending_review',
    idCard: '350102200508143711',
    phone: '17859885617',
    reason: '家人来访',
    remark: ''
  },
  {
    id: '4',
    applicant: '释了缘',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'team',
    startDate: '2024-11-03',
    endDate: '2024-11-07',
    stayDays: 5,
    status: 'pending_review',
    idCard: '350102199907103711',
    phone: '15985787884',
    reason: '团队参访',
    remark: ''
  },
  {
    id: '5',
    applicant: '释子慧',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'special',
    startDate: '2024-11-01',
    endDate: '2024-11-02',
    stayDays: 2,
    status: 'pending_review',
    idCard: '350102200008013711',
    phone: '17859885617',
    reason: '特殊接待',
    remark: ''
  },
  {
    id: '6',
    applicant: '释如定',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'short_stay',
    startDate: '2024-11-02',
    endDate: '2024-11-04',
    stayDays: 3,
    status: 'pending_monk',
    idCard: '350102198212013711',
    phone: '13171006599',
    reason: '法事活动',
    remark: ''
  },
  {
    id: '7',
    applicant: '释智慧',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'express',
    startDate: '2024-10-28',
    endDate: '2024-10-30',
    stayDays: 3,
    status: 'approved',
    idCard: '350102198506013711',
    phone: '13171006599',
    reason: '会议参加',
    remark: ''
  },
  {
    id: '8',
    applicant: '释法缘',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    applicationType: 'short_stay',
    startDate: '2024-10-25',
    endDate: '2024-10-27',
    stayDays: 3,
    status: 'rejected',
    idCard: '350102199003013711',
    phone: '13171006599',
    reason: '私事离寺',
    remark: '理由不充分'
  }
]

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 过滤数据
    let filteredData = [...mockData]

    // 按状态过滤
    if (activeTab.value !== 'all') {
      filteredData = filteredData.filter(item => item.status === activeTab.value)
    }

    // 按申请类型过滤
    if (currentFilters.value.applicationType) {
      filteredData = filteredData.filter(item => item.applicationType === currentFilters.value.applicationType)
    }

    // 按搜索关键词过滤
    if (currentFilters.value.searchKeyword) {
      const keyword = currentFilters.value.searchKeyword.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.applicant.toLowerCase().includes(keyword) ||
        item.idCard.includes(keyword)
      )
    }

    // 按日期范围过滤
    if (currentFilters.value.dateRange) {
      const today = new Date()

      switch (currentFilters.value.dateRange) {
        case 'today':
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.startDate)
            return itemDate.toDateString() === today.toDateString()
          })
          break
        case 'this_week':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
          filteredData = filteredData.filter(item => new Date(item.startDate) >= weekStart)
          break
        case 'this_month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          filteredData = filteredData.filter(item => new Date(item.startDate) >= monthStart)
          break
        case 'this_quarter':
          const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
          filteredData = filteredData.filter(item => new Date(item.startDate) >= quarterStart)
          break
      }
    }

    pagination.total = filteredData.length

    // 分页
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)

  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = (filters: FilterOptions) => {
  currentFilters.value = filters
  pagination.currentPage = 1
  loadData()
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  pagination.currentPage = 1
  loadData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

const handleViewDetail = (record: OrderApplication) => {
  currentRecord.value = record
  detailVisible.value = true
}

const handleReview = (record: OrderApplication) => {
  currentRecord.value = record
  reviewVisible.value = true
}

const handleEvaluate = (record: OrderApplication) => {
  currentRecord.value = record
  evaluateVisible.value = true
}

const handleSubmitReview = async (_form: ReviewForm) => {
  try {
    // 模拟提交审核
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('审核提交成功')
    reviewVisible.value = false
    loadData()

  } catch (error) {
    console.error('审核提交失败:', error)
  }
}

const handleSubmitEvaluate = async (_form: EvaluateForm) => {
  try {
    // 模拟提交评价
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('评价提交成功')
    evaluateVisible.value = false
    loadData()

  } catch (error) {
    console.error('评价提交失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.pending-order-review {
  padding: 24px;
  background: #fdf6e3; // #f5f5f5
  min-height: 100vh;
}

.tabs-section {
  margin-top: 20px;
}

// 响应式设计
@media (max-width: 768px) {
  .pending-order-review {
    padding: 16px;
  }

  :deep(.el-tabs__nav-wrap) {
    .el-tabs__nav-scroll {
      .el-tabs__nav {
        .el-tabs__item {
          font-size: 12px;
          padding: 0 12px;
        }
      }
    }
  }
}
</style>