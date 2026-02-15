<template>
  <div class="assignment-list-container">
    <PageHeader title="挂单分床" />

    <ApplicationStatusFilter v-model="activeTab" @update:modelValue="handleTabChange" />

    <div class="table-container">

      <div class="filter-bar">
        <el-input v-if="activeTab !== 'checked_out'" v-model="searchKeyword" placeholder="搜索姓名或信息..." clearable
          style="width: 200px; margin-right: 16px;">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <template v-if="activeTab === 'pending'">
          <el-select v-model="genderFilter" placeholder="全部性别" clearable style="width: 120px; margin-right: 16px;">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>

          <el-select v-model="recordTypeFilter" placeholder="类型" clearable style="width: 120px; margin-right: 16px;">
            <el-option v-for="type in recordTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>

          <el-select v-model="groupFilter" placeholder="全部分组" clearable style="width: 120px; margin-right: 16px;">
            <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
          </el-select>

          <!-- <el-button type="primary" :style="{ backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' }" icon="Plus"
            @click="handleBatchAssign">批量分配</el-button> -->
        </template>

        <template v-if="activeTab === 'assigned'">
          <el-select v-model="roomFilter" placeholder="全部房间" clearable style="width: 120px; margin-right: 16px;">
            <el-option v-for="room in roomOptions" :key="room.value" :label="room.label" :value="room.value" />
          </el-select>
        </template>

        <template v-if="activeTab === 'checked_in'">
          <el-select v-model="genderFilter" placeholder="全部性别" clearable style="width: 120px; margin-right: 16px;">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>

          <el-select v-model="departmentFilter" placeholder="全部部门" clearable style="width: 120px; margin-right: 16px;">
            <el-option v-for="dept in departmentOptions" :key="dept.value" :label="dept.label" :value="dept.value" />
          </el-select>
        </template>

        <template v-if="activeTab === 'checked_out'">
          <el-input v-model="checkoutNameFilter" placeholder="姓名筛选" clearable style="width: 140px; margin-right: 16px;">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>

          <el-input v-model="checkoutRoomFilter" placeholder="房间号筛选" clearable
            style="width: 140px; margin-right: 16px;">
            <template #prefix>
              <el-icon>
                <House />
              </el-icon>
            </template>
          </el-input>
        </template>
      </div>
      <div class="table-wrapper" v-loading="loading">
        <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange"
          class="assignment-table">
          <el-table-column v-if="activeTab === 'pending'" type="selection" width="55" />
          <!-- 待分配 -->
          <template v-if="activeTab === 'pending'">
            <el-table-column label="挂单人" min-width="150">
              <template #default="{ row }">
                <div class="applicant-info">
                  <el-avatar :size="36" class="applicant-avatar" icon="UserFilled" />
                  <div class="applicant-details">
                    <div class="applicant-name">{{ row.name }}</div>
                    <div class="applicant-id">{{ row.idCardMasked }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="性别/年龄" min-width="100">
              <template #default="{ row }">
                {{ row.gender === 1 ? '男' : '女' }} / {{ row.age }}岁
              </template>
            </el-table-column>

            <el-table-column prop="groupName" label="分组" min-width="100">
              <template #default="{ row }">
                <el-tag v-if="row.groupName" size="small" type="info">{{ row.groupName }}</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column prop="recordTypeName" label="类型" min-width="100">
              <template #default="{ row }">
                <el-tag v-if="row.recordTypeName" size="small" :type="getTypeTagType(row.recordTypeName)"
                  effect="light">
                  {{ row.recordTypeName }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="applyDate" label="申请日期" min-width="120" />

            <el-table-column label="操作" min-width="180">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleAssign(row)">分配床位</el-button>
                <el-button type="info" link @click="handleViewDetails(row)">详情</el-button>
                <!-- <el-button type="info" link @click="handleReview(row)">流程</el-button> -->
              </template>
            </el-table-column>
          </template>
          <!-- 已分配 -->
          <template v-if="activeTab === 'assigned'">
            <el-table-column prop="name" label="姓名" min-width="120">
              <template #default="{ row }">
                <span style="font-weight: 500">{{ row.name }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="roomAndBed" label="房间/床位" min-width="140">
              <template #default="{ row }">
                <el-tag size="small" type="success" effect="dark">{{ row.roomAndBed }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="group" label="分组" min-width="120">
              <template #default="{ row }">
                {{ row.group || '-' }}
              </template>
            </el-table-column>

            <el-table-column prop="recordTypeName" label="类型" min-width="100">
              <template #default="{ row }">
                <el-tag v-if="row.recordTypeName" size="small" :type="getTypeTagType(row.recordTypeName)"
                  effect="light">
                  {{ row.recordTypeName }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="expectedCheckinDate" label="预计入住" min-width="120" />
            <el-table-column prop="expectedCheckoutDate" label="预计离开" min-width="120" />

            <el-table-column label="操作" min-width="100">
              <template #default="{ row }">
                <el-button type="info" link @click="handleViewDetails(row)">详情</el-button>
                <el-button type="danger" link @click="handleCancelAssign(row)">取消分配</el-button>
              </template>
            </el-table-column>
          </template>
          <!-- 已入住 -->
          <template v-if="activeTab === 'checked_in'">
            <el-table-column label="入住人" min-width="140">
              <template #default="{ row }">
                <div class="applicant-info">
                  <el-avatar :size="32" style="background-color: #67C23A">
                    <el-icon>
                      <User />
                    </el-icon>
                  </el-avatar>
                  <div class="applicant-details">
                    <div class="applicant-name">{{ row.name }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="性别/年龄" min-width="100">
              <template #default="{ row }">
                {{ row.gender === 1 ? '男' : '女' }} <span v-if="row.age">/ {{ row.age }}岁</span>
              </template>
            </el-table-column>

            <el-table-column prop="roomAndBed" label="房间/床位" min-width="140">
              <template #default="{ row }">
                <el-tag size="small" type="success" effect="plain">{{ row.roomAndBed }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="group" label="分组" min-width="120">
              <template #default="{ row }">
                <el-tag v-if="row.group" size="small" type="info">{{ row.group }}</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column prop="checkinDate" label="入住时间" min-width="120" sortable>
              <template #default="{ row }">
                <span style="color: #666">{{ row.checkinDate }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="expectedCheckoutDate" label="预计离开" min-width="120" />

            <el-table-column label="操作" min-width="120">
              <template #default="{ row }">
                <el-button type="info" link @click="handleViewDetails(row)">详情</el-button>
                <el-button type="info" link @click="handleCheckoutApplication(row)">退单办理</el-button>
              </template>
            </el-table-column>
          </template>
          <!-- 已退住 -->
          <template v-if="activeTab === 'checked_out'">
            <el-table-column prop="name" label="姓名" min-width="100">
              <template #default="{ row }">
                <span class="name-text">{{ row.name }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="roomNo" label="房间号" min-width="100">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.roomNo || '-' }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="checkoutDate" label="退住日期" min-width="140" sortable>
              <template #default="{ row }">
                <div class="date-text">
                  <el-icon style="margin-right: 4px;">
                    <Calendar />
                  </el-icon>
                  <span>{{ row.checkoutDate || '-' }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="退住状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'" effect="light" size="small">
                  {{ row.status === 0 ? '正常' : '异常' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="lostItemsRemark" label="遗留物品" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <div v-if="row.lostItemsRemark" class="lost-items">
                  <el-tag type="warning" size="small" effect="plain">
                    <el-icon style="margin-right: 2px">
                      <Suitcase />
                    </el-icon>
                    {{ row.lostItemsRemark }}
                  </el-tag>
                </div>
                <span v-else class="no-items">-</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" min-width="160" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewDetails(row)">详情</el-button>
                <el-button link type="warning" size="small" @click="handleUploadItems(row)">
                  <el-icon style="margin-right: 4px">
                    <Edit />
                  </el-icon>登记物品
                </el-button>
              </template>
            </el-table-column>
          </template>

        </el-table>
      </div>
      <div class="pagination-container">
        <span class="pagination-info">显示 {{ pagination.startRow }}-{{ pagination.endRow }} 条, 共 {{ pagination.total }}
          条</span>
        <el-pagination background layout="prev, pager, next, jumper" :total="pagination.total"
          :page-size="pagination.pageSize" :current-page="pagination.currentPage" @current-change="handlePageChange" />
      </div>
    </div>

    <AssignBedModal v-model="showAssignBedModal" :selected-person="selectedPerson" @success="handleAssignSuccess" />
    <ApplicationDetailDialog v-model="detailVisible" :application-id="currentAppId" @close="onDetailClosed" />
    <ReviewPage v-model="reviewVisible" :application-id="currentReviewId" @close="onReviewClosed" />
    <!-- 退单申请弹窗 -->
    <CheckoutApplicationDialog v-model="checkoutVisible" :order-data="currentCheckoutData"
      @submit="handleCheckoutSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, User, UserFilled, Calendar, Suitcase, House, Edit
} from '@element-plus/icons-vue'

import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'
import AssignBedModal from '@/components/AssignBed/AssignBedModal.vue'
import PageHeader from '@/components/PageHeader.vue'
import ApplicationStatusFilter from './components/ApplicationStatusFilter.vue'
import CheckoutApplicationDialog from '@/views/Order/PendingOrderManagement/components/CheckoutApplicationDialog.vue'

import {
  getPendingAssignments,
  getAssignedList,
  getCheckedInList,
  getCheckedOutList,
  cancelAssigned
} from '@/api/assignment'

import {
  AssignmentBedStatus,
  type AssignmentListItemVO,
  type AssignmentRequest,
  type AssignedLodgingVO,
  type AssignedRequest,
  type CheckedInLodgingVO,
  type CheckedInRequest,
  type CheckedOutLodgingVO,
  type CheckedOutRequest
} from '@/types/assignment'

// 响应式数据
const tableData = ref<any[]>([])
const filterStatus = ref(AssignmentBedStatus.PENDING)
const activeTab = ref(AssignmentBedStatus.PENDING) // 确保这里使用的是 Enum 值 (如 'pending', 'checked_in')

// 选中行数据 (按类型区分)
const selectedRows = ref<AssignmentListItemVO[]>([])
const selectedAssignedRows = ref<AssignedLodgingVO[]>([])
const selectedCheckedInRows = ref<CheckedInLodgingVO[]>([])
const selectedCheckedOutRows = ref<CheckedOutLodgingVO[]>([])

// 弹窗控制
const detailVisible = ref(false)
const currentAppId = ref(0)
const reviewVisible = ref(false)
const currentReviewId = ref(0)
const showAssignBedModal = ref(false)
const selectedPerson = ref<AssignmentListItemVO | null>(null)

  // 退单申请相关状态
const checkoutVisible = ref(false)
const currentCheckoutData = ref({
  applicationId: 0,
  checkoutDate: '',
  applicantName: ''
})

// 分页数据
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  startRow: 0,
  endRow: 0
})

// 筛选条件模型
const searchKeyword = ref('')
const genderFilter = ref<number | undefined>(undefined)
const recordTypeFilter = ref<number | undefined>(undefined)
const groupFilter = ref<string | undefined>(undefined)
const roomFilter = ref<number | undefined>(undefined)
const departmentFilter = ref<string | undefined>(undefined)
const checkoutNameFilter = ref('')
const checkoutRoomFilter = ref('')

// 静态选项数据 (实际项目中建议从 API 获取)
const groupOptions = ref(['第一组', '第二组', '第三组'])
const departmentOptions = ref([
  { label: '项目部', value: 'PROJECT' },
  { label: '教化部', value: 'READING' },
  { label: '汇编', value: 'COMPILATION' },
  { label: '无部组', value: 'OTHER' }
])
const roomOptions = ref([
  { label: '104', value: 1 },
  { label: '105', value: 2 },
  { label: '1401', value: 3 },
  { label: '1402', value: 4 }
])
const recordTypeOptions = ref([
  { label: '新住', value: 'NEW' },
  { label: '续单', value: 'EXTENSION' },
  { label: '换床', value: 'CHANGE' }
])
// 计算属性
const paginationRange = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize + 1
  const end = Math.min(start + pagination.value.pageSize - 1, pagination.value.total)
  return { start, end }
})

// 生命周期
onMounted(() => {
  fetchData()
})

// 监听所有筛选条件变化，自动刷新
watch(
  [searchKeyword, genderFilter, groupFilter, recordTypeFilter, roomFilter, departmentFilter, checkoutNameFilter, checkoutRoomFilter],
  () => {
    pagination.value.currentPage = 1
    fetchData()
  },
  { deep: true }
)

// 事件处理
const onDetailClosed = () => console.log('详情关闭')
const onReviewClosed = () => console.log('审核关闭')

const handleTabChange = (tabName: string | number) => {
  console.log(`切换Tab: ${tabName}`)

  // 清空所有状态
  selectedRows.value = []
  selectedAssignedRows.value = []
  selectedCheckedInRows.value = []
  selectedCheckedOutRows.value = []
  pagination.value.currentPage = 1

  // 重置筛选器
  searchKeyword.value = ''
  genderFilter.value = undefined
  groupFilter.value = undefined
  roomFilter.value = undefined
  departmentFilter.value = undefined
  checkoutNameFilter.value = ''
  checkoutRoomFilter.value = ''

  tableData.value = []

  // 强制断言为 Enum 类型
  activeTab.value = tabName as AssignmentBedStatus
  fetchData()
}

// 核心数据获取逻辑
const fetchData = async () => {
  try {
    let response: any
    console.log('Fetching for:', activeTab.value)

    switch (activeTab.value) {
      case AssignmentBedStatus.PENDING:
        const pendingParams: AssignmentRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          gender: genderFilter.value,
          groupName: groupFilter.value,
          keyword: searchKeyword.value || undefined,
          recordType: recordTypeFilter.value
        }
        response = await getPendingAssignments(pendingParams)
        break

      case AssignmentBedStatus.ASSIGNED:
        const assignedParams: AssignedRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          keyword: searchKeyword.value || undefined,
          roomId: roomFilter.value || undefined,
          recordType: recordTypeFilter.value
        }
        response = await getAssignedList(assignedParams)
        break

      case AssignmentBedStatus.CHECKED_IN: // 'checked_in'
        const checkedInParams: CheckedInRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          keyword: searchKeyword.value || undefined,
          gender: genderFilter.value,
          departmentCode: departmentFilter.value || undefined,
          recordType: recordTypeFilter.value
        }
        response = await getCheckedInList(checkedInParams)
        break

      case AssignmentBedStatus.CHECKED_OUT: // 'checked_out'
        const checkedOutParams: CheckedOutRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          // 注意：已退住接口不使用 keyword，而是具体的 name 和 roomNo
          name: checkoutNameFilter.value || undefined,
          roomNo: checkoutRoomFilter.value || undefined,
          recordType: recordTypeFilter.value
        }
        response = await getCheckedOutList(checkedOutParams)
        break

      default:
        return
    }

    if (response) {
      tableData.value = response.records || []
      pagination.value.total = response.total || 0
      pagination.value.currentPage = response.current || 1
      pagination.value.pageSize = response.size || 10
      pagination.value.startRow = paginationRange.value.start
      pagination.value.endRow = paginationRange.value.end
    }

  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('数据加载失败')
  }
}

const handlePageChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  fetchData()
}

const handleSelectionChange = (selection: any[]) => {
  // 根据当前 tab 将 selection 赋值给对应的 ref
  if (activeTab.value === AssignmentBedStatus.PENDING) selectedRows.value = selection
  else if (activeTab.value === AssignmentBedStatus.ASSIGNED) selectedAssignedRows.value = selection
  // 其他 Tab 暂不需要批量操作
}

// 业务操作
const handleBatchAssign = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要分配的人员')
    return
  }
  ElMessageBox.confirm(`确定为 ${selectedRows.value.length} 人批量分配?`, '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('分配成功 (模拟)')
      fetchData()
    })
    .catch(() => { })
}

const handleAssign = (row: AssignmentListItemVO) => {
  console.log(row)
  selectedPerson.value = row
  showAssignBedModal.value = true
}

const handleViewDetails = (row: any) => {
  // 兼容处理：CheckedOut VO 使用 applicationId，其他可能使用 id
  const id = row.applicationId || row.id
  if (id) {
    currentAppId.value = id
    detailVisible.value = true
  } else {
    ElMessage.error('数据异常：无法获取ID')
  }
}

// 处理退单申请
const handleCheckoutApplication = (row: any) => {
  // 保存当前退单申请的数据
  console.log(row)
  currentCheckoutData.value = {
    applicationId: row.applicationId,
    checkoutDate: row.expectedCheckoutDate || '',
    applicantName: row.name
  }
  checkoutVisible.value = true
}

// 处理退单申请提交
const handleCheckoutSubmit = async () => {
  try {
    checkoutVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('退单申请失败，请稍后重试')
  }
}

const handleReview = (row: any) => {
  console.log('审核流程:', row)
  console.log('审核流程:', row.id)
  currentReviewId.value = row.id
  reviewVisible.value = true
}

const handleCancelAssign = (row: AssignedLodgingVO) => {
  const bedStayId = row.bedStayId
  if (!bedStayId) {
    ElMessage.error('数据异常：缺少床位居住ID')
    return
  }
  ElMessageBox.confirm('确定取消当前分配吗？', '取消分配', { type: 'warning' })
    .then(async () => {
      await cancelAssigned(bedStayId)
      ElMessage.success('已取消分配')
      fetchData()
    })
    .catch(() => { })
}


const handleUploadItems = (row: CheckedOutLodgingVO) => {
  ElMessageBox.prompt('请输入遗留物品描述', '登记物品', {
    inputValue: row.lostItemsRemark,
    inputPlaceholder: '例如：充电器一个'
  }).then(({ value }) => {
    ElMessage.success(`已记录: ${value}`)
    // TODO: 调用API更新
    fetchData()
  }).catch(() => { })
}

const handleAssignSuccess = () => {
  ElMessage.success('分配成功')
  fetchData()
}

// 工具函数
const getTypeTagType = (recordTypeName?: string) => {
  switch (recordTypeName) {
    case '新住': return 'success'
    case '换床': return 'warning'
    default: return 'info'
  }
}
</script>

<style scoped lang="scss">
.table-container {
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

.applicant-info {
  display: flex;
  align-items: center;
  gap: 10px;

  .applicant-avatar {
    flex-shrink: 0;
    background-color: #8B5E3C;
    color: #fff;
  }

  .applicant-details {
    line-height: 1.2;

    .applicant-name {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .applicant-id {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }
  }
}


.assignment-table {
  max-height: calc(100vh - 370px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}

/* 隐藏表格的 Webkit 滚动条 */
.assignment-table::-webkit-scrollbar {
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

.assignment-list-container {
  padding: 20px;
  background-color: #fdf6e3;
  // min-height: 100vh;
}

.date-text {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 13px;
}

.lost-items {
  .el-tag {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.no-items {
  color: #ccc;
  font-size: 12px;
  font-style: italic;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eee;

  .pagination-info {
    font-size: 13px;
    color: #666;
  }
}
</style>
