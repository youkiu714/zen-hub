<template>
  <div class="pending-order-query">
    <!-- 页面头部 -->
    <PageHeader title="挂单记录查询" description="查询和管理挂单记录信息" />

    <!-- 筛选区域 -->
    <FilterForm
      ref="filterFormRef"
      :exporting="exporting"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    />

    <!-- 数据表格 -->
    <PendingOrderTable
      :loading="loading"
      :data="tableData"
      @view-detail="handleViewDetail"
      @view-history="handleViewHistory"
    />

    <!-- 分页 -->
    <CustomPagination
      :pagination="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 查看详情弹窗 -->
    <OrderDetailDialog
      v-model="detailVisible"
      :record="currentRecord"
    />

    <!-- 历史记录弹窗 -->
    <OrderHistoryDialog
      v-model="historyVisible"
      :record="currentRecord"
      :history-data="historyData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 引入组件
import PageHeader from './components/PageHeader.vue'
import FilterForm from './components/FilterForm.vue'
import PendingOrderTable from './components/PendingOrderTable.vue'
import CustomPagination from './components/CustomPagination.vue'
import OrderDetailDialog from './components/OrderDetailDialog.vue'
import OrderHistoryDialog from './components/OrderHistoryDialog.vue'

// 引入类型
import type { PendingOrderRecord, OrderHistory } from './components/types' // FilterForm

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const detailVisible = ref(false)
const historyVisible = ref(false)
const currentRecord = ref<PendingOrderRecord | null>(null)
const historyData = ref<OrderHistory[]>([])

// 组件引用
const filterFormRef = ref()

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

// 表格数据
const tableData = ref<PendingOrderRecord[]>([])

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 获取筛选条件
    const filterForm = filterFormRef.value?.form || {}

    if (filterForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.includes(filterForm.name)
      )
    }

    if (filterForm.gender) {
      filteredData = filteredData.filter(item =>
        item.gender === filterForm.gender
      )
    }

    if (filterForm.orderCountRange) {
      const range = filterForm.orderCountRange
      filteredData = filteredData.filter(item => {
        if (range === '1-5') {
          return item.totalOrderCount >= 1 && item.totalOrderCount <= 5
        } else if (range === '6-10') {
          return item.totalOrderCount >= 6 && item.totalOrderCount <= 10
        } else if (range === '10+') {
          return item.totalOrderCount > 10
        }
        return true
      })
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

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  pagination.currentPage = 1
  loadData()
}

const handleExport = async () => {
  exporting.value = true
  try {
    // 模拟导出
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

const handleViewDetail = (record: PendingOrderRecord) => {
  currentRecord.value = record
  detailVisible.value = true
}

const handleViewHistory = (record: PendingOrderRecord) => {
  currentRecord.value = record
  // 模拟加载历史数据
  historyVisible.value = true
}


// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.pending-order-query {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

// 响应式设计
@media (max-width: 768px) {
  .pending-order-query {
    padding: 16px;
  }
}
</style>