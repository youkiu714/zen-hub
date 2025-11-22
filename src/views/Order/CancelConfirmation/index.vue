<template>
  <div class="cancel-confirmation">
    <!-- 页面标题 -->
    <PageHeader title="退单确认" />

    <TabNavigation :tabs="tabs" :active-tab="activeTab" @change="handleTabChange" />

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键词搜索">
          <el-input v-model="queryForm.keyword" placeholder="申请编号、申请人姓名或房间号" clearable style="width: 250px"
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px"
            @change="handleSearch">
            <el-option label="全部" :value="undefined" />
            <el-option label="待审核" :value="0" />
            <el-option label="已批准" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请类型">
          <el-select v-model="queryForm.applicationType" placeholder="全部类型" clearable style="width: 120px"
            @change="handleSearch">
            <el-option v-for="item in applicationTypeOptions" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="退单日期">
          <el-date-picker v-model="queryForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon>
              <Filter />
            </el-icon>
            筛选
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3 class="card-title">退单申请列表</h3>
          <div class="card-actions">
            <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchReject">
              <el-icon>
                <Close />
              </el-icon>
              批量拒绝
            </el-button>
            <el-button type="success" :disabled="selectedRows.length === 0" @click="handleBatchApprove">
              <el-icon>
                <Check />
              </el-icon>
              批量批准
            </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" size="large" style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="checkoutId" label="退单ID" width="100" />
        <el-table-column label="申请人" min-width="150">
          <template #default="{ row }">
            <div class="applicant-info">
              <el-avatar :size="40" class="applicant-avatar">
                <el-icon>
                  <User />
                </el-icon>
              </el-avatar>
              <div class="applicant-details">
                <div class="applicant-name">{{ row.applicantName }}</div>
                <div class="applicant-id">{{ row.idCardMasked }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别/年龄" width="100">
          <template #default="{ row }">
            <div>{{ row.gender === 1 ? '男' : '女' }} / {{ row.age }}岁</div>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="联系电话" width="120">
          <template #default="{ row }">
            {{ maskPhone(row.mobile) }}
          </template>
        </el-table-column>
        <el-table-column label="申请类型" width="100">
          <template #default="{ row }">
            {{ getApplicationTypeText(row.applicationType) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkinDate" label="入住日期" width="120" />
        <el-table-column prop="checkoutDate" label="原定退单" width="120" />
        <el-table-column prop="actualCheckoutDate" label="实际退单" width="120" />
        <el-table-column prop="stayDays" label="住宿天数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="performanceLevel" label="表现等级" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)"> 查看 </el-button>
            <el-button v-if="row.status === 0" type="success" link @click="handleApprove(row)">
              批准
            </el-button>
            <el-button v-if="row.status === 0" type="danger" link @click="handleReject(row)">
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到
          {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条记录
        </div>
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Filter, Download, User, House, Close, Check, Clock } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import { getCheckouts, type CheckoutQueryParams, type CheckoutRecord, type CancelConfirmationTabKey } from '@/api/checkout'
import { applicationTypeOptions } from '@/utils/constants'

// 查询表单数据
const queryForm = reactive<CheckoutQueryParams>({
  keyword: '',
  status: undefined,
  applicationType: undefined,
  startDate: '',
  endDate: '',
  current: 1,
  size: 10
})

// 表格数据
const tableData = ref<CheckoutRecord[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref<CheckoutRecord[]>([])

// 弹窗状态
const detailVisible = ref(false)
const processVisible = ref(false)
const processing = ref(false)
const currentDetail = ref<CheckoutRecord | null>(null)
const processAction = ref<'approve' | 'reject'>('approve')
const currentApplicationId = ref(0)

const activeTab = ref<CancelConfirmationTabKey>('pending')

// 处理表单
const processFormRef = ref()
const processForm = reactive({
  applicationId: 0,
  confirmationAction: 'approve',
  rejectionReason: '',
  refundAmount: 0,
  refundMethod: '',
  processNote: ''
})

const pagination = reactive<PaginationParams>({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表单验证规则
const processRules = computed(() => ({
  rejectionReason:
    processAction.value === 'reject'
      ? [
        { required: true, message: '请输入拒绝原因', trigger: 'blur' },
        { min: 5, message: '拒绝原因至少需要5个字符', trigger: 'blur' }
      ]
      : [],
  refundAmount:
    processAction.value === 'approve'
      ? [
        { required: true, message: '请输入退款金额', trigger: 'blur' },
        { type: 'number', min: 0, message: '退款金额不能小于0', trigger: 'blur' }
      ]
      : [],
  refundMethod:
    processAction.value === 'approve'
      ? [{ required: true, message: '请选择退款方式', trigger: 'change' }]
      : []
}))

// 处理弹窗标题
const processDialogTitle = computed(() => {
  return processAction.value === 'approve' ? '批准退单' : '拒绝退单'
})

const handleTabChange = (key: CheckinTabKey) => {
  activeTab.value = key
  pagination.current = 1
  fetchCheckoutList()
}

// 获取退单记录列表
const fetchCheckoutList = async () => {
  try {
    loading.value = true

    // 处理日期范围
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      queryForm.startDate = queryForm.dateRange[0]
      queryForm.endDate = queryForm.dateRange[1]
    } else {
      queryForm.startDate = ''
      queryForm.endDate = ''
    }

    // 设置分页参数
    queryForm.current = currentPage.value
    queryForm.size = pageSize.value

    const response = await getCheckouts(queryForm)

    tableData.value = response.records
    total.value = response.total
    currentPage.value = response.current

  } catch (error) {
    console.error('获取退单记录失败:', error)
    ElMessage.error('获取退单记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索和筛选处理
const handleSearch = () => {
  currentPage.value = 1
  fetchCheckoutList()
}

const handleFilter = () => {
  currentPage.value = 1
  fetchCheckoutList()
}

// 导出处理
const handleExport = async () => {
  try {
    // 导出当前查询条件下的所有数据
    const exportParams = { ...queryForm, current: 1, size: 9999 }
    const response = await getCheckouts(exportParams)

    if (response.code === 0 && response.data) {
      const exportData = response.data.records.map((item) => ({
        退单ID: item.checkoutId,
        申请编号: item.applicationNumber,
        申请人: item.applicantName,
        性别: item.gender === 1 ? '男' : '女',
        年龄: item.age,
        联系电话: maskPhone(item.mobile),
        身份证号: item.idCardMasked,
        申请类型: getApplicationTypeText(item.applicationType),
        入住日期: item.checkinDate,
        原定退单日期: item.checkoutDate,
        实际退单日期: item.actualCheckoutDate,
        住宿天数: item.stayDays,
        状态: getStatusText(item.status),
        表现等级: item.performanceLevel
      }))

      // 创建CSV格式的导出数据
      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map((item) => Object.values(item).join(','))
      ].join('\n')

      // 创建下载链接
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `退单记录_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      ElMessage.success('导出成功')
    } else {
      ElMessage.error('导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 选择行处理
const handleSelectionChange = (selection: CheckoutRecord[]) => {
  selectedRows.value = selection
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchCheckoutList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchCheckoutList()
}

// 查看详情
const handleViewDetail = async (row: CheckoutRecord) => {
  try {
    currentDetail.value = row
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 批准退单
const handleApprove = (row?: CheckoutRecord) => {
  const applicationId = row ? row.applicationId : 0

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
const handleReject = (row?: CheckoutRecord) => {
  const applicationId = row ? row.applicationId : 0

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
    await new Promise((resolve) => setTimeout(resolve, 1500))

    ElMessage.success('批量批准成功')
    selectedRows.value = []
    fetchCheckoutList()
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
    await new Promise((resolve) => setTimeout(resolve, 1500))

    ElMessage.success('批量拒绝成功')
    selectedRows.value = []
    fetchCheckoutList()
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
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 这里会调用真实的API
    // await processCancelConfirmation(processForm)

    const actionText = processAction.value === 'approve' ? '批准' : '拒绝'
    ElMessage.success(`退单申请${actionText}成功`)
    processVisible.value = false
    detailVisible.value = false

    // 刷新列表
    fetchCheckoutList()
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

const getStatusTagType = (status: number) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '已批准'
    case 2:
      return '已拒绝'
    default:
      return '未知'
  }
}

const getApplicationTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '短住'
    case 2:
      return '直通车'
    case 3:
      return '僧亲'
    case 4:
      return '团队挂单'
    case 5:
      return '特殊客人'
    default:
      return '未知'
  }
}

const calculateRefundAmount = (detail: CheckoutRecord) => {
  // 简单的退款金额计算逻辑，实际项目中可能更复杂
  return 0 // 根据实际业务逻辑计算
}

// 页面加载时获取数据
onMounted(() => {
  fetchCheckoutList()
})
</script>

<style scoped lang="scss">
.cancel-confirmation {
  padding: 20px;

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
        color: #8b5a2b;
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
