<!-- src/views/Assignment/AssignmentList.vue -->
<template>
  <div class="assignment-list-container">
    <!-- Tabs区 -->
    <el-tabs v-model="activeTab" class="tabs-area" @tab-change="handleTabChange">
      <el-tab-pane label="待分配" name="pending"></el-tab-pane>
      <el-tab-pane label="已分配" name="assigned"></el-tab-pane>
      <el-tab-pane label="已入住" name="checkedIn"></el-tab-pane>
      <el-tab-pane label="已退住" name="checkedOut"></el-tab-pane>
    </el-tabs>

    <!-- 标题区和操作区 -->
    <div class="header-actions">
      <div class="title-section">
        <h2>{{ getTabTitle() }}</h2>
        <p class="subtitle">{{ getTabSubtitle() }}</p>
      </div>

      <div class="filter-actions">
        <!-- 搜索框 -->
        <el-input v-model="searchKeyword" placeholder="搜索姓名或房间号..." clearable style="width: 200px; margin-right: 16px;" />

        <!-- 性别筛选 - 仅待分配显示 -->
        <el-select v-if="activeTab === 'pending'" v-model="genderFilter" placeholder="全部性别" clearable style="width: 120px; margin-right: 16px;">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>

        <!-- 分组筛选 - 仅待分配显示 -->
        <el-select v-if="activeTab === 'pending'" v-model="groupFilter" placeholder="全部分组" clearable style="width: 120px; margin-right: 16px;">
          <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
        </el-select>

        <!-- 房间筛选 - 仅已分配显示 -->
        <el-select v-if="activeTab === 'assigned'" v-model="roomFilter" placeholder="全部房间" clearable style="width: 120px; margin-right: 16px;">
          <el-option v-for="room in roomOptions" :key="room.value" :label="room.label" :value="room.value" />
        </el-select>

        <!-- 性别筛选 - 仅已入住显示 -->
        <el-select v-if="activeTab === 'checkedIn'" v-model="genderFilter" placeholder="全部性别" clearable style="width: 120px; margin-right: 16px;">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>

        <!-- 部门筛选 - 仅已入住显示 -->
        <el-select v-if="activeTab === 'checkedIn'" v-model="departmentFilter" placeholder="全部部门" clearable style="width: 120px; margin-right: 16px;">
          <el-option v-for="dept in departmentOptions" :key="dept.value" :label="dept.label" :value="dept.value" />
        </el-select>

        <!-- 姓名筛选 - 仅已退住显示 -->
        <el-input v-if="activeTab === 'checkedOut'" v-model="checkoutNameFilter" placeholder="姓名筛选" clearable style="width: 120px; margin-right: 16px;" />

        <!-- 房间号筛选 - 仅已退住显示 -->
        <el-input v-if="activeTab === 'checkedOut'" v-model="checkoutRoomFilter" placeholder="房间号筛选" clearable style="width: 120px; margin-right: 16px;" />

        <el-button v-if="activeTab === 'pending'" type="primary" :style="{ backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' }" icon="Plus"
          @click="handleBatchAssign">批量分配</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" stripe border style="width: 100%" @selection-change="handleSelectionChange">
      <!-- 选择列 - 仅待分配表显示 -->
      <el-table-column v-if="activeTab === 'pending'" type="selection" width="55" />

      <!-- 待分配表格列 -->
      <template v-if="activeTab === 'pending'">
        <!-- 人员信息列 -->
        <el-table-column prop="name" label="人员信息" min-width="200">
          <template #default="{ row }">
            <div class="person-info">
              <el-avatar :size="40" icon="User" />
              <div class="info-text">
                <div class="name">{{ row.name }}</div>
                <div class="id-card">身份证号: {{ row.idCardMasked }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 性别列 -->
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '-' }}
          </template>
        </el-table-column>

        <!-- 年龄列 -->
        <el-table-column prop="age" label="年龄" width="80">
          <template #default="{ row }">
            {{ row.age !== null && row.age !== undefined ? row.age : '-' }}
          </template>
        </el-table-column>

        <!-- 分组列 -->
        <el-table-column prop="groupName" label="分组" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.groupName" size="small" type="info">{{ row.groupName }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 入住时长列 -->
        <el-table-column prop="stayDays" label="入住时长" width="100">
          <template #default="{ row }">
            {{ row.stayDays !== null && row.stayDays !== undefined ? `${row.stayDays}天` : '-' }}
          </template>
        </el-table-column>

        <!-- 类型列 -->
        <el-table-column prop="typeName" label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.typeName" size="small" :type="getTypeTagType(row.typeName)" effect="light">
              {{ row.typeName }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 申请日期列 -->
        <el-table-column prop="applyDate" label="申请日期" width="120">
          <template #default="{ row }">
            {{ row.applyDate || '-' }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <!-- 分配按钮 -->
            <el-button type="primary" circle @click="handleAssign(row)" title="分配床位">
              <el-icon>
                <CirclePlus />
              </el-icon>
            </el-button>
            <!-- 查看详情 -->
            <el-button type="info" circle @click="handleViewDetails(row)">
              <el-icon>
                <InfoFilled />
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </template>

      <!-- 已分配表格列 -->
      <template v-if="activeTab === 'assigned'">
        <!-- 人员信息列 -->
        <el-table-column prop="name" label="人员信息" min-width="150">
          <template #default="{ row }">
            <div class="person-info">
              <el-avatar :size="40" icon="User" />
              <div class="info-text">
                <div class="name">{{ row.name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 房间床位列 -->
        <el-table-column prop="roomAndBed" label="房间/床位" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.roomAndBed }}</el-tag>
          </template>
        </el-table-column>

        <!-- 分组列 -->
        <el-table-column prop="group" label="分组" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.group && row.group !== '-'" size="small" type="info">{{ row.group }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 预计入住日期列 -->
        <el-table-column prop="expectedCheckinDate" label="预计入住" width="120">
          <template #default="{ row }">
            {{ row.expectedCheckinDate || '-' }}
          </template>
        </el-table-column>

        <!-- 预计离开日期列 -->
        <el-table-column prop="expectedCheckoutDate" label="预计离开" width="120">
          <template #default="{ row }">
            {{ row.expectedCheckoutDate || '-' }}
          </template>
        </el-table-column>

        <!-- 分配日期列 -->
        <el-table-column prop="assignedDate" label="分配日期" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="warning">{{ row.assignedDate }}</el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <!-- 查看详情 -->
            <el-button type="info" circle @click="handleViewDetails(row)">
              <el-icon>
                <InfoFilled />
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </template>

      <!-- 已入住表格列 -->
      <template v-if="activeTab === 'checkedIn'">
        <!-- 人员信息列 -->
        <el-table-column prop="name" label="人员信息" min-width="200">
          <template #default="{ row }">
            <div class="person-info">
              <el-avatar :size="40" icon="User" />
              <div class="info-text">
                <div class="name">{{ row.name }}</div>
                <div class="id-card">申请ID: {{ row.applicationId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 性别列 -->
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.gender === 1" size="small" type="primary">男</el-tag>
            <el-tag v-else-if="row.gender === 2" size="small" type="danger">女</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 年龄列 -->
        <el-table-column prop="age" label="年龄" width="80">
          <template #default="{ row }">
            {{ row.age || '-' }}
          </template>
        </el-table-column>

        <!-- 分组列 -->
        <el-table-column prop="group" label="分组" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.group && row.group !== '-'" size="small" type="info">{{ row.group }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 房间床位列 -->
        <el-table-column prop="roomAndBed" label="房间/床位" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.roomAndBed }}</el-tag>
          </template>
        </el-table-column>

        <!-- 实际入住日期列 -->
        <el-table-column prop="checkinDate" label="实际入住" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="warning">{{ row.checkinDate }}</el-tag>
          </template>
        </el-table-column>

        <!-- 预计离开日期列 -->
        <el-table-column prop="expectedCheckoutDate" label="预计离开" width="120">
          <template #default="{ row }">
            {{ row.expectedCheckoutDate || '-' }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <!-- 查看详情 -->
            <el-button type="info" circle @click="handleViewDetails(row)">
              <el-icon>
                <InfoFilled />
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </template>

      <!-- 已退住表格列 -->
      <template v-if="activeTab === 'checkedOut'">
        <!-- 姓名列 -->
        <el-table-column prop="name" label="姓名" min-width="150">
          <template #default="{ row }">
            <div class="person-info">
              <el-avatar :size="40" icon="User" />
              <div class="info-text">
                <div class="name">{{ row.name }}</div>
                <div class="id-card">ID: {{ row.applicationId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 房间号列 -->
        <el-table-column prop="roomNo" label="房间号" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.roomNo }}</el-tag>
          </template>
        </el-table-column>

        <!-- 退住日期列 -->
        <el-table-column prop="checkoutDate" label="退住日期" width="140">
          <template #default="{ row }">
            <el-tag size="small" type="warning">{{ row.checkoutDate }}</el-tag>
          </template>
        </el-table-column>

        <!-- 遗漏物品列 -->
        <el-table-column prop="lostItemsRemark" label="遗漏物品" min-width="180">
          <template #default="{ row }">
            <div v-if="row.lostItemsRemark && row.lostItemsRemark.trim() && row.lostItemsRemark !== '无'"
                 class="lost-items">
              <el-tag size="small" type="danger">{{ row.lostItemsRemark }}</el-tag>
            </div>
            <span v-else class="no-items">无</span>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" size="small" type="success">正常</el-tag>
            <el-tag v-else-if="row.status === 1" size="small" type="danger">异常</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <!-- 查看详情 -->
            <el-button type="info" circle @click="handleViewDetails(row)" title="查看详情" style="margin-right: 8px;">
              <el-icon>
                <InfoFilled />
              </el-icon>
            </el-button>
            <!-- 上传物品 -->
            <el-button type="primary" circle @click="handleUploadItems(row)" title="上传物品">
              <el-icon>
                <Upload />
              </el-icon>
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

    <!-- 分配床位弹窗 -->
    <AssignBedModal
      v-model="showAssignBedModal"
      :selected-person="selectedPerson"
      @success="handleAssignSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, InfoFilled, Upload } from '@element-plus/icons-vue'
// import type { AssignmentListItemVO } from '@/api/types'

import { getPendingAssignments, getAssignedList, getCheckedInList, getCheckedOutList } from '@/api/assignment'
import type { AssignmentListItemVO, AssignmentRequest, AssignedLodgingVO, AssignedRequest, CheckedInLodgingVO, CheckedInRequest, CheckedOutLodgingVO, CheckedOutRequest } from '@/types/assignment'
import { CHECKOUT_STATUS_MAP } from '@/types/assignment'
import { TYPE_MAP } from '@/types/assignment'
import AssignBedModal from '@/components/AssignBed/AssignBedModal.vue'

// 定义响应式数据
const tableData = ref<AssignmentListItemVO[] | AssignedLodgingVO[] | CheckedInLodgingVO[] | CheckedOutLodgingVO[]>([])
const selectedRows = ref<AssignmentListItemVO[]>([])
const selectedAssignedRows = ref<AssignedLodgingVO[]>([])
const selectedCheckedInRows = ref<CheckedInLodgingVO[]>([])
const selectedCheckedOutRows = ref<CheckedOutLodgingVO[]>([])

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
const activeTab = ref('pending') // 默认激活"待分配"Tab

// 分组选项
const groupOptions = ref(['第一组', '第二组', '第三组'])

// 部门选项（对应 departmentCode）
const departmentOptions = ref([
  { label: '项目组', value: 'PROJECT' },
  { label: '学修组', value: 'READING' },
  { label: '编译组', value: 'COMPILATION' },
  { label: '其他', value: 'OTHER' }
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

// 监听Tab切换
const handleTabChange = (tabName: string | number) => {
  const tabNameStr = String(tabName)
  console.log(`切换到Tab: ${tabNameStr}`)
  activeTab.value = tabNameStr as 'pending' | 'assigned' | 'checkedIn' | 'checkedOut'
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

  fetchData() // 重新加载数据
}

// 获取数据的方法
const fetchData = async () => {
  try {
    let response

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

      case 'checkedIn':
        const checkedInParams: CheckedInRequest = {
          pageNo: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          keyword: searchKeyword.value || undefined,
          gender: genderFilter.value,
          departmentCode: departmentFilter.value || undefined
        }
        response = await getCheckedInList(checkedInParams)
        break

      case 'checkedOut':
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
  // 只有待分配的可以分配床位
  if (activeTab.value === 'pending') {
    selectedPerson.value = row as AssignmentListItemVO
    showAssignBedModal.value = true
  } else {
    ElMessage.info('已分配人员无法重新分配床位')
  }
}

// 查看详情按钮点击事件
const handleViewDetails = (row: AssignmentListItemVO | AssignedLodgingVO | CheckedInLodgingVO | CheckedOutLodgingVO) => {
  ElMessage.info(`查看 ${row.name} 的详细信息`)
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
.assignment-list-container {
  padding: 20px;
  background-color: #fdf6e3;
  /* 原型图背景色 */
  border-radius: 8px;
  min-height: 100vh;

  .tabs-area {
    margin-bottom: 24px;

    :deep(.el-tabs__nav-wrap::after) {
      background-color: #e5e5e5;
      /* 与原型图一致的浅灰色下划线 */
    }

    :deep(.el-tabs__item) {
      color: #666;
      /* 原型图Tab文字颜色 */
      font-size: 15px;
      font-weight: 500;
      padding: 0 20px;

      &.is-active {
        color: #8B5E3C;
        /* 原型图选中Tab的文字颜色 */
        font-weight: 600;
      }

      &:hover {
        color: #8B5E3C;
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: #8B5E3C;
      /* 原型图选中Tab的下划线颜色 */
      height: 3px;
    }
  }

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .title-section {
      h2 {
        font-size: 22px;
        color: #333;
        margin: 0;
        font-weight: 600;
      }

      .subtitle {
        font-size: 14px;
        color: #666;
        margin: 6px 0 0;
        font-weight: 400;
      }
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 12px;

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

  :deep(.el-table) {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    .el-table__header-wrapper {
      th {
        background-color: #f8f9fa;
        color: #333;
        font-weight: 600;
        font-size: 14px;
        border-bottom: 1px solid #e9ecef;
      }
    }

    .el-table__body-wrapper {
      tr {
        transition: background-color 0.2s;

        &:hover {
          background-color: #f8f9fa;
        }
      }

      td {
        padding: 16px 0;
        border-bottom: 1px solid #f1f3f4;
      }
    }

    .el-table__selection-cell {
      .el-checkbox {
        margin-left: 8px;
      }
    }
  }

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
    .el-button + .el-button {
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
    justify-content: space-between;
    align-items: center;
    // margin-top: 20px;
    padding: 16px 20px;
    background-color: #fff;
    // border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

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

/* 响应式设计 */
@media (max-width: 768px) {
  .assignment-list-container {
    padding: 16px;

    .header-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .filter-actions {
        width: 100%;
        justify-content: space-between;
      }
    }

    .pagination-container {
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }
  }
}
</style>