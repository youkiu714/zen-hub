<template>
  <div class="checkin-management">
    <PageHeader title="入住管理" />

    <TabNavigation :tabs="tabs" :active-tab="activeTab" @change="handleTabChange" />

    <div class="main-card" shadow="hover">
      <FilterSection
        v-model:keyword="searchKeyword"
        v-model:roomType="selectedRoomType"
        v-model:status="selectedStatus"
        :search-placeholder="searchPlaceholder"
        :room-options="ROOM_TYPE_OPTIONS"
        :status-options="STATUS_OPTIONS"
        @search="handleSearchInput"
        @filter="handleFilterChange"
      />

      <div class="table-content">
        <UnifiedTable
          :data="getCurrentTableData()"
          :loading="loading"
          :status="activeTab"
          @check-in="handleCheckIn"
          @assign-bed="handleBedAssignment"
          @confirm-bed="handleBedConfirmation"
          @view-application="handleViewDetail"
          @renewal="handleRenewal"
          @checkout="handleCheckout"
          @view-detail="handleViewDetail"
          @review="handleReview"
          @lost-notice="handleLostItemNotification"
          @evaluate="handleEvaluation"
        />
      </div>

      <div class="pagination-container" v-if="pagination.total > 0" >
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="PAGE_SIZE_OPTIONS"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="checkInModalVisible"
      :title="`入住登记 - ${checkInForm.applicationId || ''}`"
      width="60%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="resetCheckInForm"
      custom-class="check-in-dialog"
      top="5vh"
    >
      <el-form
        ref="checkInFormRef"
        :model="checkInForm"
        :rules="checkInRules"
        label-width="120px"
        label-position="right"
      >
        <div class="dialog-content-wrapper">
          <div class="check-in-section">
            <h3 class="section-title">👤 入住人信息</h3>
            <div class="info-row">
              <div class="info-item">
                <label class="info-label">姓名</label>
                <div class="info-value">{{ checkInForm.name || '-' }}</div>
              </div>
              <div class="info-item">
                <label class="info-label">身份证号</label>
                <div class="info-value">{{ checkInForm.idCard || '-' }}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label class="info-label">申请类型</label>
                <div class="info-value">
                  <el-tag :type="getOrderTypeTagType(checkInForm.applicationTypeName)" size="small">
                    {{ checkInForm.applicationTypeName || '-' }}
                  </el-tag>
                </div>
              </div>
              <div class="info-item">
                <label class="info-label">联系电话</label>
                <div class="info-value">{{ checkInForm.mobile || '-' }}</div>
              </div>
            </div>
          </div>

          <div class="check-in-section">
            <h3 class="section-title">🏠 房间及床位信息</h3>
            <div class="info-row">
              <div class="info-item">
                <label class="info-label">分配房间</label>
                <div class="info-value">{{ checkInForm.roomNumber || '-' }}</div>
              </div>
              <div class="info-item">
                <label class="info-label">分配床位</label>
                <div class="info-value">{{ checkInForm.bedNumber || '-' }}</div>
              </div>
            </div>
          </div>

          <div class="check-in-section">
            <h3 class="section-title">📅 入住日期信息</h3>
            <div class="info-row">
              <el-form-item label="实际入住日期" prop="actualCheckinDate" required>
                <el-date-picker
                  v-model="checkInForm.actualCheckinDate"
                  type="date"
                  placeholder="选择实际入住日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="预计退房日期" prop="expectedCheckoutDate" required>
                <el-date-picker
                  v-model="checkInForm.expectedCheckoutDate"
                  type="date"
                  placeholder="选择预计退房日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </div>

          <div class="check-in-section">
            <h3 class="section-title">📝 入住登记信息</h3>
            <el-form-item label="入住备注" prop="remark">
              <el-input
                v-model="checkInForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入入住备注信息，如特殊需求、注意事项等"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <div class="info-row">
              <el-form-item label="登记人" prop="registeredBy">
                <el-input v-model="checkInForm.registeredBy" readonly />
              </el-form-item>
              <el-form-item label="登记时间" prop="registrationTime" required>
                <el-date-picker
                  v-model="checkInForm.registrationTime"
                  type="datetime"
                  placeholder="选择登记时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </div>

          <div class="check-in-notice">
            <h3 class="notice-title">ℹ️ 入住须知</h3>
            <ul class="notice-list">
              <li>请核对入住人身份信息与身份证一致</li>
              <li>请告知入住人寺院作息时间和注意事项</li>
              <li>请提醒入住人保管好个人财物</li>
              <li>请引导入住人熟悉寺院环境和安全通道</li>
            </ul>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="checkInModalVisible = false" size="large">取消</el-button>
          <el-button
            type="primary"
            @click="confirmCheckIn"
            size="large"
            :loading="submitting"
            :style="{ backgroundColor: '#4CAF50', borderColor: '#4CAF50' }"
          >
            确认入住
          </el-button>
        </div>
      </template>
    </el-dialog>

    <ApplicationDetailDialog
      v-model="detailVisible"
      :application-id="currentAppId"
      @close="detailVisible = false"
    />

    <ReviewPage
      v-model="reviewVisible"
      :application-id="currentReviewId"
      @close="reviewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  confirmCheckin,
  getCheckinDetail,
  getInhouseList,
  getPendingCheckinList
} from '@/api/checkin'
import type {
  CheckedOutRecord,
  CheckinConfirmRequest,
  CheckinDetailResponse,
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
  CheckinTabKey,
  createCheckInForm,
  getOrderTypeTagType
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
const checkInFormRef = ref<FormInstance>()
const submitting = ref(false)
const checkInForm = reactive(createCheckInForm())

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

const checkInRules: FormRules = {
  actualCheckinDate: [{ required: true, message: '请选择实际入住日期', trigger: 'change' }],
  expectedCheckoutDate: [{ required: true, message: '请选择预计退房日期', trigger: 'change' }],
  registrationTime: [{ required: true, message: '请选择登记时间', trigger: 'change' }]
}

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

const handleCheckIn = async (row: PendingCheckinItemVO) => {
  try {
    resetCheckInForm()
    checkInModalVisible.value = true

    if (row.applicationId) {
      loading.value = true
      const detailData: CheckinDetailResponse = await getCheckinDetail(row.applicationId)

      checkInForm.applicationId =
        detailData.applicationId?.toString() || row.applicationId?.toString() || ''
      checkInForm.name = detailData.name || row.name || ''
      checkInForm.idCard = detailData.idCardMasked || row.idCardMasked || ''
      checkInForm.mobile = detailData.mobile || row.mobile || ''
      checkInForm.applicationTypeName =
        detailData.applicationTypeName || row.applicationTypeName || ''
      checkInForm.roomNumber = detailData.roomNo || '待分配'
      checkInForm.bedNumber = detailData.bedNo || '待分配'
      checkInForm.bedStayId = detailData.bedStayId

      const now = new Date()
      checkInForm.actualCheckinDate = detailData.actualCheckinAt
        ? new Date(detailData.actualCheckinAt).toISOString().split('T')[0]
        : now.toISOString().split('T')[0]

      checkInForm.expectedCheckoutDate = detailData.expectedCheckoutAt
        ? new Date(detailData.expectedCheckoutAt).toISOString().split('T')[0]
        : new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      checkInForm.registrationTime = now.toISOString().replace('T', ' ').slice(0, 19)
      checkInForm.registeredBy = userStore.user.username || checkInForm.registeredBy

      ElMessage.success('获取入住详情成功')
    } else {
      fillDefaultData(row)
    }
  } catch (error) {
    console.error('获取入住详情失败:', error)
    ElMessage.warning('获取详情失败，使用基本信息')
    fillDefaultData(row)
  } finally {
    loading.value = false
  }
}

const fillDefaultData = (row: PendingCheckinItemVO) => {
  const now = new Date()
  Object.assign(checkInForm, {
    applicationId: row.applicationId?.toString() || '',
    name: row.name || '',
    idCard: row.idCardMasked || '',
    mobile: row.mobile || '',
    applicationTypeName: row.applicationTypeName || '',
    roomNumber: '待分配',
    bedNumber: '待分配',
    actualCheckinDate: now.toISOString().split('T')[0],
    expectedCheckoutDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    registrationTime: now.toISOString().replace('T', ' ').slice(0, 19),
    registeredBy: userStore.user.username || '客堂义工'
  })
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

const handleCheckout = (row: InhouseItemVO) => {
  ElMessageBox.confirm(`确认办理 ${row.name} 的退房手续？`, '退单处理', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('退房办理成功')
    loadData()
  })
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

const confirmCheckIn = async () => {
  if (!checkInFormRef.value) return

  try {
    await checkInFormRef.value.validate()

    if (!checkInForm.bedStayId) {
      ElMessage.warning('缺少申请ID，无法完成入住确认')
      return
    }

    submitting.value = true

    const confirmRequest: CheckinConfirmRequest = {
      bedStayId: checkInForm.bedStayId,
      actualCheckinAt: checkInForm.actualCheckinDate
        ? `${checkInForm.actualCheckinDate} ${new Date().toTimeString().slice(0, 8)}`
        : undefined,
      expectedCheckoutAt: checkInForm.expectedCheckoutDate
        ? `${checkInForm.expectedCheckoutDate} ${new Date().toTimeString().slice(0, 8)}`
        : undefined,
      remark: checkInForm.remark
    }

    await confirmCheckin(confirmRequest)
    ElMessage.success('入住确认成功！')
    checkInModalVisible.value = false
    resetCheckInForm()
    loadData()
  } catch (error) {
    console.error('入住确认失败:', error)
    ElMessage.error('入住确认失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const resetCheckInForm = () => {
  if (checkInFormRef.value) {
    checkInFormRef.value.resetFields()
  }
  Object.assign(checkInForm, createCheckInForm())
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
.checkin-management {
  padding: 24px;
  background-color: #fdf6e3;
  min-height: 100vh;
}

.main-card {
  border-radius: 12px;
  padding: 12px 10px;
  background-color: white;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.tab-navigation) {
  border-bottom: 1px solid #f0f2f5;
  padding: 12px 24px;

  :deep(.tab-buttons) {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  :deep(.tab-btn) {
    background: #f5f7fa;
    border: 1px solid #ebeef5;
    border-radius: 20px;
    padding: 8px 14px;
    cursor: pointer;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  :deep(.tab-btn.active) {
    background: #ecf5ff;
    color: #409eff;
    border-color: #d9ecff;
  }

  :deep(.filter-section) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
  }

  .table-content {
    padding: 0 24px;
  }

  :deep(.guest-info) {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :deep(.guest-name),
  :deep(.room-info .room-number),
  :deep(.date-info .date),
  :deep(.days-info .days) {
    font-weight: 500;
    color: #303133;
  }

  :deep(.guest-id),
  :deep(.room-info .bed-number),
  :deep(.room-info .room-capacity),
  :deep(.date-info .time) {
    font-size: 14px;
    color: #909399;
  }

  :deep(.action-buttons) {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .pagination-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-top: 1px solid #f0f2f5;

    .pagination-info {
      font-size: 14px;
      color: #909399;
    }
  }

  .check-in-section {
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background-color: #fff;
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .info-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
  }

  .info-item {
    flex: 1;
    min-width: 0;
  }

  .info-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
  }

  .info-value {
    font-size: 14px;
    color: #333;
  }

  .check-in-notice {
    margin-top: 12px;
    padding: 15px;
    background-color: #fff8e1;
    border: 1px solid #ffe082;
    border-radius: 8px;
  }

  .notice-title {
    font-size: 16px;
    font-weight: bold;
    color: #ff9800;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .notice-list {
    list-style-type: disc;
    padding-left: 20px;
    margin: 0;

    li {
      font-size: 14px;
      color: #333;
      margin-bottom: 5px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #ebeef5;
    background-color: #f5f7fa;
  }

  :deep(.el-form-item) {
    margin-bottom: 15px;
  }

  :deep(.el-form-item__label) {
    font-size: 14px;
    color: #666;
  }

  :deep(.el-form-item__content) {
    line-height: normal;
  }
}
</style>
