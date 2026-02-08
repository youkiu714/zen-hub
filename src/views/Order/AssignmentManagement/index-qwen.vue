<!-- src/views/Assignment/AssignmentList.vue -->
<template>
  <div class="assignment-list-container">
    <PageHeader title="挂单分床">
    </PageHeader>

    <ApplicationStatusFilter v-model="activeTab" @update:modelValue="handleTabChange" />

    <!-- 数据表格 -->
    <div class="table-container">
      <!-- 标题区和操作区 -->
      <div class="filter-bar">
        <!-- 搜索框 -->
        <el-input v-model="searchKeyword" placeholder="搜索姓名或房间号..." clearable
          style="width: 200px; margin-right: 16px;" />

        <!-- 性别筛选 - 仅待分配显示 -->
        <el-select v-if="activeTab === 'pending'" v-model="genderFilter" placeholder="全部性别" clearable
          style="width: 120px; margin-right: 16px;">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>

        <!-- 分组筛选 - 仅待分配显示 -->
        <el-select v-if="activeTab === 'pending'" v-model="groupFilter" placeholder="全部分组" clearable
          style="width: 120px; margin-right: 16px;">
          <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
        </el-select>

        <!-- 房间筛选 - 仅已分配显示 -->
        <el-select v-if="activeTab === 'assigned'" v-model="roomFilter" placeholder="全部房间" clearable
          style="width: 120px; margin-right: 16px;">
          <el-option v-for="room in roomOptions" :key="room.value" :label="room.label" :value="room.value" />
        </el-select>

        <!-- 性别筛选 - 仅已入住显示 -->
        <el-select v-if="activeTab === 'checkedIn'" v-model="genderFilter" placeholder="全部性别" clearable
          style="width: 120px; margin-right: 16px;">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>

        <!-- 部门筛选 - 仅已入住显示 -->
        <el-select v-if="activeTab === 'checkedIn'" v-model="departmentFilter" placeholder="全部部门" clearable
          style="width: 120px; margin-right: 16px;">
          <el-option v-for="dept in departmentOptions" :key="dept.value" :label="dept.label" :value="dept.value" />
        </el-select>

        <!-- 姓名筛选 - 仅已退住显示 -->
        <el-input v-if="activeTab === 'checkedOut'" v-model="checkoutNameFilter" placeholder="姓名筛选" clearable
          style="width: 120px; margin-right: 16px;" />

        <!-- 房间号筛选 - 仅已退住显示 -->
        <el-input v-if="activeTab === 'checkedOut'" v-model="checkoutRoomFilter" placeholder="房间号筛选" clearable
          style="width: 120px; margin-right: 16px;" />

        <el-button v-if="activeTab === 'pending'" type="primary"
          :style="{ backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' }" icon="Plus"
          @click="handleBatchAssign">批量分配</el-button>
      </div>

      <!-- 表格区 -->
      <el-table :data="tableData" stripe style="width: 100%" @selection-change="handleSelectionChange"
        class="application-table">
        <!-- 选择列 - 仅待分配表显示 -->
        <el-table-column v-if="activeTab === 'pending'" type="selection" width="55" />

        <!-- 待分配表格列 -->
        <template v-if="activeTab === 'pending'">

          <!-- 人员信息列 -->
          <!-- <el-table-column prop="name" label="人员信息" min-width="100">
            <template #default="{ row }">
              <div class="info-text">
                <div class="name">{{ row.name }}</div>
              </div>
            </template>
          </el-table-column> -->
          <!-- 身份证 -->
          <!-- <el-table-column prop="idCardMasked" label="身份证号" min-width="120">
            <template #default="{ row }">
              <div class="id-card">{{ row.idCardMasked }}</div>
            </template>
          </el-table-column> -->

          <!-- 性别列 -->
          <!-- <el-table-column prop="gender" label="性别" min-width="100">
            <template #default="{ row }">
              {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '-' }}
            </template>
          </el-table-column> -->

          <!-- 年龄列 -->
          <!-- <el-table-column prop="age" label="年龄" min-width="100">
            <template #default="{ row }">
              {{ row.age !== null && row.age !== undefined ? row.age : '-' }}
            </template>
          </el-table-column> -->


          <el-table-column label="挂单人" min-width="150">
            <template #default="{ row }">
              <div class="applicant-info">
                <el-avatar :size="40" class="applicant-avatar">
                  <el-icon>
                    <User />
                  </el-icon>
                </el-avatar>
                <div class="applicant-details">
                  <div class="applicant-name">{{ row.name }}</div>
                  <div class="applicant-id">{{ row.idCardMasked }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="性别/年龄" min-width="100">
            <template #default="{ row }">
              <div>{{ row.gender === 1 ? '男' : '女' }} / {{ row.age }}岁</div>
            </template>
          </el-table-column>

          <!-- 分组列 -->
          <el-table-column prop="groupName" label="分组" min-width="100">
            <template #default="{ row }">
              <el-tag v-if="row.groupName" size="small" type="info">{{ row.groupName }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <!-- 入住时长列 -->
          <el-table-column prop="stayDays" label="入住时长" min-width="100">
            <template #default="{ row }">
              {{ row.stayDays !== null && row.stayDays !== undefined ? `${row.stayDays}天` : '-' }}
            </template>
          </el-table-column>

          <!-- 类型列 -->
          <el-table-column prop="typeName" label="类型" min-width="100">
            <template #default="{ row }">
              <el-tag v-if="row.typeName" size="small" :type="getTypeTagType(row.typeName)" effect="light">
                {{ row.typeName }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <!-- 申请日期列 -->
          <el-table-column prop="applyDate" label="申请日期" min-width="120">
            <template #default="{ row }">
              {{ row.applyDate || '-' }}
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" min-width="180">
            <template #default="{ row }">
              <!-- 分配按钮 -->
              <el-button type="primary" @click="handleAssign(row)" title="分配床位">分配床位
              </el-button>
              <!-- 查看详情 -->
              <el-button type="info" @click="handleViewDetails(row)">查看详情</el-button>
            </template>
          </el-table-column>
        </template>

        <!-- 已分配表格列 -->
        <template v-if="activeTab === 'assigned'">
          <!-- 人员信息列 -->
          <el-table-column prop="name" label="人员信息" min-width="120">
            <template #default="{ row }">
              <div class="info-text">
                <div class="name">{{ row.name }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 房间床位列 -->
          <el-table-column prop="roomAndBed" label="房间/床位" min-width="120">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ row.roomAndBed }}</el-tag>
            </template>
          </el-table-column>

          <!-- 分组列 -->
          <el-table-column prop="group" label="分组" min-width="120">
            <template #default="{ row }">
              <el-tag v-if="row.group && row.group !== '-'" size="small" type="info">{{ row.group }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <!-- 预计入住日期列 -->
          <el-table-column prop="expectedCheckinDate" label="预计入住" min-width="120">
            <template #default="{ row }">
              {{ row.expectedCheckinDate || '-' }}
            </template>
          </el-table-column>

          <!-- 预计离开日期列 -->
          <el-table-column prop="expectedCheckoutDate" label="预计离开" min-width="120">
            <template #default="{ row }">
              {{ row.expectedCheckoutDate || '-' }}
            </template>
          </el-table-column>

          <!-- 分配日期列 -->
          <el-table-column prop="assignedDate" label="分配日期" min-width="120">
            <template #default="{ row }">
              <el-tag size="small" type="warning">{{ row.assignedDate }}</el-tag>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" min-width="120">
            <template #default="{ row }">
              <!-- 查看详情 -->
              <el-button type="info" @click="handleViewDetails(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <span class="pagination-info">显示 {{ pagination.startRow }}-{{ pagination.endRow }} 条, 共 {{ pagination.total }}
          条</span>
        <el-pagination background layout="prev, pager, next, jumper" :total="pagination.total"
          :page-size="pagination.pageSize" :current-page="pagination.currentPage" @current-change="handlePageChange" />
      </div>
    </div>
    <!-- 分配床位弹窗 -->
    <AssignBedModal v-model="showAssignBedModal" :selected-person="selectedPerson" @success="handleAssignSuccess" />
    <!-- 查看详情 -->
    <ApplicationDetailDialog v-model="detailVisible" :application-id="currentAppId" @close="onDetailClosed" />

    <!-- 审核流程 -->
    <ReviewPage v-model="reviewVisible" :application-id="currentReviewId" @close="onReviewClosed" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, InfoFilled, Upload } from '@element-plus/icons-vue'
// import type { AssignmentListItemVO } from '@/api/types'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'

import { getPendingAssignments, getAssignedList, getCheckedInList, getCheckedOutList } from '@/api/assignment'
import type {
  AssignmentListItemVO,
  AssignmentRequest,
  AssignedLodgingVO,
  AssignedRequest,
  CheckedInLodgingVO,
  CheckedInRequest,
  CheckedOutLodgingVO,
  CheckedOutRequest
} from '@/types/assignment'
import { AssignmentBedStatus, CHECKOUT_STATUS_MAP, TYPE_MAP } from '@/types/assignment'
import AssignBedModal from '@/components/AssignBed/AssignBedModal.vue'
import PageHeader from '@/components/PageHeader.vue'
import ApplicationStatusFilter from './components/ApplicationStatusFilter.vue'

// 定义响应式数据
const tableData = ref<AssignmentListItemVO[] | AssignedLodgingVO[] | CheckedInLodgingVO[] | CheckedOutLodgingVO[]>([])
const selectedRows = ref<AssignmentListItemVO[]>([])
const selectedAssignedRows = ref<AssignedLodgingVO[]>([])
const selectedCheckedInRows = ref<CheckedInLodgingVO[]>([])
const selectedCheckedOutRows = ref<CheckedOutLodgingVO[]>([])
const filterStatus = ref(AssignmentBedStatus.WAITING_ASSIGN)

const detailVisible = ref(false);
const currentAppId = ref(0)

const reviewVisible = ref(false);
const currentReviewId = ref(0)

// 分配床位弹窗
const showAssignBedModal = ref(false)
const selectedPerson = ref<AssignmentListItemVO | null>(null)

// 分页相关数据
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  startRow: 0,
  endRow: 0
})

// 筛选条件
const searchKeyword = ref<string>('')
const genderFilter = ref<number | undefined>(undefined)
const groupFilter = ref<string | undefined>(undefined)
const roomFilter = ref<number | undefined>(undefined)
const departmentFilter = ref<string | undefined>(undefined)
const checkoutNameFilter = ref<string>('')
const checkoutRoomFilter = ref<string>('')

// Tab状态
const activeTab = ref(AssignmentBedStatus.PENDING) // 默认激活"待分配"Tab

// 分组选项
const groupOptions = ref(['第一组', '第二组', '第三组'])

// 部门选项（对应 departmentCode）
const departmentOptions = ref([
  { label: '项目部', value: 'PROJECT' },
  { label: '教化部', value: 'READING' },
  { label: '汇编', value: 'COMPILATION' },
  { label: '无部组', value: 'OTHER' }
])

// 房间选项（示例数据，实际应该从API获取）
const roomOptions = ref([
  { label: '104', value: 1 },
  { label: '105', value: 2 },
  { label: '1401', value: 3 },
  { label: '1402', value: 4 }
])

// 计算属性：根据当前页码和页大小计算显示范围
const paginationRange = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize + 1
  const end = Math.min(start + pagination.value.pageSize - 1, pagination.value.total)
  return { start, end }
})

const loadApplications = () => {
  console.log(filterStatus.value);
  if (filterStatus.value == AssignmentBedStatus.WAITING_ASSIGN) {
    fetchData()
  }
  if (filterStatus.value == AssignmentBedStatus.ASSIGNED) {
    fetchData()
  }
}



// 初始化时加载数据
onMounted(() => {
  fetchData()
})

// 监听筛选条件变化，重新加载数据
watch([searchKeyword, genderFilter, groupFilter, roomFilter, departmentFilter, checkoutNameFilter, checkoutRoomFilter], () => {
  pagination.value.currentPage = 1 // 重置到第一页
  fetchData()
}, { deep: true })

// 获取Tab标题
const getTabTitle = () => {
  const titles: Record<string, string> = {
    pending: '待分配人员',
    assigned: '已分配人员',
    checkedIn: '已入住人员',
    checkedOut: '已退住人员'
  }
  return titles[activeTab.value] || '人员列表'
}

// 获取Tab副标题
const getTabSubtitle = () => {
  const subtitles: Record<string, string> = {
    pending: '需要安排床位的挂单人员列表',
    assigned: '已完成床位分配的人员列表',
    checkedIn: '已经入住的人员列表',
    checkedOut: '已经退住的人员列表'
  }
  return subtitles[activeTab.value] || ''
}

const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}

const onReviewClosed = () => {
  console.log('审核流程窗口已关闭')
}


// 监听Tab切换
const handleTabChange = (tabName: string | number) => {

  console.log(tabName);

  const tabNameStr = String(tabName)
  console.log(`切换到Tab: ${tabNameStr}`)

  selectedRows.value = [] // 清空选择
  selectedAssignedRows.value = [] // 清空已分配选择
  selectedCheckedInRows.value = [] // 清空已入住选择
  selectedCheckedOutRows.value = [] // 清空已退住选择
  pagination.value.currentPage = 1 // 重置到第一页

  // 清空筛选条件
  searchKeyword.value = ''
  genderFilter.value = undefined
  groupFilter.value = undefined
  roomFilter.value = undefined
  departmentFilter.value = undefined
  checkoutNameFilter.value = ''
  checkoutRoomFilter.value = ''
  tableData.value = []
  activeTab.value = tabNameStr as 'pending' | 'assigned' | 'checked_in' | 'checked_out'
  fetchData() // 重新加载数据

}

// 获取数据的方法
const fetchData = async () => {
  try {
    let response
    console.log(activeTab.value);
    
    // 根据当前tab调用不同的API
    switch (activeTab.value) {
      case 'pending':
        const pendingParams: AssignmentRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          gender: genderFilter.value,
          groupName: groupFilter.value,
          keyword: searchKeyword.value || undefined
        }
        response = await getPendingAssignments(pendingParams)
        break

      case 'assigned':
        const assignedParams: AssignedRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          keyword: searchKeyword.value || undefined,
          roomId: roomFilter.value || undefined
        }
        response = await getAssignedList(assignedParams)
        break

      case 'checked_in':
        const checkedInParams: CheckedInRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          keyword: searchKeyword.value || undefined,
          gender: genderFilter.value,
          departmentCode: departmentFilter.value || undefined
        }
        response = await getCheckedInList(checkedInParams)
        break

      case 'checked_out':
        const checkedOutParams: CheckedOutRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          name: checkoutNameFilter.value || undefined,
          roomNo: checkoutRoomFilter.value || undefined
        }
        response = await getCheckedOutList(checkedOutParams)
        break

      default:
        const defaultParams: AssignmentRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          keyword: searchKeyword.value || undefined
        }
        response = await getPendingAssignments(defaultParams)
    }

    // 更新表格数据和分页信息
    tableData.value = response.records || []
    pagination.value.total = response.total || 0
    pagination.value.currentPage = response.current || 1
    pagination.value.pageSize = response.size || 10

    // 更新显示范围
    pagination.value.startRow = paginationRange.value.start
    pagination.value.endRow = paginationRange.value.end

  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  }
}

// 处理分页变化
const handlePageChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  fetchData()
}

// 处理选择行变化
const handleSelectionChange = (selection: AssignmentListItemVO[] | AssignedLodgingVO[] | CheckedInLodgingVO[] | CheckedOutLodgingVO[]) => {
  if (activeTab.value === 'pending') {
    selectedRows.value = selection as AssignmentListItemVO[]
  } else if (activeTab.value === 'assigned') {
    selectedAssignedRows.value = selection as AssignedLodgingVO[]
  } else if (activeTab.value === 'checkedIn') {
    selectedCheckedInRows.value = selection as CheckedInLodgingVO[]
  } else if (activeTab.value === 'checkedOut') {
    selectedCheckedOutRows.value = selection as CheckedOutLodgingVO[]
  }
}

// 批量分配按钮点击事件
const handleBatchAssign = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要分配的人员')
    return
  }
  ElMessageBox.confirm(
    `确定要为选中的 ${selectedRows.value.length} 位人员进行批量分配吗？`,
    '批量分配',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行批量分配逻辑
    ElMessage.success(`已成功为 ${selectedRows.value.length} 位人员分配床位`)
    // 可选：刷新数据
    fetchData()
  }).catch(() => {
    // 取消操作
  })
}

// 单个分配按钮点击事件
const handleAssign = (row: AssignmentListItemVO | AssignedLodgingVO) => {

  console.log(row)
  console.log(activeTab.value)
  // 只有待分配的可以分配床位
  if (activeTab.value === 'pending') {
    selectedPerson.value = row as AssignmentListItemVO
    showAssignBedModal.value = true
    console.log(showAssignBedModal.value);
    
  } else {
    ElMessage.info('已分配人员无法重新分配床位')
  }
}

// 查看详情按钮点击事件
const handleViewDetails = (row: AssignmentListItemVO | AssignedLodgingVO | CheckedInLodgingVO | CheckedOutLodgingVO) => {
  // ElMessage.info(`查看 ${row.name} 的详细信息`)
  currentAppId.value = row.id;
  detailVisible.value = true;
  // 实际项目中，这里会打开一个详情弹窗或跳转到详情页
}

// 上传物品按钮点击事件
const handleUploadItems = (row: CheckedOutLodgingVO) => {
  ElMessage.info(`上传 ${row.name} 的遗漏物品`)
  // 实际项目中，这里会打开一个上传物品的弹窗
  // 可以包含物品照片上传、物品描述、联系方式等功能
}

// 获取类型标签的Element-Plus tag type
const getTypeTagType = (typeName?: string) => {
  if (!typeName) return 'info'

  // Map type names to appropriate Element-Plus tag types based on their colors
  switch (typeName) {
    case '新住': // #67C23A (green)
      return 'success'
    case '换床': // #E6A23C (orange)
      return 'warning'
    default:
      return 'info'
  }
}

// 分配成功回调
const handleAssignSuccess = () => {
  ElMessage.success('床位分配成功')
  fetchData() // 刷新列表
}
</script>

<style scoped lang="scss">
.table-container {
  background-color: white;
  padding: 12px 10px;
  border-radius: 12px;

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    :deep(.el-select) {
      .el-input__inner {
        border-radius: 6px;
        border-color: #ddd;
      }
    }

    :deep(.el-button) {
      border-radius: 6px;
      font-weight: 500;
      padding: 10px 20px;
    }
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

.assignment-list-container {
  padding: 20px;
  background-color: #fdf6e3;


  // :deep(.el-table) {
  //   background-color: #fff;
  //   border-radius: 8px;
  //   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  //   overflow: hidden;

  //   .el-table__header-wrapper {
  //     th {
  //       background-color: #f8f9fa;
  //       color: #333;
  //       font-weight: 600;
  //       font-size: 14px;
  //       border-bottom: 1px solid #e9ecef;
  //     }
  //   }

  //   .el-table__body-wrapper {
  //     tr {
  //       transition: background-color 0.2s;

  //       &:hover {
  //         background-color: #f8f9fa;
  //       }
  //     }

  //     td {
  //       padding: 16px 0;
  //       border-bottom: 1px solid #f1f3f4;
  //     }
  //   }

  //   .el-table__selection-cell {
  //     .el-checkbox {
  //       margin-left: 8px;
  //     }
  //   }
  // }

  .person-info {
    display: flex;
    align-items: center;

    .el-avatar {
      background-color: #8B5E3C;
      color: #fff;
    }

    .info-text {
      margin-left: 12px;

      .name {
        font-weight: 600;
        color: #333;
        font-size: 15px;
        margin-bottom: 4px;
      }

      .id-card {
        font-size: 13px;
        color: #666;
        font-family: 'Courier New', monospace;
      }
    }
  }

  .el-tag {
    border-radius: 4px;
    font-weight: 500;
    font-size: 13px;
    padding: 4px 8px;
    border: none;
  }

  .lost-items {
    .el-tag {
      max-width: 160px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .no-items {
    color: #909399;
    font-style: italic;
  }

  :deep(.el-table .cell) {
    .el-button+.el-button {
      margin-left: 8px;
    }
  }

  :deep(.el-button.is-circle) {
    width: 36px;
    height: 36px;
    border-radius: 50%;

    .el-icon {
      font-size: 16px;
    }

    &.is-primary {
      background-color: #8B5E3C;
      border-color: #8B5E3C;

      &:hover {
        background-color: #7d5434;
        border-color: #7d5434;
      }
    }

    &.is-info {
      background-color: #909399;
      border-color: #909399;

      &:hover {
        background-color: #82848a;
        border-color: #82848a;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;


    .pagination-info {
      font-size: 14px;
      color: #666;
      font-weight: 400;
    }

    :deep(.el-pagination) {
      .el-pager li {
        &.is-active {
          background-color: #8B5E3C;
          color: #fff;
        }

        &:hover {
          color: #8B5E3C;
        }
      }

      .btn-prev,
      .btn-next {
        &:hover {
          color: #8B5E3C;
        }
      }
    }
  }
}

/* 隐藏 Webkit 浏览器的滚动条 */
.table-container::-webkit-scrollbar {
  display: none;
}

.application-table {
  max-height: calc(100vh - 360px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
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


/* 响应式设计 */
@media (max-width: 768px) {
  .assignment-list-container {
    padding: 16px;

    .pagination-container {
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }
  }
}



</style>