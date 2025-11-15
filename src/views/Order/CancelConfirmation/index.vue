<template>
  <div class="cancel-confirmation">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">退单确认</h2>
      <p class="page-description">对申请退单的挂单记录进行审核确认，包括退款处理和相关操作记录</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键词搜索">
          <el-input
            v-model="queryForm.keyword"
            placeholder="申请编号、申请人姓名或房间号"
            clearable
            style="width: 250px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select
            v-model="queryForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="退单日期">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Filter /></el-icon>
            筛选
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3 class="card-title">退单申请列表</h3>
          <div class="card-actions">
            <el-button
              type="danger"
              :disabled="selectedRows.length === 0"
              @click="handleBatchReject"
            >
              <el-icon><Close /></el-icon>
              批量拒绝
            </el-button>
            <el-button
              type="success"
              :disabled="selectedRows.length === 0"
              @click="handleBatchApprove"
            >
              <el-icon><Check /></el-icon>
              批量批准
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="applicationId" label="申请编号" width="150" />
        <el-table-column label="申请人" min-width="150">
          <template #default="{ row }">
            <div class="applicant-info">
              <el-avatar :size="40" :src="row.avatar" class="applicant-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="applicant-details">
                <div class="applicant-name">{{ row.applicantName }}</div>
                <div class="applicant-id">{{ maskIdCard(row.idCard) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="房间信息" min-width="120">
          <template #default="{ row }">
            <div class="room-info">
              <div class="room-number">{{ row.roomInfo.roomNumber }}</div>
              <div class="bed-number">{{ row.roomInfo.bedNumber }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="checkinDate" label="入住日期" width="120" />
        <el-table-column prop="expectedCheckout" label="原定离店" width="120" />
        <el-table-column label="退单原因" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.cancelReason" placement="top">
              <div class="reason-text">{{ row.cancelReason }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="cancelDate" label="申请日期" width="120" />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.cancelStatus)" size="small">
              {{ getStatusText(row.cancelStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请人" width="100">
          <template #default="{ row }">
            <div class="requester-info">
              <div>{{ row.requestedBy }}</div>
              <div class="text-xs text-gray-500">{{ maskPhone(row.contactPhone) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewDetail(row)"
            >
              查看
            </el-button>
            <el-button
              v-if="row.cancelStatus === 'pending'"
              type="success"
              link
              @click="handleApprove(row)"
            >
              批准
            </el-button>
            <el-button
              v-if="row.cancelStatus === 'pending'"
              type="danger"
              link
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 退单详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="退单申请详情"
      width="900px"
    >
      <div v-if="currentDetail" class="detail-content">
        <!-- 申请人信息 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><User /></el-icon>
              <span>申请人信息</span>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="姓名">{{ currentDetail.applicantInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ maskIdCard(currentDetail.applicantInfo.idCard) }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ maskPhone(currentDetail.applicantInfo.phone) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 预订信息 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><House /></el-icon>
              <span>预订信息</span>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="入住日期">{{ currentDetail.bookingInfo.checkinDate }}</el-descriptions-item>
            <el-descriptions-item label="原定离店">{{ currentDetail.bookingInfo.expectedCheckout }}</el-descriptions-item>
            <el-descriptions-item label="实际离店">{{ currentDetail.bookingInfo.actualCheckout || '未离店' }}</el-descriptions-item>
            <el-descriptions-item label="房间号">{{ currentDetail.bookingInfo.roomNumber }}</el-descriptions-item>
            <el-descriptions-item label="床位号">{{ currentDetail.bookingInfo.bedNumber }}</el-descriptions-item>
            <el-descriptions-item label="房型">{{ currentDetail.bookingInfo.roomType }}</el-descriptions-item>
            <el-descriptions-item label="总金额">¥{{ currentDetail.bookingInfo.totalAmount }}</el-descriptions-item>
            <el-descriptions-item label="已付金额">¥{{ currentDetail.bookingInfo.paidAmount }}</el-descriptions-item>
            <el-descriptions-item label="退款金额">¥{{ calculateRefundAmount(currentDetail) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 退单信息 -->
        <el-card class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Close /></el-icon>
              <span>退单信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="退单原因" :span="2">{{ currentDetail.cancelInfo.cancelReason }}</el-descriptions-item>
            <el-descriptions-item label="申请日期">{{ currentDetail.cancelInfo.cancelDate }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ currentDetail.cancelInfo.requestedBy }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ maskPhone(currentDetail.cancelInfo.contactPhone) }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="getStatusTagType(currentDetail.status)">
                {{ getStatusText(currentDetail.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 处理历史 -->
        <el-card v-if="currentDetail.processHistory && currentDetail.processHistory.length > 0" class="detail-section" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Clock /></el-icon>
              <span>处理历史</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="history in currentDetail.processHistory"
              :key="history.id"
              :timestamp="history.actionTime"
              placement="top"
            >
              <div class="history-content">
                <div class="history-action">{{ history.action }}</div>
                <div class="history-operator">操作人：{{ history.operator }}</div>
                <div v-if="history.note" class="history-note">{{ history.note }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="currentDetail?.status === 'pending'"
          type="success"
          @click="handleApprove(currentDetail)"
        >
          批准退单
        </el-button>
        <el-button
          v-if="currentDetail?.status === 'pending'"
          type="danger"
          @click="handleReject(currentDetail)"
        >
          拒绝退单
        </el-button>
      </template>
    </el-dialog>

    <!-- 退单处理弹窗 -->
    <el-dialog
      v-model="processVisible"
      :title="processDialogTitle"
      width="600px"
      :before-close="handleProcessClose"
    >
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="100px">
        <el-form-item v-if="processAction === 'approve'" label="退款金额">
          <el-input-number
            v-model="processForm.refundAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="processAction === 'approve'" label="退款方式">
          <el-select v-model="processForm.refundMethod" placeholder="请选择退款方式" style="width: 100%">
            <el-option label="原路退回" value="original" />
            <el-option label="现金退回" value="cash" />
            <el-option label="银行转账" value="bank" />
            <el-option label="微信退款" value="wechat" />
            <el-option label="支付宝退款" value="alipay" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="processAction === 'reject'" label="拒绝原因" prop="rejectionReason">
          <el-input
            v-model="processForm.rejectionReason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="processForm.processNote"
            type="textarea"
            :rows="3"
            placeholder="可选的处理备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="handleSubmitProcess">
          确认{{ processAction === 'approve' ? '批准' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Filter, Download, User, House, Close, Check, Clock } from '@element-plus/icons-vue'
// 保留API接口以备将来使用
// import {
//   getPendingCancelList,
//   getCancelConfirmationDetail,
//   processCancelConfirmation,
//   batchProcessCancelConfirmation,
//   exportCancelConfirmationRecords
// } from '@/api/cancel-confirmation'
import type {
  PendingCancelItem,
  CancelConfirmationDetail,
  CancelConfirmationForm
} from '@/types/cancel-confirmation'

// 查询表单数据
const queryForm = reactive({
  keyword: '',
  status: '',
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<PendingCancelItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref<PendingCancelItem[]>([])

// 弹窗状态
const detailVisible = ref(false)
const processVisible = ref(false)
const processing = ref(false)
const currentDetail = ref<CancelConfirmationDetail | null>(null)
const processAction = ref<'approve' | 'reject'>('approve')
const currentApplicationId = ref('')

// 处理表单
const processFormRef = ref()
const processForm = reactive<CancelConfirmationForm>({
  applicationId: '',
  confirmationAction: 'approve',
  rejectionReason: '',
  refundAmount: 0,
  refundMethod: '',
  processNote: ''
})

// 表单验证规则
const processRules = computed(() => ({
  rejectionReason: processAction.value === 'reject' ? [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, message: '拒绝原因至少需要5个字符', trigger: 'blur' }
  ] : [],
  refundAmount: processAction.value === 'approve' ? [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '退款金额不能小于0', trigger: 'blur' }
  ] : [],
  refundMethod: processAction.value === 'approve' ? [
    { required: true, message: '请选择退款方式', trigger: 'change' }
  ] : []
}))

// 处理弹窗标题
const processDialogTitle = computed(() => {
  return processAction.value === 'approve' ? '批准退单' : '拒绝退单'
})

// 模拟数据
const mockData: PendingCancelItem[] = [
  {
    id: '1',
    applicationId: 'TD20230715001',
    applicantName: '张明远',
    idCard: '110101199001151234',
    avatar: 'https://design.gemcoder.com/staticResource/systemDefaultImages/1200x630.png',
    roomInfo: {
      roomNumber: '302室',
      bedNumber: '上铺 A2床',
      buildingName: '东禅房'
    },
    checkinDate: '2023-07-01',
    expectedCheckout: '2023-07-15',
    cancelReason: '家庭急事，需要提前离开，特申请退单处理',
    cancelDate: '2023-07-12',
    cancelStatus: 'pending',
    requestedBy: '张明远',
    contactPhone: '13812348000'
  },
  {
    id: '2',
    applicationId: 'TD20230714002',
    applicantName: '李静怡',
    idCard: '310101198506205678',
    avatar: '/src/assets/avatar/default.png',
    roomInfo: {
      roomNumber: '205室',
      bedNumber: '下铺 B1床',
      buildingName: '西禅房'
    },
    checkinDate: '2023-07-05',
    expectedCheckout: '2023-07-20',
    cancelReason: '身体不适，需要提前结束挂单返回家中休养',
    cancelDate: '2023-07-10',
    cancelStatus: 'approved',
    requestedBy: '李静怡',
    contactPhone: '13912349000'
  },
  {
    id: '3',
    applicationId: 'TD20230716003',
    applicantName: '陈教授',
    idCard: '440101195006301234',
    avatar: '/src/assets/avatar/default.png',
    roomInfo: {
      roomNumber: '101室',
      bedNumber: '单人间 A1床',
      buildingName: '贵宾楼'
    },
    checkinDate: '2023-07-05',
    expectedCheckout: '2023-07-07',
    cancelReason: '学术会议临时变更，需要提前返回学校处理相关事宜',
    cancelDate: '2023-07-06',
    cancelStatus: 'rejected',
    requestedBy: '陈教授助理',
    contactPhone: '13612346000'
  },
  {
    id: '4',
    applicationId: 'TD20230718004',
    applicantName: '王智明',
    idCard: '110101197508011234',
    avatar: '/src/assets/avatar/default.png',
    roomInfo: {
      roomNumber: '401室',
      bedNumber: '下铺 A3床',
      buildingName: '南禅房'
    },
    checkinDate: '2023-07-08',
    expectedCheckout: '2023-07-25',
    cancelReason: '工作安排冲突，需要提前离寺处理公务',
    cancelDate: '2023-07-16',
    cancelStatus: 'pending',
    requestedBy: '王智明',
    contactPhone: '13712347000'
  }
]

// 获取退单确认列表（使用模拟数据）
const fetchCancelConfirmationList = async () => {
  try {
    loading.value = true
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    let filteredData = [...mockData]

    // 关键词筛选
    if (queryForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.applicationId.toLowerCase().includes(queryForm.keyword.toLowerCase()) ||
        item.applicantName.toLowerCase().includes(queryForm.keyword.toLowerCase()) ||
        item.roomInfo.roomNumber.toLowerCase().includes(queryForm.keyword.toLowerCase())
      )
    }

    // 状态筛选
    if (queryForm.status) {
      filteredData = filteredData.filter(item => item.cancelStatus === queryForm.status)
    }

    // 日期筛选
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      const [startDate, endDate] = queryForm.dateRange
      filteredData = filteredData.filter(item => {
        return item.cancelDate >= startDate && item.cancelDate <= endDate
      })
    }

    // 分页
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    tableData.value = filteredData.slice(startIndex, endIndex)
    total.value = filteredData.length
  } catch (error) {
    console.error('获取退单确认列表失败:', error)
    ElMessage.error('获取退单确认列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索和筛选处理
const handleSearch = () => {
  currentPage.value = 1
  fetchCancelConfirmationList()
}

const handleFilter = () => {
  currentPage.value = 1
  fetchCancelConfirmationList()
}

// 导出处理
const handleExport = async () => {
  try {
    // 模拟导出延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟导出数据
    const exportData = mockData.map(item => ({
      申请编号: item.applicationId,
      申请人: item.applicantName,
      身份证号: maskIdCard(item.idCard),
      房间号: item.roomInfo.roomNumber,
      床位号: item.roomInfo.bedNumber,
      入住日期: item.checkinDate,
      原定离店: item.expectedCheckout,
      退单原因: item.cancelReason,
      申请日期: item.cancelDate,
      审核状态: getStatusText(item.cancelStatus),
      申请人: item.requestedBy,
      联系电话: maskPhone(item.contactPhone)
    }))

    // 创建CSV格式的模拟导出数据
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(item => Object.values(item).join(','))
    ].join('\n')

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `退单确认记录_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 选择行处理
const handleSelectionChange = (selection: PendingCancelItem[]) => {
  selectedRows.value = selection
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchCancelConfirmationList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchCancelConfirmationList()
}

// 查看详情
const handleViewDetail = async (row: PendingCancelItem) => {
  try {
    // 模拟获取详情延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    // 模拟详情数据
    const mockDetail: CancelConfirmationDetail = {
      applicationId: row.applicationId,
      applicantInfo: {
        name: row.applicantName,
        idCard: row.idCard,
        phone: row.contactPhone,
        avatar: row.avatar
      },
      bookingInfo: {
        checkinDate: row.checkinDate,
        expectedCheckout: row.expectedCheckout,
        actualCheckout: row.cancelStatus === 'approved' ? new Date().toISOString().split('T')[0] : undefined,
        roomNumber: row.roomInfo.roomNumber,
        bedNumber: row.roomInfo.bedNumber,
        roomType: '标准间',
        totalAmount: 300,
        paidAmount: 300
      },
      cancelInfo: {
        cancelReason: row.cancelReason,
        cancelDate: row.cancelDate,
        requestedBy: row.requestedBy,
        contactPhone: row.contactPhone
      },
      status: row.cancelStatus,
      processHistory: row.cancelStatus !== 'pending' ? [
        {
          id: '1',
          actionTime: row.cancelDate,
          action: '提交退单申请',
          operator: row.requestedBy,
          note: ''
        },
        {
          id: '2',
          actionTime: new Date().toISOString().split('T')[0],
          action: row.cancelStatus === 'approved' ? '批准退单申请' : '拒绝退单申请',
          operator: '客堂管理员',
          note: row.cancelStatus === 'approved' ? '审核通过，同意退单申请' : '不符合退单条件，予以拒绝'
        }
      ] : [
        {
          id: '1',
          actionTime: row.cancelDate,
          action: '提交退单申请',
          operator: row.requestedBy,
          note: ''
        }
      ]
    }

    currentDetail.value = mockDetail
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 批准退单
const handleApprove = (row?: PendingCancelItem | CancelConfirmationDetail) => {
  const applicationId = row ? ('applicationId' in row ? row.applicationId : row.bookingInfo.roomNumber) : ''

  processAction.value = 'approve'
  currentApplicationId.value = applicationId

  // 重置表单
  processForm.applicationId = applicationId
  processForm.confirmationAction = 'approve'
  processForm.rejectionReason = ''
  processForm.refundAmount = 300 // 默认退款金额
  processForm.refundMethod = 'original'
  processForm.processNote = ''

  processVisible.value = true
}

// 拒绝退单
const handleReject = (row?: PendingCancelItem | CancelConfirmationDetail) => {
  const applicationId = row ? ('applicationId' in row ? row.applicationId : row.bookingInfo.roomNumber) : ''

  processAction.value = 'reject'
  currentApplicationId.value = applicationId

  // 重置表单
  processForm.applicationId = applicationId
  processForm.confirmationAction = 'reject'
  processForm.rejectionReason = ''
  processForm.refundAmount = 0
  processForm.refundMethod = ''
  processForm.processNote = ''

  processVisible.value = true
}

// 批量批准
const handleBatchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批准选中的 ${selectedRows.value.length} 条退单申请吗？`,
      '批量批准确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('批量批准成功')
    selectedRows.value = []
    fetchCancelConfirmationList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('批量批准失败:', error)
    ElMessage.error('批量批准失败')
  }
}

// 批量拒绝
const handleBatchReject = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `请输入拒绝退单的原因（共 ${selectedRows.value.length} 条申请）`,
      '批量拒绝确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: (value) => {
          if (!value || value.trim().length < 5) {
            return '拒绝原因至少需要5个字符'
          }
          return true
        }
      }
    )

    // 模拟批量处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('批量拒绝成功')
    selectedRows.value = []
    fetchCancelConfirmationList()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('批量拒绝失败:', error)
    ElMessage.error('批量拒绝失败')
  }
}

// 提交处理
const handleSubmitProcess = async () => {
  try {
    await processFormRef.value.validate()

    processing.value = true

    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 这里会调用真实的API
    // await processCancelConfirmation(processForm)

    const actionText = processAction.value === 'approve' ? '批准' : '拒绝'
    ElMessage.success(`退单申请${actionText}成功`)
    processVisible.value = false
    detailVisible.value = false

    // 刷新列表
    fetchCancelConfirmationList()
  } catch (error) {
    if (error === false) {
      // 表单验证失败
      return
    }
    console.error('提交处理失败:', error)
    ElMessage.error('提交处理失败')
  } finally {
    processing.value = false
  }
}

// 关闭处理弹窗
const handleProcessClose = () => {
  processVisible.value = false
  processFormRef.value?.resetFields()
}

// 工具函数
const maskIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.slice(0, 3) + '********' + idCard.slice(-4)
}

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已批准'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知'
  }
}

const calculateRefundAmount = (detail: CancelConfirmationDetail) => {
  // 简单的退款金额计算逻辑，实际项目中可能更复杂
  if (detail.status === 'approved') {
    return detail.bookingInfo.paidAmount
  }
  return 0
}

// 页面加载时获取数据
onMounted(() => {
  fetchCancelConfirmationList()
})
</script>

<style scoped lang="scss">
.cancel-confirmation {
  padding: 20px;

  .page-header {
    text-align: center;
    margin-bottom: 30px;

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #8B5A2B;
      margin-bottom: 10px;
    }

    .page-description {
      color: #666;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #8B5A2B;
        margin: 0;
      }

      .card-actions {
        display: flex;
        gap: 12px;
      }
    }

    .applicant-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .applicant-avatar {
        flex-shrink: 0;
      }

      .applicant-details {
        .applicant-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 2px;
        }

        .applicant-id {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .room-info {
      .room-number {
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
      }

      .bed-number {
        font-size: 12px;
        color: #666;
      }
    }

    .requester-info {
      .text-xs {
        line-height: 1.2;
      }
    }

    .reason-text {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;

      .pagination-info {
        color: #666;
        font-size: 14px;
      }
    }
  }

  .detail-content {
    .detail-section {
      margin-bottom: 20px;

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
    }

    .history-content {
      .history-action {
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }

      .history-operator {
        font-size: 14px;
        color: #666;
        margin-bottom: 2px;
      }

      .history-note {
        font-size: 14px;
        color: #999;
        font-style: italic;
      }
    }
  }
}
</style>