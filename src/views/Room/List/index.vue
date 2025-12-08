<template>
  <div class="room-management-container">
    <!-- 标题区 -->
    <PageHeader title="房间管理" />

    <!-- 床位状态过滤器 -->
    <BedStatusFilter v-model="filterStatus" @update:modelValue="statusChange" />

    <!-- 表格区 -->
    <div class="table-container">
      <div class="table-header">
        <span class="header-title">房间列表</span>
        <div class="search-controls">
          <el-input
            v-model="searchQuery"
            placeholder="搜索房间号或类型"
            clearable
            prefix-icon="Search"
            @input="handleSearch"
          />
          <el-select
            v-model="selectedGender"
            placeholder="全部房间类型"
            @change="handleFilterChange"
          >
            <el-option label="全部房间类型" value="" />
            <el-option label="男众" :value="1" />
            <el-option label="女众" :value="2" />
          </el-select>
          <el-button type="primary" @click="showAddRoomDialog">+ 新增房间</el-button>
        </div>
      </div>

      <el-table
        :data="filterStatus === 0 ? roomList : assignedList"
        stripe
        style="width: 100%"
        :row-class-name="tableRowClassName"
        :header-cell-style="{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f5f7fa' }"
      >
        <!-- 未分配床位状态的列 -->
        <template v-if="filterStatus === 0">
          <el-table-column prop="roomNo" label="房间号" />
          <el-table-column prop="gender" label="房间类型">
            <template #default="{ row }">
              <el-tag :type="row.gender === 1 ? 'info' : 'danger'" size="small">
                {{ row.gender === 1 ? '男众' : '女众' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="floor" label="楼层" />
          <el-table-column prop="bedCount" label="床位数量" />
          <el-table-column prop="usedBedCount" label="已用床位" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1" type="success" size="small">使用中</el-tag>
              <el-tag v-else type="danger" size="small">关闭中</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="150">
            <!-- 关键：为操作列设置最小宽度 -->
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="handleBedManagement(row)"
                >床位管理</el-button
              >
              <el-button type="warning" link @click.stop="handleEditRoom(row)">编辑</el-button>
              <el-button type="danger" link @click.stop="handleToggleStatus(row)">
                {{ row.status === 1 ? '关闭' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </template>

        <!-- 已分配床位状态的列 -->
        <template v-else>
          <el-table-column prop="name" label="姓名" :min-width="120" />
          <el-table-column prop="roomAndBed" label="房间/床位" :min-width="150" />
          <el-table-column prop="group" label="分组" :min-width="100" />
          <el-table-column prop="expectedCheckinDate" label="预计入住" :min-width="120" />
          <el-table-column prop="expectedCheckoutDate" label="预计离开" :min-width="120" />
          <el-table-column prop="assignedDate" label="分配日期" :min-width="120" />
          <el-table-column label="操作" :min-width="120">
            <template #default>
              <el-button type="primary" link>查看</el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <div class="pagination">
        <span
          >显示 {{ (currentPage - 1) * pageSize + 1 }} 至
          {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条</span
        >
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 床位管理对话框 -->
    <el-dialog
      v-model="bedManagementDialogVisible"
      title="床位管理"
      width="700px"
      @close="resetBedManagementForm"
    >
      <div class="bed-management-content">
        <div class="bed-management-header">
          <h3>房间 {{ currentRoom?.roomNo }} 的床位管理</h3>
          <el-button type="primary" @click="showAddBedDialog">+ 新增床位</el-button>
        </div>

        <!-- 床位列表 -->
        <el-table :data="bedList" style="width: 100%; margin-top: 20px">
          <el-table-column prop="bedNo" label="床位号" width="120" />
          <el-table-column prop="bedType" label="床位类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.bedType === 1 ? 'info' : 'success'" size="small">
                {{ row.bedType === 1 ? '上铺' : '下铺' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getBedStatusType(row.status)" size="small">
                {{ getBedStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditBed(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteBed(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination" style="margin-top: 20px">
          <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="bedTotal"
            :page-size="bedPageSize"
            :current-page="bedCurrentPage"
            @current-change="handleBedPageChange"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑床位对话框 -->
    <el-dialog
      v-model="addBedDialogVisible"
      :title="isBedEditMode ? '编辑床位' : '新增床位'"
      width="500px"
      @close="resetAddBedForm"
    >
      <el-form ref="addBedFormRef" :model="addBedForm" :rules="addBedRules" label-width="100px">
        <el-form-item label="房间号" prop="roomId">
          <el-input :value="currentRoom?.roomNo" disabled />
        </el-form-item>
        <el-form-item label="床位号" prop="bedNo">
          <el-input v-model="addBedForm.bedNo" placeholder="例如：1-上, 1-下" />
        </el-form-item>
        <el-form-item label="床位类型" prop="bedType">
          <el-select v-model="addBedForm.bedType" placeholder="请选择床位类型" style="width: 100%">
            <el-option label="上铺" :value="1" />
            <el-option label="下铺" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="床位状态" prop="status">
          <el-select v-model="addBedForm.status" placeholder="请选择床位状态" style="width: 100%">
            <el-option label="空闲" :value="0" />
            <el-option label="占用" :value="1" />
            <el-option label="锁定" :value="2" />
            <el-option label="待打扫" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addBedDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddBed" :loading="bedSubmitting">
            保存床位
          </el-button>
        </span>
      </template>
    </el-dialog>

    <AddRoomDialog
      v-model="addRoomDialogVisible"
      :is-edit-mode="isEditMode"
      :room-data="editingRoom"
      @success="handleRoomSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getRooms } from '@/api/room'
import { getAssignedList } from '@/api/assignment' // 已分配床位 API
import { createBed, getBedsByRoomId, deleteBed, updateBed } from '@/api/bed' // 导入床位相关API
import type { Bed, AssignedLodgingVO, IPageAssignedLodgingVO } from '@/types/assignment'
import type { IPageRoomSummaryVO, RoomSummaryVO } from '@/types/room'
import PageHeader from '@/components/PageHeader.vue'
import BedStatusFilter from './components/BedStatusFilter.vue'
import AddRoomDialog from './components/AddRoomDialog.vue'

const pageSize = ref(5)

// 床位分配状态：0-未分配床位，1-已分配床位
const filterStatus = ref(0)

// =============== 响应式状态 ===============
const roomList = ref<IPageRoomSummaryVO[]>([])
const assignedList = ref<AssignedLodgingVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const searchQuery = ref('')
const selectedGender = ref<number | string>('')

// 新增房间对话框相关
const addRoomDialogVisible = ref(false)
const isEditMode = ref(false)
const editingRoom = ref<RoomSummaryVO | null>(null)

// 床位管理相关状态
const bedManagementDialogVisible = ref(false)
const bedList = ref<Bed[]>([])
const bedTotal = ref(0)
const bedCurrentPage = ref(1)
const bedPageSize = ref(10)
const currentRoom = ref<IPageRoomSummaryVO | null>(null) // 当前房间信息

// 新增床位对话框相关
const addBedDialogVisible = ref(false)
const addBedFormRef = ref()
const isBedEditMode = ref(false)
const editingBedId = ref<number | null>(null)
const bedSubmitting = ref(false)

// 新增床位表单
const addBedForm = reactive({
  roomId: 0,
  bedNo: '',
  bedType: 1, // 1-上铺, 2-下铺
  status: 0 // 0-空闲, 1-占用, 2-锁定, 3-待打扫
})

// 床位表单验证规则
const addBedRules = reactive({
  bedNo: [{ required: true, message: '请输入床位号', trigger: 'blur' }],
  bedType: [{ required: true, message: '请选择床位类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择床位状态', trigger: 'change' }]
})

// ====== 筛选状态 切换 ======
const statusChange = () => {
  currentPage.value = 1 // 切换 Tab 时重置页码
  fetchData() // 重新加载数据
}

// 获取未分配床位的房间数据
const fetchRooms = async () => {
  try {
    const params = {
      keyword: searchQuery.value || undefined,
      gender: selectedGender.value || undefined,
      pageNo: currentPage.value,
      pageSize: 10
    }
    const res = await getRooms(params)
    roomList.value = res.records || []
    total.value = res.total || 0
    currentPage.value = res.current || 1
    console.log(res)
  } catch (err) {
    ElMessage.error('网络错误')
  }
}

// 获取已分配床位的数据
const fetchAssigned = async () => {
  try {
    const params = {
      keyword: searchQuery.value || undefined,
      pageNo: currentPage.value,
      pageSize: 10
    }
    const res: IPageAssignedLodgingVO = await getAssignedList(params)
    assignedList.value = res.data?.records || []
    total.value = res.data?.total || 0
    currentPage.value = res.data?.current || 1
    console.log(res)
  } catch (err) {
    ElMessage.error('网络错误')
  }
}

// 统一的数据获取方法
const fetchData = async () => {
  if (filterStatus.value === 0) {
    // 未分配床位
    await fetchRooms()
  } else {
    // 已分配床位
    await fetchAssigned()
  }
}

// 方法
const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
  // 实际项目中，这里会调用API并传入searchQuery.value
  currentPage.value = 1 // 重置页码
  fetchData()
}

const handleFilterChange = () => {
  console.log('筛选条件变化:', selectedGender.value)
  // 实际项目中，这里会调用API并传入selectedGender.value
  currentPage.value = 1 // 重置页码
  fetchData()
}

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage
  // 实际项目中，这里会调用API并传入currentPage.value
  fetchData()
}

const showAddRoomDialog = () => {
  isEditMode.value = false
  editingRoom.value = null
  addRoomDialogVisible.value = true
}

const handleEditRoom = (row: IPageRoomSummaryVO) => {
  // 设置编辑模式
  isEditMode.value = true
  editingRoom.value = row

  // 打开对话框
  addRoomDialogVisible.value = true
}

const handleRoomSaved = async () => {
  await fetchRooms()
}

const handleToggleStatus = (row: RoomSummaryVO) => {
  ElMessageBox.confirm(
    `确定要${row.status === 1 ? '关闭' : '启用'}房间 ${row.roomNo} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 实际项目中，这里会调用API更新房间状态
      ElMessage.success(`${row.status === 1 ? '关闭' : '启用'}成功`)
      // 刷新列表
      fetchRooms()
    })
    .catch(() => {
      ElMessage.info('操作已取消')
    })
}

// 床位管理相关方法
const handleBedManagement = async (row: RoomSummaryVO) => {
  currentRoom.value = {
    id: row.id,
    roomNo: row.roomNo,
    gender: row.gender,
    roomType: row.roomType,
    floor: row.floor,
    status: row.status,
    description: row.description
  }

  // 打开床位管理对话框并加载床位数据
  bedManagementDialogVisible.value = true
  await loadBedList(row.id!)
}

const loadBedList = async (roomId: number) => {
  try {
    // 使用 bed API 中的 getBedsByRoomId
    const response = await getBedsByRoomId(roomId)
    console.log(response)

    bedList.value = response
    console.log(bedList.value)
    console.log(typeof bedList.value)

    bedTotal.value = response.length

    // if (response && response.code === 0 && response.data) {
    //   bedList.value = response.data.records || [];
    //   bedTotal.value = response.data.total || 0;
    // } else {
    //   bedList.value = [];
    //   bedTotal.value = 0;
    // }
  } catch (error) {
    console.error('获取床位列表失败:', error)
    ElMessage.error('获取床位列表失败')
    bedList.value = []
    bedTotal.value = 0
  }
}

const showAddBedDialog = () => {
  isBedEditMode.value = false
  editingBedId.value = null
  // 设置当前房间ID
  addBedForm.roomId = currentRoom.value?.id || 0
  resetAddBedForm()
  addBedDialogVisible.value = true
}

const resetAddBedForm = () => {
  if (addBedFormRef.value) {
    addBedFormRef.value.resetFields()
  }
  Object.assign(addBedForm, {
    roomId: currentRoom.value?.id || 0,
    bedNo: '',
    bedType: 1,
    status: 0
  })
}

const resetBedManagementForm = () => {
  bedList.value = []
  bedTotal.value = 0
  bedCurrentPage.value = 1
  currentRoom.value = null
}

const submitAddBed = async () => {
  if (addBedFormRef.value) {
    addBedFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        bedSubmitting.value = true
        try {
          const bedData = {
            roomId: addBedForm.roomId,
            bedNo: addBedForm.bedNo,
            bedType: addBedForm.bedType,
            status: addBedForm.status
          }

          if (isBedEditMode.value && editingBedId.value) {
            // 编辑床位
            const response = await updateBed(editingBedId.value, {
              ...bedData,
              id: editingBedId.value
            })
            if (response.code === 0) {
              ElMessage.success('床位更新成功')
            } else {
              throw new Error(response.message || '更新失败')
            }
          } else {
            // 新增床位
            const response = await createBed(bedData)
            ElMessage.success('床位添加成功')
            // if (response.code === 0) {
            //   ElMessage.success('床位添加成功');
            // } else {
            //   throw new Error(response.message || '添加失败');
            // }
          }

          addBedDialogVisible.value = false
          // 重新加载床位列表
          await loadBedList(addBedForm.roomId)
        } catch (error: any) {
          console.error(isBedEditMode.value ? '更新床位失败' : '添加床位失败', error)
          ElMessage.error(error.message || (isBedEditMode.value ? '更新床位失败' : '添加床位失败'))
        } finally {
          bedSubmitting.value = false
        }
      } else {
        ElMessage.error('请填写完整的床位信息')
      }
    })
  }
}

const handleEditBed = (row: Bed) => {
  isBedEditMode.value = true
  editingBedId.value = row.id

  Object.assign(addBedForm, {
    roomId: row.roomId || 0,
    bedNo: row.bedNo || '',
    bedType: row.bedType || 1,
    status: row.status || 0
  })

  addBedDialogVisible.value = true
}

const handleDeleteBed = (row: Bed) => {
  ElMessageBox.confirm(`确定要删除床位 ${row.bedNo} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        if (row.id) {
          const response = await deleteBed(row.id)
          if (response.code === 0) {
            ElMessage.success('床位删除成功')
          } else {
            throw new Error(response.message || '删除失败')
          }
        } else {
          throw new Error('床位ID不存在')
        }
        // 重新加载床位列表
        await loadBedList(row.roomId || 0)
      } catch (error: any) {
        console.error('删除床位失败:', error)
        ElMessage.error(error.message || '删除床位失败')
      }
    })
    .catch(() => {
      ElMessage.info('操作已取消')
    })
}

const handleBedPageChange = (newPage: number) => {
  bedCurrentPage.value = newPage
  // 实现分页功能
}

// 根据床位状态获取标签类型
const getBedStatusType = (status?: number) => {
  if (status === undefined) return 'info'

  switch (status) {
    case 0: // 空闲
      return 'success'
    case 1: // 占用
      return 'danger'
    case 2: // 锁定
      return 'warning'
    case 3: // 待打扫
      return 'info'
    default:
      return 'info'
  }
}

// 根据床位状态获取文本
const getBedStatusText = (status?: number) => {
  if (status === undefined) return '未知'

  switch (status) {
    case 0: // 空闲
      return '空闲'
    case 1: // 占用
      return '占用'
    case 2: // 锁定
      return '锁定'
    case 3: // 待打扫
      return '待打扫'
    default:
      return '未知'
  }
}

const tableRowClassName = ({ row }: any) => {
  return 'room-table-row'
}

// 初始化加载数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.room-management-container {
  background-color: #fff8e7;
  min-height: 100vh;
  padding: 20px 40px;
  box-sizing: border-box;
}

.room-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 0 16px;
  margin: 0 0 30px 0;
}

/* ====== 修复 Tabs 样式（参考 ReviewList 页面）====== */
:deep(.el-tabs__header) {
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0 16px;
  margin: 0;
}

/* 移除 Element Plus 默认的下划线 */
:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

/* 为每个 Tab 项添加样式，平摊宽度 */
:deep(.el-tabs__item) {
  color: #5d4037;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 20px;
  border: none;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  position: relative;
  margin-right: 0;
  flex: 1;
  text-align: center;
  height: 58px;
}

/* 确保导航容器是 flex 布局 */
:deep(.el-tabs__nav) {
  display: flex;
  width: 100%;
  border: none;
}

/* 确保导航项容器也是 flex 布局 */
:deep(.el-tabs__nav-scroll) {
  display: flex;
}

/* 选中项的样式 */
:deep(.el-tabs__item.is-active) {
  color: #8d6e63;
  background-color: #fff;
  /* 使用伪元素自定义下划线 */
}

:deep(.el-tabs__item.is-active::after) {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 3px;
  background-color: #8d6e63;
  border-radius: 3px 3px 0 0;
}

/* 鼠标悬停样式 */
:deep(.el-tabs__item:hover) {
  color: #8d6e63;
}

:deep(.el-tabs__active-bar) {
  background-color: #8d6e63;
  padding: 20px;
  background-color: #fdf6e3;
  min-height: calc(100vh - 150px);
}

.table-container {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #8b4513;
  margin-right: 20px;
  white-space: nowrap;
}

.search-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  gap: 10px;
}

.search-controls .el-input,
.search-controls .el-select {
  width: 200px;
}

.search-controls .el-button {
  background-color: #8d6e63;
  border-color: #8d6e63;
  color: white;
}

.search-controls .el-button:hover {
  background-color: #6d4c41;
  border-color: #6d4c41;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination span {
  font-size: 14px;
  color: #5d4037;
}

:deep(.el-table__body tr:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.application-table {
  max-height: calc(100vh - 390px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}
</style>
