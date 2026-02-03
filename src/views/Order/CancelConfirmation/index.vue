<template>
  <div class="cancel-confirmation">
    <!-- 页面标题 -->
    <PageHeader title="退单确认" />

    <FilterTab v-model="filterStatus" @update:modelValue="handleTabChange" :statusOptions="statusOptions" />

    <el-card class="table-card" shadow="hover">
      <el-form :model="queryForm" inline class="filter-form" v-if="filterStatus != 50">
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
      <div class="filter-bar" v-if="filterStatus == 50">
        <div style="display: flex;gap: 20px;">
        <el-date-picker v-model="checkOutDate" type="date" placeholder="请选择退住日期" clearable style="width: 150px"
          @change="handleCheckOutDateChange" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />

          <el-alert title="默认显示第二天要退单的记录，也可以选择退单日期" type="info" show-icon style="width: 500px;"/>
          </div>
      </div>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" size="large" class="cancel-table"
        :header-cell-style="{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f5f7fa' }">
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
        <el-table-column prop="mobile" label="联系电话" width="130" />
        <!-- <el-table-column label="申请类型" width="100">
          <template #default="{ row }">
            {{ getApplicationTypeText(row.applicationType) }}
          </template>
        </el-table-column> -->
        <el-table-column prop="departmentCode" label="所属部组" min-width="90" v-if="filterStatus == 50">
          <template #default="{ row }">
            {{
              departmentOptions.find((item) => item.value === row.departmentCode)?.label ?? '其他'
            }}
          </template>
        </el-table-column>
        <el-table-column prop="applicationType" label="挂单类型" min-width="90" v-if="filterStatus != 50">
          <template #default="scope">
            <span class="dot" :class="getApplicationTypeClass(scope.row.applicationType)"></span>
            {{
              applicationTypeOptions.find((item) => item.value === scope.row.applicationType)?.label ??
              '其他'
            }}
          </template>
        </el-table-column>

        <el-table-column prop="checkinDate" label="入住日期" width="120" />
        <el-table-column prop="checkoutDate" label="原定退单" width="120" />
        <el-table-column prop="actualCheckoutDate" label="实际退单" width="120" v-if="filterStatus != 50" />
        <el-table-column prop="stayDays" :label="filterStatus != 50 ? '住宿天数' : '已住天数'" width="100" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button @click="() => handleViewDetail(row)" link>
              查看
            </el-button>
            <el-button type="primary" link @click="handleConfirmCheckout(row)" v-if="row.status == 10">
              确认退单
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 10" class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <el-dialog v-model="confirmDialogVisible" title="确认退单" width="520px" :close-on-click-modal="false"
      @close="handleConfirmDialogClose">
      <el-form ref="confirmFormRef" :model="confirmForm" :rules="confirmRules" label-width="110px">
        <el-form-item label="实际退单日期" prop="actualCheckoutDate" required>
          <el-date-picker v-model="confirmForm.actualCheckoutDate" type="date" placeholder="请选择实际退单日期"
            format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="在寺表现" prop="performanceLevel" required>
          <el-select v-model="confirmForm.performanceLevel" placeholder="请选择在寺表现" style="width: 100%">
            <el-option v-for="item in performanceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="在寺表现描述" prop="performanceRemark">
          <el-input v-model="confirmForm.performanceRemark" type="textarea" :rows="3" placeholder="请输入在寺表现描述"
            maxlength="200" show-word-limit resize="none" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="confirmForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" maxlength="200"
            show-word-limit resize="none" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleConfirmDialogClose">取消</el-button>
        <el-button type="primary" :loading="confirmSubmitting" @click="submitConfirmCheckout">
          确认退单
        </el-button>
      </template>
    </el-dialog>
    <!-- 查看详情 -->
    <ApplicationDetailDialog v-model="detailVisible" :application-id="currentAppId" @close="onDetailClosed" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElAlert } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import dayjs from 'dayjs'
import { Search, Filter, User, View } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  getCheckouts,
  confirmCheckout,
  type CheckoutQueryParams,
  type CheckoutRecord,
  type CancelConfirmationTabKey,
  type ConfirmCheckoutPayload,
  PaginationParams
} from '@/api/checkout'
import { applicationTypeOptions, performanceOptions } from '@/utils/constants'
import FilterTab from '@/components/FilterTab.vue'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import { CheckinTabKey } from '../CheckInManagement/utils'
import { getCheckoutDueTomorrow, type InhouseItemVO } from '@/api/tomorrow'

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
const confirmDialogVisible = ref(false)
const confirmFormRef = ref<FormInstance>()
const confirmSubmitting = ref(false)
const currentCheckoutId = ref<number | null>(null)
const confirmForm = reactive<ConfirmCheckoutPayload>({
  actualCheckoutDate: dayjs().format('YYYY-MM-DD'),
  performanceLevel: 1,
  performanceRemark: '',
  remark: ''
})

const departmentOptions = ref([
  { label: '项目部', value: 'PROJECT' },
  { label: '教化部', value: 'READING' },
  { label: '汇编', value: 'COMPILATION' },
  { label: '其他', value: 'OTHER' }
])

const filterStatus = ref(10)
const checkOutDate = ref("")
const statusOptions = [
  {
    value: 10,
    label: '待确认',
    type: 'default',
    icon: 'Document'
  },
  {
    value: 30,
    label: '已确认',
    type: 'default',
    icon: 'Edit'
  },
  {
    value: 50,
    label: '待提醒',
    type: 'default',
    icon: 'AlarmClock'
  }
]

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

const pagination = reactive<PaginationParams>({
  current: 1,
  pageSize: 10,
  total: 0
})

const confirmRules: FormRules = {
  actualCheckoutDate: [{ required: true, message: '请选择实际退单日期', trigger: 'change' }],
  performanceLevel: [{ required: true, message: '请选择在寺表现', trigger: 'change' }],
  performanceRemark: [{ max: 200, message: '描述不超过200字', trigger: 'blur' }],
  remark: [{ max: 200, message: '备注不超过200字', trigger: 'blur' }]
}

const handleTabChange = (key: number) => {
  filterStatus.value = key
  console.log(key);
  console.log(filterStatus.value == 30);
  pagination.current = 1
  fetchCheckoutList()
}

// 获取退单记录列表
const fetchCheckoutList = async () => {
  try {
    loading.value = true


    if (filterStatus.value === 50) {

      let d = new Date();
      d.setDate(d.getDate() + 1);
      let tomorrowStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      if (checkOutDate.value) {
        tomorrowStr = checkOutDate.value
      }
      const params = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        date: tomorrowStr 
      }

      const res = await getCheckoutDueTomorrow(params)

      if (res) { 
        const { records, total } = res

        tableData.value = (records || []).map((item: InhouseItemVO) => ({
          ...item,
          id: item.applicationId,        // 申请单ID
          applicantName: item.name,      // 姓名
          gender: item.gender === 1 ? '男' : '女',
          roomNumber: item.roomNo,       // 房间号
          bedNumber: item.bedNo,         // 床位号
          mobile: item.mobile,
          checkinDate: item.checkinAt?.split(' ')[0],
          stayDays: item.stayedDays,
          checkoutDate: item.expectedCheckoutAt?.split(' ')[0], // 预计离店时间
          statusLabel: '待退单',          // 手动设置状态显示
          // 其他可能需要的字段...
        }))

        pagination.total = total || 0
      }
    }
    // === 原有逻辑：其他 Tab ===
    else {

      // 构建请求参数
      const params: CheckoutQueryParams = {
        keyword: queryForm.keyword,
        status: filterStatus.value,
        applicationType: queryForm.applicationType,
        current: currentPage.value,
        size: pageSize.value,
        startDate: '',
        endDate: ''
      }

      // 处理日期范围
      if (queryForm.dateRange && queryForm.dateRange.length === 2) {
        params.startDate = queryForm.dateRange[0]
        params.endDate = queryForm.dateRange[1]
      }

      const response = await getCheckouts(params)

      tableData.value = response.records
      total.value = response.total
      currentPage.value = response.current
    }
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

const handleCheckOutDateChange = () => {
  fetchCheckoutList()
}

// 详情对话框状态
const detailVisible = ref(false)
const currentAppId = ref<number | null>(null)

// 查看详情
const handleViewDetail = async (row: CheckoutRecord) => {
  currentAppId.value = row.applicationId
  detailVisible.value = true
}

// 关闭详情对话框
const onDetailClosed = () => {
  detailVisible.value = false
  currentAppId.value = null
}

// 确认退单
const handleConfirmCheckout = async (row: CheckoutRecord) => {
  currentCheckoutId.value = row.checkoutId
  confirmForm.actualCheckoutDate = row.actualCheckoutDate || dayjs().format('YYYY-MM-DD')
  confirmForm.performanceLevel = row.performanceLevel || 1
  confirmForm.performanceRemark = ''
  confirmForm.remark = ''
  confirmDialogVisible.value = true
}

const handleConfirmDialogClose = () => {
  confirmDialogVisible.value = false
  confirmFormRef.value?.resetFields()
  confirmForm.actualCheckoutDate = dayjs().format('YYYY-MM-DD')
  confirmForm.performanceLevel = 1
  confirmForm.performanceRemark = ''
  confirmForm.remark = ''
  currentCheckoutId.value = null
}

const submitConfirmCheckout = async () => {
  try {
    if (!confirmFormRef.value) return
    if (!currentCheckoutId.value) {
      ElMessage.error('未找到退单记录')
      return
    }

    await confirmFormRef.value.validate()
    confirmSubmitting.value = true

    await confirmCheckout(currentCheckoutId.value, { ...confirmForm })
    ElMessage.success('退单确认成功')
    handleConfirmDialogClose()

    fetchCheckoutList()
  } catch (error) {
    if (error !== false) {
      console.error('确认退单失败:', error)
      ElMessage.error('确认退单失败')
    }
  } finally {
    confirmSubmitting.value = false
  }
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

// 页面加载时获取数据
onMounted(() => {
  fetchCheckoutList()
})
</script>

<style scoped lang="scss">
.table-card {
  border-radius: 12px;
  background-color: white;
  padding: 12px 10px;

  .header-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      font-size: 18px;
      color: #8b5e3c;
      font-weight: normal;
      margin: 0;
    }

    .search-box {
      display: flex;
      gap: 10px;
    }
  }

  .filter-bar {
    margin-left: 10px;
    margin-bottom: 10px;
  }
}

:deep(.el-card__body) {
  padding: 0px;
}

:deep(.el-card__header) {
  border-bottom: 0;
  padding-bottom: 0;
}

.filter-form {
  margin-bottom: 12px;
}


.cancel-table {
  max-height: calc(100vh - 380px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}

/* 隐藏表格的 Webkit 滚动条 */
.cancel-table::-webkit-scrollbar {
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
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
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

.cancel-confirmation {
  padding: 20px;

  .filter-card {
    margin-bottom: 20px;
    border-radius: 12px;
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
      margin-top: 5px;
      padding-top: 5px;

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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
