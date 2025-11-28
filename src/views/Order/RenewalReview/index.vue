<template>
  <div class="renewal-review page-container">
    <PageHeader title="续单审核" />

    <ApplicationStatusFilter v-model="filterStatus" @update:modelValue="handleTabChange" />

    <div class="table-container-section">
      <div class="filter-bar">
        <el-input
          v-model="currentFilters.keyword"
          placeholder="搜索申请人姓名或身份证号"
          clearable
          :suffix-icon="Search"
          @clear="handleKeywordInput"
          @keyup.enter="handleKeywordInput"
          style="width: 240px"
        />

        <el-select
          v-model="currentFilters.type"
          placeholder="全部申请类型"
          clearable
          class="filter-select"
          @change="handleFilterChange"
        >
          <el-option
            v-for="option in applicationTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <div style="width: 340px">
          <el-date-picker
            v-model="currentFilters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="filter-date-picker"
            @change="handleFilterChange"
            style="width: 340px"
          />
        </div>
      </div>
      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        size="large"
        :header-cell-style="{ backgroundColor: '#f5f7fa' }"
        class="application-table"
        v-loading="loading"
      >
        <el-table-column prop="applicantName" label="申请人" width="120" />
        <!-- 申请类型 -->
        <el-table-column label="申请类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getApplicationTypeTag(row.applicationType)">
              {{ getApplicationTypeLabel(row.applicationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="120" align="center">
          <template #default="{ row }">
            {{ getGenderText(row.gender) }}
          </template>
        </el-table-column>

        <!-- 所属部门 -->
        <el-table-column label="所属部门" width="120" align="center">
          <template #default="{ row }">
            {{ getDepartmentLabel(row.departmentCode) }}
          </template>
        </el-table-column>

        <el-table-column
          label="原退单日期"
          width="220"
          align="center"
          prop="originalCheckoutDate"
        />

        <el-table-column
          label="新退单日期"
          width="220"
          align="center"
          prop="requestedCheckoutDate"
        />

        <!-- 续住天数 -->
        <el-table-column label="续住天数" width="100" align="center">
          <template #default="{ row }">
            <span class="stay-days">{{ row.stayDays || 0 }}天</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" min-width="160">
          <template #default="{ row }">
            <div class="action-buttons">
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
        <!-- 空状态 -->
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <!-- 查看详情对话框 -->
    <ReviewDialog v-model="reviewDialogVisible" :order-data="selectedOrder" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getExtensionReviews, ExtensionReviewItem } from '@/api/extensions'
import { REVIEW_STATUS } from '@/types/review'

import PageHeader from '@/components/PageHeader.vue'
import { throttle } from 'lodash-es'
import ApplicationStatusFilter from './components/ApplicationStatusFilter.vue'
import { ApplicationTypeMap, applicationTypeOptions, DepartmentMap } from '@/utils/constants'
import { getGenderText } from '@/utils/index.ts'
import ReviewDialog from '@/views/Order/RenewalReview/components/RenewalDetailDialog.vue'

// 响应式数据
const loading = ref(false)
const activeTab = ref('10') // 使用数字状态码
const reviewDialogVisible = ref(false)
const selectedOrder = ref<ExtensionReviewItem | null>(null)
const filterStatus = ref(REVIEW_STATUS.PENDING)

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
  dateRange: null as [string, string] | null, // 日期范围
  status: '10' // 状态码
})

const tableData = ref<ExtensionReviewItem[]>([])

const fetchData = async () => {
  console.log('1')
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
      params.applicationType = currentFilters.value.type
    }

    // 处理日期范围筛选
    if (currentFilters.value.dateRange && currentFilters.value.dateRange.length === 2) {
      params.startDate = currentFilters.value.dateRange[0]
      params.endDate = currentFilters.value.dateRange[1]
    }

    const response = await getExtensionReviews(params)

    console.log("请求参数:", params)
    console.log("响应数据:", response)
    console.log("当前状态:", activeTab.value)

    // 直接从响应根级别获取数据
    tableData.value = response.records || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取续单审核数据失败:', error)
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tabName: string) => {
  console.log("状态切换:", tabName)
  activeTab.value = tabName
  filterStatus.value = parseInt(tabName) // 同步状态
  pagination.currentPage = 1
  fetchData()
}

const handleFilterChange = () => {
  pagination.currentPage = 1
//   fetchData()
}

const throttledKeywordSearch = throttle(
  () => {
    pagination.currentPage = 1
    // fetchData()
  },
  500,
  { leading: false, trailing: true }
)

const handleKeywordInput = () => {
//   throttledKeywordSearch()
}

const handlePageChange = (page: number) => {
  pagination.currentPage = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
//   fetchData()
}

const handleReview = (row: ExtensionReviewItem) => {
  selectedOrder.value = row
  reviewDialogVisible.value = true
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

const getDepartmentLabel = (departmentCode?: string) => {
  if (!departmentCode) return '-'
  return DepartmentMap[departmentCode] || departmentCode
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
  padding: 20px;
  background-color: #fdf6e3;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
