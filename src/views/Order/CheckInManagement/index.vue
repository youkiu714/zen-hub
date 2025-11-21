<template>
  <div class="checkin-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">入住管理</h2>
      <p class="page-desc">管理客人入住、续住和退住流程</p>
    </div>

    <!-- 主要内容卡片 -->
    <el-card class="main-card" shadow="hover">
      <!-- 页签导航 -->
      <div class="tab-navigation">
        <div class="tab-buttons">
          <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="handleTabChange(tab.key)">
            {{ tab.label }}
            <el-badge v-if="tab.count !== undefined" :value="tab.count"
              :type="activeTab === tab.key ? 'primary' : 'info'" class="tab-badge" />
          </button>
        </div>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="filter-section">
        <div class="filter-left">
          <el-input v-model="searchKeyword" :placeholder="getSearchPlaceholder()" prefix-icon="Search" clearable
            style="width: 320px" @input="handleSearchInput" />
        </div>
        <div class="filter-right">
          <el-select v-model="selectedRoomType" placeholder="所有房间类型" style="width: 160px" clearable
            @change="handleFilterChange">
            <el-option label="所有房间类型" value="" />
            <el-option label="标准间" value="标准间" />
            <el-option label="豪华间" value="豪华间" />
            <el-option label="套房" value="套房" />
            <el-option label="总统套房" value="总统套房" />
          </el-select>

          <el-select v-model="selectedStatus" placeholder="所有状态" style="width: 140px" clearable
            @change="handleFilterChange">
            <el-option label="所有状态" value="" />
            <el-option label="已预订" value="已预订" />
            <el-option label="已确认" value="已确认" />
            <el-option label="已取消" value="已取消" />
          </el-select>

          <el-button type="primary" @click="handleFilter">
            <el-icon>
              <Filter />
            </el-icon>
            筛选
          </el-button>
        </div>
      </div>

      <!-- 表格内容 -->
      <div class="table-content">
        <!-- 待入住表格 -->
        <div v-show="activeTab === 'pending'" v-loading="loading">
          <el-table :data="pendingList" stripe>
            <el-table-column label="客人信息" min-width="200">
              <template #default="{ row }">
                <div class="guest-info">
                  <el-avatar :size="40">
                    {{ row.name?.charAt(0) }}
                  </el-avatar>
                  <div class="guest-details">
                    <div class="guest-name">{{ row.name }}</div>
                    <div class="guest-id">身份证号: {{ row.idCardMasked }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="申请类型" min-width="120">
              <template #default="{ row }">
                <el-tag :type="getOrderTypeTagType(row.applicationTypeName)" size="small">
                  {{ row.applicationTypeName }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="预计入住日期" min-width="140">
              <template #default="{ row }">
                <div class="date-info">
                  <div class="date">{{ row.expectedCheckinDate }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="挂单天数" min-width="100">
              <template #default="{ row }">
                <div class="days-info">
                  <div class="days">{{ row.days }}天</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag type="warning" size="small">
                  {{ row.statusDesc }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200" align="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-tooltip content="入住登记" placement="top">
                    <el-button type="primary" size="small" circle @click="handleCheckIn(row)">
                      <el-icon>
                        <Right />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="分床" placement="top">
                    <el-button type="info" size="small" circle @click="handleBedAssignment(row)">
                      <el-icon>
                        <Grid />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="床位确认" placement="top">
                    <el-button type="warning" size="small" circle @click="handleBedConfirmation(row)">
                      <el-icon>
                        <Check />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="查看详情" placement="top">
                    <el-button type="default" size="small" circle @click="handleViewDetail(row.applicationId)">
                      <el-icon>
                        <View />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 已入住表格 -->
        <div v-show="activeTab === 'checked-in'" v-loading="loading">
          <el-table :data="checkedInList" stripe>
            <el-table-column label="客人信息" min-width="200">
              <template #default="{ row }">
                <div class="guest-info">
                  <el-avatar :size="40">
                    {{ row.name?.charAt(0) }}
                  </el-avatar>
                  <div class="guest-details">
                    <div class="guest-name">{{ row.name }}</div>
                    <div class="guest-id">ID: {{ row.personId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="房间信息" min-width="120">
              <template #default="{ row }">
                <div class="room-info">
                  <div class="room-number">{{ row.roomNo }}</div>
                  <div class="bed-number">床位: {{ row.bedNo }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="入住信息" min-width="160">
              <template #default="{ row }">
                <div class="date-info">
                  <div class="date">{{ formatDate(row.checkinAt) }}</div>
                  <div class="time">已住 {{ row.stayedDays }}天</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="预计退房" min-width="160">
              <template #default="{ row }">
                <div class="date-info">
                  <div class="date">{{ formatDate(row.expectedCheckoutAt) }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="住宿ID" min-width="100">
              <template #default="{ row }">
                <el-tag type="info" size="small">
                  {{ row.bedStayId }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" align="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-tooltip content="续单确认" placement="top">
                    <el-button type="primary" size="small" circle @click="handleRenewal(row)">
                      <el-icon>
                        <Calendar />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="退单处理" placement="top">
                    <el-button type="danger" size="small" circle @click="handleCheckout(row)">
                      <el-icon>
                        <Right />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="查看详情" placement="top">
                    <el-button type="default" size="small" circle @click="handleViewDetail(row.applicationId)">
                      <el-icon>
                        <View />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="审核流程" placement="top">
                    <el-button type="default" size="small" circle @click="handleReview(row.applicationId)">
                      <el-icon>
                        <Operation />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 已退住表格 -->
        <div v-show="activeTab === 'checked-out'" v-loading="loading">
          <el-table :data="checkedOutList" stripe>
            <el-table-column label="客人信息" min-width="200">
              <template #default="{ row }">
                <div class="guest-info">
                  <el-avatar :src="row.guest.avatar" :size="40">
                    {{ row.guest.name.charAt(0) }}
                  </el-avatar>
                  <div class="guest-details">
                    <div class="guest-name">{{ row.guest.name }}</div>
                    <div class="guest-id">ID: {{ row.order?.orderId }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="房间信息" min-width="140">
              <template #default="{ row }">
                <div class="room-info">
                  <div class="room-number">{{ row.room.roomType }} {{ row.room.roomNumber }}</div>
                  <div class="room-capacity">{{ row.room.capacity }}位成人</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="入住日期" min-width="140">
              <template #default="{ row }">
                <div class="date-info">
                  <div class="date">{{ row.checkIn.checkInDate }}</div>
                  <div class="time">{{ row.checkIn.checkInTime }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="退住日期" min-width="140">
              <template #default="{ row }">
                <div class="date-info">
                  <div class="date">{{ row.actualCheckOutDate }}</div>
                  <div class="time">{{ row.actualCheckOutTime }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="住宿天数" min-width="100">
              <template #default="{ row }">
                <div class="days-info">
                  <div class="days">{{ row.totalDays }}天</div>
                  <div class="status">已完成</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" align="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-tooltip content="发送遗漏物品通知" placement="top">
                    <el-button type="primary" size="small" circle @click="handleLostItemNotification(row)">
                      <el-icon>
                        <Message />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="表现评价" placement="top">
                    <el-button type="warning" size="small" circle @click="handleEvaluation(row)">
                      <el-icon>
                        <Star />
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="查看详情" placement="top">
                    <el-button type="default" size="small" circle @click="handleViewDetails(row)">
                      <el-icon>
                        <View />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <div class="pagination-info">
          显示 {{ (pagination.current - 1) * pagination.pageSize + 1 }}-{{
            Math.min(pagination.current * pagination.pageSize, pagination.total)
          }} 条，共 {{ pagination.total }} 条
        </div>
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="prev, pager, next, jumper, sizes, total"
          @size-change="handlePageSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 入住登记模态框 -->
    <el-dialog
      v-model="checkInModalVisible"
      :title="`入住登记 - ${selectedRecord?.applicationId || ''}`"
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
        <!-- 滚动内容区域 -->
        <div class="dialog-content-wrapper">
          <!-- 入住人信息 -->
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

          <!-- 房间及床位信息 -->
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

          <!-- 入住日期信息 -->
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

          <!-- 入住登记信息 -->
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
                <el-input v-model="checkInForm.registeredBy" readonly :value="userStore.user.username" />
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

          <!-- 入住须知 -->
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'
import {
  Search,
  Filter,
  Right,
  Grid,
  Check,
  View,
  Calendar,
  Message,
  Star,
  User,
  House,
  EditPen,
  InfoFilled
} from '@element-plus/icons-vue'
import type {
  CheckedOutRecord,
  CheckInFormData,
  PaginationParams,
  PendingCheckinRequest,
  InhouseRequest,
  PendingCheckinItemVO,
  InhouseItemVO,
  CheckinDetailVO,
  CheckinDetailResponse,
  CheckinConfirmRequest,
  CheckinConfirmResponse
} from '@/types/checkin'
import {
  getPendingCheckinList,
  getInhouseList,
  getCheckinDetail,
  confirmCheckin
} from '@/api/checkin'

import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()

// 响应式数据
const activeTab = ref<'pending' | 'checked-in' | 'checked-out'>('pending')
const loading = ref(false)
const searchKeyword = ref('')
const selectedRoomType = ref('')
const selectedStatus = ref('')

const detailVisible = ref(false)
const currentAppId = ref(0)

const reviewVisible = ref(false)
const currentReviewId = ref(0)

// 分页
const pagination = reactive<PaginationParams>({
  current: 1,
  pageSize: 10,
  total: 0
})

// 页签配置
const tabs = computed(() => [
  {
    key: 'pending',
    label: '待入住',
    count: 12
  },
  {
    key: 'checked-in',
    label: '已入住',
    count: 36
  },
  {
    key: 'checked-out',
    label: '已退住',
    count: 0
  }
])

// 表格数据
const pendingList = ref<PendingCheckinItemVO[]>([])
const checkedInList = ref<InhouseItemVO[]>([])
const checkedOutList = ref<CheckedOutRecord[]>([])

// 入住登记表单
const checkInModalVisible = ref(false)
const checkInFormRef = ref<FormInstance>()
const checkInFormRef2 = ref<FormInstance>()
const submitting = ref(false)
const selectedRecord = ref<any>(null)
const checkInForm = reactive<CheckInFormData & {
  bedStayId?: number;
  actualCheckinAt?: string;
  applicationId: string;
  name: string;
  idCard: string;
  mobile: string;
  applicationTypeName: string;
  roomNumber: string;
  bedNumber: string;
  actualCheckinDate: string;
  expectedCheckoutDate: string;
  remark: string;
  registeredBy: string;
  registrationTime: string;
}>({
  name: '',
  idCard: '',
  mobile: '',
  applicationTypeName: '',
  applicationId: '',
  roomNumber: '',
  bedNumber: '',
  actualCheckinDate: '',
  expectedCheckoutDate: '',
  remark: '',
  registeredBy: '客堂义工',
  registrationTime: '',
  bedStayId: undefined,
  actualCheckinAt: undefined
})

const checkInRules: FormRules = {
  actualCheckinDate: [
    { required: true, message: '请选择实际入住日期', trigger: 'change' }
  ],
  expectedCheckoutDate: [
    { required: true, message: '请选择预计退房日期', trigger: 'change' }
  ],
  registrationTime: [
    { required: true, message: '请选择登记时间', trigger: 'change' }
  ]
}

// 数据加载
const loadPendingData = async () => {

  const params: PendingCheckinRequest = {
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    keyword: searchKeyword.value || undefined
  }

  const response = await getPendingCheckinList(params)

  pendingList.value = response.records || []
  pagination.total = response.total || 0

}

const loadInhouseData = async () => {

  const params: InhouseRequest = {
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    keywordOrRoomNo: searchKeyword.value || undefined
  }

  const response = await getInhouseList(params)

  checkedInList.value = response.records || []
  pagination.total = response.total || 0

}

// 事件处理
const handleTabChange = (tab: 'pending' | 'checked-in' | 'checked-out') => {
  activeTab.value = tab
  pagination.current = 1
  searchKeyword.value = '' // 清空搜索关键字
  loadData()
}

const handleSearchInput = () => {
  // 防抖搜索
  setTimeout(() => {
    loadData()
  }, 500)
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleFilter = () => {
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


const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}

const onReviewClosed = () => {
  console.log('审核流程窗口已关闭')
}

// 获取订单类型标签颜色
const getOrderTypeTagType = (type: string) => {
  switch (type) {
    case '短住':
      return 'primary'
    case '团单':
      return 'warning'
    case '直通车':
      return 'success'
    default:
      return 'info'
  }
}

// 格式化日期时间
const formatDate = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-'
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateTimeStr
  }
}

// 获取搜索提示文本
const getSearchPlaceholder = () => {
  switch (activeTab.value) {
    case 'pending':
      return '搜索客人姓名...'
    case 'checked-in':
      return '搜索客人姓名或房间号...'
    case 'checked-out':
      return '搜索客人姓名...'
    default:
      return '搜索...'
  }
}

// 操作处理
const handleCheckIn = async (row: PendingCheckinItemVO) => {
  try {
    // 设置基础信息
    selectedRecord.value = row
    checkInModalVisible.value = true

    // 如果有applicationId，则调用详情接口获取完整信息
    if (row.applicationId) {
      loading.value = true

      const response: CheckinDetailResponse = await getCheckinDetail(row.applicationId) // 12

      console.log(response);
      
      // if (response.success && response.data) {
        const detailData = response

        // 填充表单数据
        checkInForm.applicationId = detailData.applicationId?.toString() || row.applicationId?.toString() || ''
        checkInForm.name = detailData.name || row.name || ''
        checkInForm.idCard = detailData.idCardMasked || row.idCardMasked || ''
        checkInForm.mobile = detailData.mobile || row.mobile || ''
        checkInForm.applicationTypeName = detailData.applicationTypeName || row.applicationTypeName || ''
        checkInForm.roomNumber = detailData.roomNo || '待分配'
        checkInForm.bedNumber = detailData.bedNo || '待分配'
        checkInForm.bedStayId = detailData.bedStayId
        

        // 处理日期
        const now = new Date()
        checkInForm.actualCheckinDate = detailData.actualCheckinAt
          ? new Date(detailData.actualCheckinAt).toISOString().split('T')[0]
          : now.toISOString().split('T')[0]

        checkInForm.expectedCheckoutDate = detailData.expectedCheckoutAt
          ? new Date(detailData.expectedCheckoutAt).toISOString().split('T')[0]
          : new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        checkInForm.registrationTime = now.toISOString().replace('T', ' ').slice(0, 19)

        ElMessage.success('获取入住详情成功')

    } else {
      // 没有applicationId，使用默认数据
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

// 填充默认数据
const fillDefaultData = (row: PendingCheckinItemVO) => {
  checkInForm.applicationId = row.applicationId?.toString() || ''
  checkInForm.name = row.name || ''
  checkInForm.idCard = row.idCardMasked || ''
  checkInForm.mobile = row.mobile || ''
  checkInForm.applicationTypeName = row.applicationTypeName || ''
  checkInForm.roomNumber = '待分配'
  checkInForm.bedNumber = '待分配'

  // 设置默认值
  const now = new Date()
  checkInForm.actualCheckinDate = now.toISOString().split('T')[0]
  checkInForm.expectedCheckoutDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  checkInForm.registrationTime = now.toISOString().replace('T', ' ').slice(0, 19)

  console.log(now.toISOString().split('T')[0]);
  
  
  // const isoDate = new Date().toISOString().split('T')[0];
  // console.log(isoDate); // 例如：2025-11-19
}

const handleBedAssignment = (row: PendingCheckinItemVO) => {
  ElMessage.info('分床功能')
}

const handleBedConfirmation = (row: PendingCheckinItemVO) => {
  ElMessage.info('床位确认功能')
}

const handleRenewal = (row: InhouseItemVO) => {
  ElMessage.info('续单确认功能')
}

const handleCheckout = (row: InhouseItemVO) => {
  ElMessageBox.confirm(
    `确认办理 ${row.name} 的退房手续？`,
    '退单处理',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('退房办理成功')
    loadData()
  })
}

const handleLostItemNotification = (row: CheckedOutRecord) => {
  ElMessage.info('发送遗漏物品通知功能')
}

const handleEvaluation = (row: CheckedOutRecord) => {
  ElMessage.info('客人表现评价功能')
}

const handleViewDetails = (row: any) => {
  ElMessage.info('查看详情功能')
}

const handleViewDetail = (id: number) => {
  currentAppId.value = id
  detailVisible.value = true
}

const handleReview = (id: number) => {
  console.log('审核流程:', id)
  currentReviewId.value = id
  reviewVisible.value = true
}

// 入住登记相关
const confirmCheckIn = async () => {
  if (!checkInFormRef.value) return

  try {
    // 验证表单
    await checkInFormRef.value.validate()

    // 验证必填字段
    if (!checkInForm.bedStayId) {
      ElMessage.warning('缺少申请ID，无法完成入住确认')
      return
    }

    submitting.value = true

    // 构建确认入住请求参数
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

    console.log('确认入住请求参数:', confirmRequest)

    // 调用确认入住API
    const response: CheckinConfirmResponse = await confirmCheckin(confirmRequest)
    ElMessage.success('入住确认成功！')
    checkInModalVisible.value = false
    resetCheckInForm()
    loadData() // 刷新列表数据

    // if (response.success || response.code === 0) {
    //   ElMessage.success('入住确认成功！')
    //   checkInModalVisible.value = false
    //   resetCheckInForm()
    //   loadData() // 刷新列表数据
    // } else {
    //   ElMessage.error(`入住确认失败: ${response.message || '未知错误'}`)
    // }

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
  if (checkInFormRef2.value) {
    checkInFormRef2.value.resetFields()
  }

  selectedRecord.value = null
  Object.assign(checkInForm, {
    name: '',
    idCard: '',
    mobile: '',
    applicationTypeName: '',
    applicationId: '',
    roomNumber: '',
    bedNumber: '',
    actualCheckinDate: '',
    expectedCheckoutDate: '',
    remark: '',
    registeredBy: '客堂义工',
    registrationTime: '',
    bedStayId: undefined,
    actualCheckinAt: undefined
  })
}

// 数据加载
const loadData = async () => {
  loading.value = true
  try {
    switch (activeTab.value) {
      case 'pending':
        await loadPendingData()
        break
      case 'checked-in':
        await loadInhouseData()
        break
      case 'checked-out':
        // 暂时使用空数据，等待接口实现
        checkedOutList.value = []
        pagination.total = 0
        break
    }
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.checkin-management {
  padding: 24px;
  background-color: #fdf6e3;
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-desc {
      font-size: 16px;
      color: #606266;
      margin: 0;
    }
  }

  .main-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .tab-navigation {
    border-bottom: 1px solid #e6e8eb;

    .tab-buttons {
      display: flex;
      padding: 0 24px;

      .tab-btn {
        position: relative;
        padding: 16px 24px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        font-size: 16px;
        font-weight: 500;
        color: #606266;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover {
          color: #409eff;
        }

        &.active {
          color: #409eff;
          border-bottom-color: #409eff;
        }

        .tab-badge {
          margin-left: 4px;
        }
      }
    }
  }

  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #f0f2f5;

    .filter-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .filter-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .table-content {
    padding: 0 24px;

    .guest-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .guest-details {
        .guest-name {
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .guest-id {
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .room-info {
      .room-number {
        font-weight: 500;
        color: #303133;
      }

      .bed-number {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }

      .room-capacity {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .date-info {
      .date {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .time {
        font-size: 14px;
        color: #909399;
      }
    }

    .days-info {
      .days {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .status {
        font-size: 14px;
        color: #67c23a;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
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

  :deep(.el-table) {
    .el-table__header-wrapper {
      .el-table__header {
        th {
          background-color: #f8f9fa;
          color: #303133;
          font-weight: 600;
          border-bottom: 1px solid #e6e8eb;
        }
      }
    }

    .el-table__row {
      &:hover {
        background-color: #ecf5ff;
      }
    }
  }

  // 入住登记弹窗样式
  :deep(.check-in-dialog) {
    margin-top: 5vh !important;
    max-height: 90vh;

    .el-dialog {
      margin-top: 5vh !important;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .el-dialog__header {
      background-color: #fafbfc;
      border-bottom: 1px solid #e6e8eb;
      padding: 16px 20px;
      margin: 0;
      flex-shrink: 0;

      .el-dialog__title {
        color: #8B5E3C;
        font-weight: 600;
        font-size: 18px;
      }
    }

    .el-dialog__body {
      padding: 0;
      flex: 1;
      overflow: hidden;
    }

    .el-dialog__footer {
      background-color: #f8f9fa;
      border-top: 1px solid #e6e8eb;
      padding: 16px 20px;
      margin: 0;
      flex-shrink: 0;
    }
  }

  // 滚动内容区域
  .dialog-content-wrapper {
    height: 100%;
    max-height: 60vh;
    overflow-y: auto;
    padding: 20px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }

  .check-in-section {
    margin-bottom: 24px;
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e6e8eb;

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f2f5;

      .section-icon {
        color: #8B5E3C;
        margin-right: 8px;
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        transform: scale(1);
      }

      .section-title {
        font-weight: 600;
        color: #333;
        font-size: 16px;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;

      .info-item {
        display: flex;
        flex-direction: column;

        .info-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .info-value {
          font-size: 14px;
          color: #333;
          font-weight: 400;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
  }

  .check-in-notice {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    .notice-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .notice-icon {
        color: #8B5E3C;
        margin-right: 8px;
        font-size: 16px;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        transform: scale(1);
      }

      .notice-title {
        font-weight: 600;
        color: #8B5E3C;
        font-size: 14px;
      }
    }

    .notice-list {
      margin: 0;
      padding-left: 20px;

      li {
        font-size: 13px;
        color: #856404;
        margin-bottom: 4px;
        line-height: 1.4;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      padding: 12px 24px;
      font-weight: 500;
      border-radius: 6px;
    }
  }

  // SVG 图标大小控制
  .svg-icon-small {
    width: 16px !important;
    height: 16px !important;
    font-size: 16px !important;

    svg {
      width: 16px !important;
      height: 16px !important;
    }
  }
}

//------------------------

.dialog-content-wrapper {
  padding: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.check-in-section {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
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

/* 入住须知样式 */
.check-in-notice {
  margin-top: 20px;
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
}

.notice-list li {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

/* 底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

/* 调整 el-form-item 样式，使其更紧凑 */
::v-deep(.el-form-item) {
  margin-bottom: 15px;
}

::v-deep(.el-form-item__label) {
  font-size: 14px;
  color: #666;
}

::v-deep(.el-form-item__content) {
  line-height: normal;
}
</style>