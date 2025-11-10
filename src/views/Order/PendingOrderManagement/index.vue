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

    <!-- 状态筛选器 -->
    <ApplicationStatusFilter v-model="filterStatus" @update:modelValue="loadApplications" />

    <el-table :data="applications" style="width: 100%" size="large">
      <el-table-column prop="applicantName" label="申请人" width="120" />
      <el-table-column prop="idCardMasked" label="身份证" width="160" />
      <el-table-column label="申请状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getApplicationStatusType(row.status)" effect="dark" round>
            {{ APPLICATION_STATUS_MAP[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdAt || row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="checkinDate" label="入住日期" width="110" />
      <el-table-column prop="checkoutDate" label="退住日期" width="110" />

      <el-table-column prop="bedInfo" label="分配床位" width="120">
        <template #default="{ row }">
          {{ row.bedInfo ? row.bedInfo.bedNumber : '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column prop="days" label="挂单时长（天）" width="130" />
      <el-table-column label="操作" min-width="120">
        <template #default="{ row }">
          <el-button @click="() => handleViewDetail(row.id)" class="btn-default">
            <el-icon class="btn-icon"><View /></el-icon>
            查看详情
          </el-button>
          <el-button type="success" class="btn-success" @click="() => handleReview(row.id)">
            <el-icon class="btn-icon">
              <Operation />
            </el-icon>
            审核流程
          </el-button>
          <el-popconfirm 
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

          <el-button type="primary" class="btn-primary"
            ><el-icon class="btn-icon"><EditPen /></el-icon>修改信息</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 应用列表 -->
    <div v-if="loading" class="loading-container">
      <div v-loading="loading" element-loading-text="加载中。。。" class="pending-order-container">
        sssss
      </div>
    </div>

    <div v-else-if="applications.length === 0" class="empty-container">
      <el-empty description="暂无挂单记录" />
    </div>

    <!-- 分页 -->
    <!-- <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper, total"
        @current-change="loadApplications"
      />
    </div> -->

    <!-- 查看详情 -->
    <ApplicationDetailDialog
      v-model="detailVisible"
      :application-id="currentAppId"
      @close="onDetailClosed"
    />

    <!-- 审核流程 -->
    <ReviewPage v-model="reviewVisible" :application-id="currentReviewId" @close="onReviewClosed" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApplicationStatus } from '@/types/application'
import { getApplications, cancelApplication } from '@/api/application'
import ApplicationStatusFilter from './components/ApplicationStatusFilter.vue'
import ApplicationCard from './components/ApplicationCard.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'
import type { OrderItem } from '@/types/order'
import PageHeader from '@/components/PageHeader.vue'
import { APPLICATION_STATUS_MAP, getApplicationStatusType } from '@/utils/constants'
import { formatDate } from '@/utils/format-date'

const router = useRouter()

// 状态
const loading = ref(false)
const applications = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const filterStatus = ref(ApplicationStatus.ALL)

const detailVisible = ref(false)
const currentAppId = ref(0)

const reviewVisible = ref(false)
const currentReviewId = ref(0)

// 加载数据
const loadApplications = async () => {
  loading.value = true
  try {
    const response = await getApplications({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      status: filterStatus.value !== ApplicationStatus.ALL ? filterStatus.value : undefined
    })
    console.log(response)
    console.log(response.records)

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

// 页面初始化
onMounted(() => {
  loadApplications()
})

// 事件处理
const handleNewApplication = () => {
  router.push('/contact-application/pending-application')
}

const handleViewDetail = (id: number) => {
  // router.push(`/application/${id}/detail`);
  console.log(id)

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

</script>

<style scoped lang="scss">
.icon {
  margin-right: 4px;
}
.application-management {
  padding: 20px;
  background-color: #fdf6e3;
  min-height: 100vh;
}

.new-application-btn {
  background-color: #8b4513;
  border-color: #8b4513;
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
</style>
