<template>
  <div class="application-management">
    <PageHeader title="挂单管理">
      <el-button
        type="primary"
        size="large"
        @click="handleNewApplication"
        class="new-application-btn"
      >
        <el-icon class="icon"><Plus /></el-icon> 申请挂单
      </el-button>
    </PageHeader>

    <ApplicationStatusFilter v-model="filterStatus" @update:modelValue="loadApplications" />

    <div class="table-container">
      <div class="filter-bar">
        <el-input
          v-model="nameKeyword"
          placeholder="输入姓名进行筛选"
          :suffix-icon="Search"
          @clear="handleKeywordSearch"
          @keyup.enter="handleKeywordSearch"
          style="width: 240px"
        />
        <el-input
          v-model="mobileKeyword"
          placeholder="输入手机号进行筛选"
          :suffix-icon="Search"
          @clear="handleKeywordSearch"
          @keyup.enter="handleKeywordSearch"
          style="width: 240px"
        />

        <!-- <el-button size="medium" plain class="search-btn" @click="handleKeywordSearch">
          <el-icon class="icon"><Search /></el-icon> 查询
        </el-button> -->
      </div>

      <el-table
        :data="applications"
        style="width: 100%"
        size="large"
        :header-cell-style="{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f5f7fa' }"
        class="application-table"
        v-loading="loading"
      >
        <el-table-column prop="applicantName" label="申请人" width="120" fixed="left" />
        <el-table-column prop="mobile" label="手机号" width="130" />
        <el-table-column prop="applicationType" label="挂单类型" min-width="90">
          <template #default="{ row }">
            <span class="dot" :class="getApplicationTypeClass(row.applicationType)"></span>
            {{
              applicationTypeOptions.find((item) => item.value === row.applicationType)?.label ??
              '其他'
            }}
          </template>
        </el-table-column>
        <el-table-column prop="departmentCode" label="所属部族" min-width="90">
          <template #default="{ row }">
            {{
              departmentOptions.find((item) => item.value === row.departmentCode)?.label ?? '其他'
            }}
          </template>
        </el-table-column>
        <el-table-column label="申请状态" min-width="100">
          <template #default="{ row }">
            <el-tag
              :type="getApplicationStatusType(row.status)"
              effect="dark"
              round
              class="status-tag"
            >
              {{ APPLICATION_STATUS_MAP[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt || row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkinDate" label="入住日期" min-width="110" />
        <el-table-column prop="checkoutDate" label="退住日期" min-width="110" />

        <el-table-column prop="bedInfo" label="分配床位" width="120">
          <template #default="{ row }">
            {{ row.bedInfo ? row.bedInfo.bedNumber : '暂未分配' }}
          </template>
        </el-table-column>
        <el-table-column prop="days" label="挂单时长（天）" min-width="130" />
        <el-table-column label="操作" min-width="480" fixed="right">
          <template #default="{ row }">
            <el-button @click="() => handleViewDetail(row.id)" class="btn-default" type="text">
              <el-icon class="btn-icon"><View /></el-icon>
              查看
            </el-button>
            <el-button type="success" class="btn-success" @click="() => handleReview(row.id)">
              <el-icon class="btn-icon">
                <Operation />
              </el-icon>
              审核流程
            </el-button>
            <el-popconfirm
              v-if="
                row.status === ApplicationStatus.PENDING_REVIEW ||
                row.status === ApplicationStatus.WAITING_CHECKIN
              "
              class="box-item"
              title="确认取消申请吗？"
              placement="top"
              :hide-icon="true"
              confirm-button-text="确认"
              cancel-button-text="取消"
              @confirm="() => handleCancelApplication(row.id)"
            >
              <template #reference>
                <el-button class="btn-error"
                  ><el-icon class="btn-icon"><Close /></el-icon>取消申请</el-button
                >
              </template>
            </el-popconfirm>

            <el-button
              v-if="row.status !== ApplicationStatus.CANCELED"
              type="primary"
              class="btn-primary"
              @click="() => handleEditApplication(row)"
              ><el-icon class="btn-icon"><EditPen /></el-icon>修改信息</el-button
            >

            <el-button
              v-if="row.status === ApplicationStatus.CHECKED_IN"
              type="primary"
              class="btn-primary"
              @click="() => handleRenewalApplication(row)"
              ><el-icon class="btn-icon"><EditPen /></el-icon>续单申请</el-button
            >

            <el-button
              v-if="row.status === ApplicationStatus.CHECKED_IN"
              type="primary"
              class="btn-primary"
              @click="() => handleCheckoutApplication(row)"
              ><el-icon class="btn-icon"><EditPen /></el-icon>退单</el-button
            >
          </template>
        </el-table-column>

        <!-- 空状态 -->
        <template #empty>
          <el-empty description="暂无申请数据" />
        </template>
      </el-table>

      <!-- 分页 - 只有当总数据量大于单页数据量时才显示 -->
      <div v-if="total > 10" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 查看详情 -->
    <ApplicationDetailDialog
      v-model="detailVisible"
      :application-id="currentAppId"
      @close="onDetailClosed"
    />

    <!-- 审核流程 -->
    <ReviewPage v-model="reviewVisible" :application-id="currentReviewId" @close="onReviewClosed" />

    <!-- 修改申请信息弹窗 -->
    <EditApplication
      v-model="editVisible"
      :application-data="currentEditData"
      :application-id="currentEditId"
      @submit="handleEditSubmit"
    />

    <!-- 续单申请弹窗 -->
    <RenewalApplicationDialog
      v-model="renewalVisible"
      :order-data="currentRenewalData"
      @submit="handleRenewalSubmit"
    />

    <!-- 退单申请弹窗 -->
    <CheckoutApplicationDialog
      v-model="checkoutVisible"
      :order-data="currentCheckoutData"
      @submit="handleCheckoutSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApplicationStatus } from '@/types/application'
import { getApplications, cancelApplication } from '@/api/application'
import ApplicationStatusFilter from './components/ApplicationStatusFilter.vue'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'
import EditApplication from './components/EditApplication.vue'
import RenewalApplicationDialog from './components/RenewalApplicationDialog.vue'
import CheckoutApplicationDialog from './components/CheckoutApplicationDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  APPLICATION_STATUS_MAP,
  getApplicationStatusType,
  applicationTypeOptions,
  departmentOptions
} from '@/utils/constants'
import { formatDate } from '@/utils/format-date'
import { throttle } from 'lodash-es'

const router = useRouter()

// 状态
const loading = ref(false)
const applications = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const filterStatus = ref(ApplicationStatus.DRAFT)
const nameKeyword = ref('')
const mobileKeyword = ref('')

const detailVisible = ref(false)
const currentAppId = ref(0)

const reviewVisible = ref(false)
const currentReviewId = ref(0)

// 修改申请信息相关状态
const editVisible = ref(false)
const currentEditId = ref(0)
const currentEditData = ref({
  applicationType: 0,
  checkinDate: '',
  checkoutDate: '',
  shortStayReason: '',
  selfEvaluation: ''
})

// 续单申请相关状态
const renewalVisible = ref(false)
const currentRenewalData = ref({
  applicationId: 0,
  checkoutDate: ''
})

// 退单申请相关状态
const checkoutVisible = ref(false)
const currentCheckoutData = ref({
  applicationId: 0,
  checkoutDate: ''
})

// 加载数据
const getKeywordParam = () => {
  const mobile = mobileKeyword.value.trim()
  if (mobile) return mobile
  const name = nameKeyword.value.trim()
  return name || undefined
}

const loadApplications = async () => {
  loading.value = true
  try {
    const response = await getApplications({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      status: filterStatus.value !== ApplicationStatus.DRAFT ? filterStatus.value : undefined,
      keyword: getKeywordParam()
    })
    console.log(response)

    // 根据实际返回的数据结构访问
    if (response.records) {
      applications.value = response.records
      total.value = response.total || 0
    }
  } catch (error) {
    ElMessage.error('加载挂单列表失败')
    console.error('加载挂单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleKeywordSearch = () => {
  currentPage.value = 1
  loadApplications()
}

// 页面初始化
onMounted(() => {
  loadApplications()
})

// 事件处理 - 添加节流控制
const handleNewApplication = throttle(() => {
  router.push('/contact-application/pending-application')
}, 1000) // 1秒内只能点击一次

const handleViewDetail = (id: number) => {
  currentAppId.value = id
  detailVisible.value = true
}

const handleReview = (id: number) => {
  console.log('审核流程:', id)
  currentReviewId.value = id
  reviewVisible.value = true
}

const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}

const onReviewClosed = () => {
  console.log('审核流程窗口已关闭')
}

const handleCancelApplication = async (id: number) => {
  try {
    await cancelApplication(id)
    ElMessage.success('取消申请成功')
    loadApplications() // 重新加载数据
  } catch (error) {
    console.error('取消申请失败:', error)
    ElMessage.error('取消申请失败，请稍后重试')
  }
}

// 获取申请类型对应的样式类
const getApplicationTypeClass = (applicationType: number) => {
  const typeClassMap: Record<number, string> = {
    1: 'short-stay', // 短住 - #5F3DC4
    2: 'long-stay', // 常住 - #08979C
    3: 'direct-bus', // 直通车 - #D4B106
    4: 'special-guest' // 特殊客人 - #C41D7F
  }
  return typeClassMap[applicationType] || 'default'
}

// 处理修改申请信息
const handleEditApplication = (row: any) => {
  // 保存当前编辑的申请ID
  currentEditId.value = row.id

  // 将表格行数据转换为编辑表单需要的格式
  currentEditData.value = {
    applicationType: row.applicationType || 0,
    checkinDate: row.checkinDate || '',
    checkoutDate: row.checkoutDate || '',
    shortStayReason: row.shortStayReason || '',
    selfEvaluation: row.selfEvaluation || ''
  }
  editVisible.value = true
}

// 处理续单申请
const handleRenewalApplication = (row: any) => {
  // 保存当前续单申请的数据
  currentRenewalData.value = {
    applicationId: row.id,
    checkoutDate: row.checkoutDate || ''
  }
  renewalVisible.value = true
}

// 处理续单申请提交
const handleRenewalSubmit = async (data: any) => {
  try {
    // 这里应该调用续单申请的API
    renewalVisible.value = false
    await loadApplications()
  } catch (error) {
    console.error('续单申请失败:', error)
    ElMessage.error('续单申请失败，请稍后重试')
  }
}

// 处理退单申请
const handleCheckoutApplication = (row: any) => {
  // 保存当前退单申请的数据
  currentCheckoutData.value = {
    applicationId: row.id,
    checkoutDate: row.checkoutDate || ''
  }
  checkoutVisible.value = true
}

// 处理退单申请提交
const handleCheckoutSubmit = async () => {
  try {
    checkoutVisible.value = false
    await loadApplications()
  } catch (error) {
    ElMessage.error('退单申请失败，请稍后重试')
  }
}

// 分页事件处理
const handleSizeChange = async (newPageSize: number) => {
  pageSize.value = newPageSize
  currentPage.value = 1 // 重置到第一页
  await loadApplications()
}

const handleCurrentChange = async (newCurrentPage: number) => {
  currentPage.value = newCurrentPage
  await loadApplications()
}

// 处理修改提交
const handleEditSubmit = async (data: any, id: number) => {
  try {
    await loadApplications() // 重新加载数据
  } catch (error) {
    console.error('修改申请信息失败:', error)
    ElMessage.error('修改申请信息失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
.icon {
  margin-right: 4px;
}
.table-container {
  background-color: white;
  padding: 12px 10px;
  border-radius: 12px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.filter-input {
  max-width: 260px;
}

/* 隐藏 Webkit 浏览器的滚动条 */
.table-container::-webkit-scrollbar {
  display: none;
}

.application-table {
  max-height: calc(100vh - 360px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

/* 隐藏表格的 Webkit 滚动条 */
.application-table::-webkit-scrollbar {
  display: none;
}
:deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.el-table__fixed-header-wrapper) {
  z-index: 11;
}

:deep(.el-table__fixed-right) {
  z-index: 12;
}

:deep(.el-table__fixed-left) {
  z-index: 12;
}

/* 隐藏表格内部各种滚动条 */
:deep(.el-table__body-wrapper) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  display: none;
}

/* 隐藏固定列的滚动条 */
:deep(.el-table__fixed) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.el-table__fixed::-webkit-scrollbar) {
  display: none;
}

/* 隐藏固定列内部的滚动条 */
:deep(.el-table__fixed .el-table__body-wrapper) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.el-table__fixed .el-table__body-wrapper::-webkit-scrollbar) {
  display: none;
}

.application-management {
  padding: 20px;
  background-color: #fdf6e3;
  //   min-height: 100vh;
}

.new-application-btn {
  background-color: #8b4513;
  border-color: #8b4513;
}

// 申请类型圆点样式
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;

  &.short-stay {
    background-color: #08979c; // 短住
  }

  &.long-stay {
    background-color: #5f3dc4; // 常住
  }

  &.direct-bus {
    background-color: #d4b106; // 直通车
  }

  &.special-guest {
    background-color: #c41d7f; // 特殊客人
  }

  &.default {
    background-color: #909399; // 默认颜色
  }
  color: white;
}

.new-application-btn:hover {
  background-color: #6b370f;
  border-color: #6b370f;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.applications-list {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

// 查询按钮样式
.search-btn {
  font-weight: 600;
  &:hover,
  &:active,
  &:focus {
    color: rgb(120 75 35);
    border: 1px solid rgb(120 75 35);
  }
}

.btn-default {
  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));
  color: rgb(55 65 81 / var(--tw-text-opacity, 1));
}
.btn-icon {
  margin-right: 2px;
}
.btn-error {
  color: rgb(185 28 28 / var(--tw-text-opacity, 1));
  background-color: rgb(254 226 226 / var(--tw-bg-opacity, 1));
}
.btn-success {
  background-color: #31bf30;
}
.btn-primary {
  background-color: #19b2ff;
}
.btn-primary,
.btn-error,
.btn-default,
.btn-success {
  border: none;
  border-radius: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

.status-tag {
  font-weight: 600;
}
</style>
