<template>
  <div class="checkin-management">
    <PageHeader title="入住登记" />

    <TabNavigation :tabs="tabs" :active-tab="activeTab" @change="handleTabChange" />

    <div class="table-container" shadow="hover">
      <FilterSection v-model:keyword="searchKeyword" v-model:roomType="selectedRoomType" v-model:status="selectedStatus"
        :search-placeholder="searchPlaceholder" :room-options="ROOM_TYPE_OPTIONS" :status-options="STATUS_OPTIONS"
        @search="handleSearchInput" @filter="handleFilterChange" />

      <div class="table-content">
        <UnifiedTable :data="getCurrentTableData()" :loading="loading" :status="activeTab" @check-in="handleCheckIn"
          @assign-bed="handleBedAssignment" @confirm-bed="handleBedConfirmation" @view-application="handleViewDetail"
          @renewal="handleRenewal" @checkout="handleCheckout" @view-detail="handleViewDetail" @review="handleReview"
          @lost-notice="handleLostItemNotification" @evaluate="handleEvaluation" />
      </div>

      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="PAGE_SIZE_OPTIONS" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <CheckInModal v-model="checkInModalVisible" :applicant-data="currentCheckInData" @success="loadData" />

    <ApplicationDetailDialog v-model="detailVisible" :application-id="currentAppId" @close="detailVisible = false" />

    <ReviewPage v-model="reviewVisible" :application-id="currentReviewId" @close="reviewVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'
import CheckInModal from '@/components/CheckInModal.vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getInhouseList,
  getPendingCheckinList
} from '@/api/checkin'
import { checkout } from '@/api/assignment'
import type {
  CheckedOutRecord,
  InhouseItemVO,
  InhouseRequest,
  PaginationParams,
  PendingCheckinItemVO,
  PendingCheckinRequest
} from '@/types/checkin'
import { useUserStore } from '@/store/modules/user'
import TabNavigation from './components/TabNavigation.vue'
import FilterSection from './components/FilterSection.vue'
import UnifiedTable from './components/UnifiedTable.vue'
import {
  CHECKIN_TABS,
  PAGE_SIZE_OPTIONS,
  ROOM_TYPE_OPTIONS,
  SEARCH_PLACEHOLDER_MAP,
  STATUS_OPTIONS,
  CheckinTabKey
} from './utils'

const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref<CheckinTabKey>('pending')
const searchKeyword = ref('')
const selectedRoomType = ref('')
const selectedStatus = ref('')

const detailVisible = ref(false)
const currentAppId = ref(0)

const reviewVisible = ref(false)
const currentReviewId = ref(0)

const checkInModalVisible = ref(false)
const currentCheckInData = ref<PendingCheckinItemVO>()

const pagination = reactive<PaginationParams>({
  current: 1,
  pageSize: 10,
  total: 0
})

const pendingList = ref<PendingCheckinItemVO[]>([])
const checkedInList = ref<InhouseItemVO[]>([])
const checkedOutList = ref<CheckedOutRecord[]>([])

const tabs = computed(() =>
  CHECKIN_TABS.map((tab) => ({
    ...tab,
    count:
      tab.key === 'pending'
        ? pendingList.value.length
        : tab.key === 'checked-in'
          ? checkedInList.value.length
          : checkedOutList.value.length
  }))
)

const searchPlaceholder = computed(() => SEARCH_PLACEHOLDER_MAP[activeTab.value])


let searchTimer: number | undefined

const loadPendingData = async () => {
  const params: PendingCheckinRequest = {
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    keyword: searchKeyword.value || undefined
  }

  const response: any = await getPendingCheckinList(params)
  pendingList.value = response.records || response.data?.records || []
}

const loadInhouseData = async () => {
  const params: InhouseRequest = {
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    keywordOrRoomNo: searchKeyword.value || undefined
  }

  const response: any = await getInhouseList(params)
  checkedInList.value = response.records || response.data?.records || []
}

const loadCheckedOutData = async () => {
  checkedOutList.value = []
}

const loadAllData = async () => {
  await Promise.all([loadPendingData(), loadInhouseData(), loadCheckedOutData()])
  pagination.total =
    pendingList.value.length + checkedInList.value.length + checkedOutList.value.length
}

const handleSearchInput = () => {
  if (searchTimer) {
    window.clearTimeout(searchTimer)
  }
  searchTimer = window.setTimeout(() => {
    pagination.current = 1
    loadData()
  }, 400)
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadData()
}

const handleTabChange = (key: CheckinTabKey) => {
  activeTab.value = key
  pagination.current = 1
  loadData()
}

const handleCheckIn = (row: PendingCheckinItemVO) => {
  currentCheckInData.value = row
  checkInModalVisible.value = true
}

const handleBedAssignment = (_row: PendingCheckinItemVO) => {
  ElMessage.info('分床功能')
}

const handleBedConfirmation = (_row: PendingCheckinItemVO) => {
  ElMessage.info('床位确认功能')
}

const handleRenewal = (_row: InhouseItemVO) => {
  ElMessage.info('续单确认功能')
}

const handleCheckout = async (row: InhouseItemVO) => {
  try {
    await ElMessageBox.confirm(`确认办理 ${row.name} 的退房手续？`, '退房处理', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (!row.bedStayId) {
      ElMessage.error('缺少床位居住ID，无法办理退房')
      return
    }

    loading.value = true
    await checkout(row.bedStayId)
    ElMessage.success('退房办理成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退房办理失败:', error)
      ElMessage.error('退房办理失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const handleLostItemNotification = (_row: CheckedOutRecord) => {
  ElMessage.info('发送遗漏物品通知功能')
}

const handleEvaluation = (_row: CheckedOutRecord) => {
  ElMessage.info('客人表现评价功能')
}

const handleViewDetails = (_row: CheckedOutRecord) => {
  ElMessage.info('查看详情功能')
}

const handleViewDetail = (id: number) => {
  currentAppId.value = id
  detailVisible.value = true
}

const handleReview = (id: number) => {
  currentReviewId.value = id
  reviewVisible.value = true
}


const getCurrentTableData = () => {
  switch (activeTab.value) {
    case 'pending':
      return pendingList.value
    case 'checked-in':
      return checkedInList.value
    case 'checked-out':
      return checkedOutList.value
    default:
      return []
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await loadAllData()
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
/* =========================================
   1. 页面整体布局样式 (Page Layout)
   ========================================= */
.checkin-management {
  padding: 20px;
  background-color: #fdf6e3;
  // min-height: 100vh;
}

.table-container {
  background-color: white;
  padding: 12px 10px;
  border-radius: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 隐藏 Webkit 浏览器的滚动条 */
.table-container::-webkit-scrollbar {
  display: none;
}

/* 表格内容区域 */
.table-content {
  padding: 0;
}

</style>