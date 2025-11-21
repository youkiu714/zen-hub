<template>
  <div class="room-management-container">
    <!-- 标题区 -->
<<<<<<< HEAD
    <PageHeader title="房间管理" />
=======
    <PageHeader title="房间管理">
    </PageHeader>
>>>>>>> main

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
          <el-select v-model="selectedGender" placeholder="全部房间类型" @change="handleFilterChange">
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
        fit 
      >
        <!-- 未分配床位状态的列 -->
        <template v-if="filterStatus === 0">
          <el-table-column prop="roomNo" label="房间号" />
          <el-table-column prop="gender" label="房间类型">
            <template #default="{ row }">
              <el-tag :type="row.gender === 1 ? 'info' : 'pink'" size="small">
                {{ row.gender === 1 ? '男众' : '女众' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="floor" label="楼层" />
          <!-- <el-table-column prop="bedCount" label="床位数量" /> -->
          <el-table-column prop="usedBedCount" label="已用床位" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1" type="success" size="small">使用中</el-tag>
              <el-tag v-else type="danger" size="small">关闭中</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="150"> <!-- 关键：为操作列设置最小宽度 -->
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="handleBedManagement(row)">床位管理</el-button>
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
        <span>显示 {{ (currentPage - 1) * pageSize + 1 }} 至 {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条</span>
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
        <el-table :data="bedList" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="bedNo" label="床位号" width="120" />
          <el-table-column prop="bedType" label="床位类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.bedType === 1 ? 'primary' : 'success'" size="small">
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
        <div class="pagination" style="margin-top: 20px;">
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
          <el-select v-model="addBedForm.bedType" placeholder="请选择床位类型" style="width: 100%;">
            <el-option label="上铺" :value="1" />
            <el-option label="下铺" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="床位状态" prop="status">
          <el-select v-model="addBedForm.status" placeholder="请选择床位状态" style="width: 100%;">
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
    
    <!-- 新增/编辑房间对话框 -->
    <el-dialog
      v-model="addRoomDialogVisible"
      :title="isEditMode ? '编辑房间' : '新增房间'"
      width="600px"
      @close="resetAddForm"
    >
      <el-form ref="addRoomFormRef" :model="addRoomForm" :rules="addRoomRules" label-width="100px">
        <el-form-item label="房间号" prop="roomNo">
          <el-input v-model="addRoomForm.roomNo" placeholder="例如：A101" :disabled="isEditMode" />
        </el-form-item>
        <el-form-item label="房间分类" prop="roomType">
          <el-select v-model="addRoomForm.roomType" placeholder="请选择房间分类">
            <el-option label="客房" :value="1" />
            <el-option label="短住" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间类型" prop="gender">
          <el-select v-model="addRoomForm.gender" placeholder="男众女众" @change="handleGenderChange">
            <el-option label="男众" :value="1" />
            <el-option label="女众" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-select v-model="addRoomForm.floor" placeholder="请选择楼层" :loading="loadingFloors">
            <el-option v-for="floor in floorList" :key="floor" :label="`${floor}层`" :value="floor" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间状态" prop="status">
          <el-select v-model="addRoomForm.status" placeholder="请选择房间状态">
            <el-option label="使用中" :value="1" />
            <el-option label="关闭中" :value="0" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="床位数量" prop="bedCount">
          <el-input-number v-model="addRoomForm.bedCount" :min="1" :max="20" controls-position="right" />
        </el-form-item> -->
        <el-form-item label="房间描述">
          <el-input
            v-model="addRoomForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入房间描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRoomDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddRoom">保存房间</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getRooms, createRoom, updateRoom, type CreateRoomRequest } from '@/api/room';
import type { IPageRoomSummaryVO } from '@/types/room'
import PageHeader from '@/components/PageHeader.vue'

// 页面数据
const activeTab = ref('active'); // 默认选中“使用中”
const searchQuery = ref('');
const selectedGender = ref<number | string>('');
const pageSize = ref(5);
import { getFloors, getAssignedList } from '@/api/assignment'; // 使用 assignment API 中的 getFloors 和已分配床位API
import { createBed, getBedsByRoomId, deleteBed, updateBed } from '@/api/bed'; // 导入床位相关API
import type { Bed, AssignedLodgingVO, IPageAssignedLodgingVO } from '@/types/assignment'
import type { IPageRoomSummaryVO, RoomSummaryVO } from '@/types/room'
import PageHeader from '@/components/PageHeader.vue'
import BedStatusFilter from './components/BedStatusFilter.vue'

// 床位分配状态：0-未分配床位，1-已分配床位
const filterStatus = ref(0)

// =============== 响应式状态 ===============
const roomList = ref<IPageRoomSummaryVO[]>([]);
const assignedList = ref<AssignedLodgingVO[]>([]);
const total = ref(0);
const currentPage = ref(1);
const searchQuery = ref('');
const selectedGender = ref<number | string>('');
const searchKeyword = ref('');
const selectedType = ref<number | undefined>(undefined);
const selectedDateRange = ref('');
const dialogVisible = ref(false);
const currentItem = ref<IPageRoomSummaryVO | null>(null);
const isViewOnly = ref(true);

// 新增房间对话框相关
const addRoomDialogVisible = ref(false);
const addRoomFormRef = ref();
const loadingFloors = ref(false);
const floorList = ref<number[]>([]);

// 编辑模式相关
const isEditMode = ref(false);
const editingRoomId = ref<number | null>(null);
const addRoomForm = reactive({
  id: 0,
  roomNo: '',
  gender: 1,
  roomType: 1,
  floor: 1,
  status: 1,
  // bedCount: 4,
  description: '',
});

const addRoomRules = reactive({
  roomNo: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  roomType: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  // bedCount: [{ required: true, message: '请输入床位数量', trigger: 'blur' }],
});

// 床位管理相关状态
const bedManagementDialogVisible = ref(false);
const bedList = ref<Bed[]>([]);
const bedTotal = ref(0);
const bedCurrentPage = ref(1);
const bedPageSize = ref(10);
const currentRoom = ref<IPageRoomSummaryVO | null>(null); // 当前房间信息

// 新增床位对话框相关
const addBedDialogVisible = ref(false);
const addBedFormRef = ref();
const isBedEditMode = ref(false);
const editingBedId = ref<number | null>(null);
const bedSubmitting = ref(false);

// 新增床位表单
const addBedForm = reactive({
  roomId: 0,
  bedNo: '',
  bedType: 1,  // 1-上铺, 2-下铺
  status: 0,   // 0-空闲, 1-占用, 2-锁定, 3-待打扫
});

// 床位表单验证规则
const addBedRules = reactive({
  bedNo: [{ required: true, message: '请输入床位号', trigger: 'blur' }],
  bedType: [{ required: true, message: '请选择床位类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择床位状态', trigger: 'change' }],
});

// ====== 筛选状态 切换 ======
const statusChange = () => {
  currentPage.value = 1; // 切换 Tab 时重置页码
  fetchData(); // 重新加载数据
};

// 获取未分配床位的房间数据
const fetchRooms = async () => {
  try {
    const params = {
      keyword: searchQuery.value || undefined,
      gender: selectedGender.value || undefined,
      pageNo: currentPage.value,
      pageSize: 10,
    };
    const res = await getRooms(params);
    roomList.value = res.records || []
    total.value = res.total || 0
    currentPage.value = res.current || 1
    console.log(res);

  } catch (err) {
    ElMessage.error('网络错误');
  }
};

// 获取已分配床位的数据
const fetchAssigned = async () => {
  try {
    const params = {
      keyword: searchQuery.value || undefined,
      pageNo: currentPage.value,
      pageSize: 10,
    };
    const res: IPageAssignedLodgingVO = await getAssignedList(params);
    assignedList.value = res.data?.records || []
    total.value = res.data?.total || 0
    currentPage.value = res.data?.current || 1
    console.log(res);

  } catch (err) {
    ElMessage.error('网络错误');
  }
};

// 统一的数据获取方法
const fetchData = async () => {
  if (filterStatus.value === 0) { // 未分配床位
    await fetchRooms();
  } else { // 已分配床位
    await fetchAssigned();
  }
};


// 方法
const handleSearch = () => {
  console.log('搜索:', searchQuery.value);
  // 实际项目中，这里会调用API并传入searchQuery.value
  currentPage.value = 1; // 重置页码
  fetchData();
};

const handleFilterChange = () => {
  console.log('筛选条件变化:', selectedGender.value);
  // 实际项目中，这里会调用API并传入selectedGender.value
  currentPage.value = 1; // 重置页码
  fetchData();
};

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
  // 实际项目中，这里会调用API并传入currentPage.value
  fetchData();
};

const showAddRoomDialog = () => {
  addRoomDialogVisible.value = true;
};

const resetAddForm = () => {
  addRoomFormRef.value?.resetFields();
  Object.assign(addRoomForm, {
    roomNo: '',
    gender: 1,
    roomType: 1,
    floor: 1,
    status: 1,
    // bedCount: 4,
    description: '',
  });
  isEditMode.value = false;
  editingRoomId.value = null;
};

const submitAddRoom = async () => {
  addRoomFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 构建请求数据，按照API要求的格式
        const roomData: CreateRoomRequest = {
          // id: addRoomForm.id,
          roomNo: addRoomForm.roomNo,
          gender: addRoomForm.gender,
          roomType: addRoomForm.roomType,
          // bedCount: addRoomForm.bedCount,
          floor: addRoomForm.floor,
          status: addRoomForm.status,
          description: addRoomForm.description || undefined,
        };

        console.log('提交房间数据:', roomData);

        if (isEditMode.value) {
          // 编辑模式 - 调用更新API
          console.log('编辑模式 - 房间ID:', editingRoomId.value);
          if (editingRoomId.value) {
            // await updateRoom(editingRoomId.value, roomData);
            await createRoom(roomData);
            ElMessage.success('房间更新成功');
          } else {
            ElMessage.error('房间ID不存在，无法更新');
            return;
          }
        } else {
          // 新增模式
          await createRoom(roomData);
          ElMessage.success('房间添加成功');
        }

        addRoomDialogVisible.value = false;

        // 刷新列表
        await fetchRooms();
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error(isEditMode.value ? '房间更新失败，请重试' : '房间添加失败，请重试');
      }
    } else {
      console.log('表单验证失败');
    }
  });
};



const handleEditRoom = (row: IPageRoomSummaryVO) => {
  // 设置编辑模式
  isEditMode.value = true;
  editingRoomId.value = row.id || null;

  // 填充表单数据
  Object.assign(addRoomForm, {
    id: row.id || 0,
    roomNo: row.roomNo || '',
    gender: row.gender || 1,
    roomType: row.roomType || 1,
    floor: row.floor || 1,
    status: row.status || 1,
    // bedCount: row.bedCount || 4,
    description: row.description || '',
  });

  // 打开对话框
  addRoomDialogVisible.value = true;
};

// 根据性别获取楼层列表
const loadFloorsByGender = async (gender: number) => {
  loadingFloors.value = true;
  try {
    // 使用 assignment.ts 中的 getFloors API
    const params = { gender };
    const response = await getFloors(params);
    floorList.value = response
    // console.log(response)
    // if (response && response.data) {
    //   floorList.value = response.data || response || [];
    // } else {
    //   floorList.value = [];
    // }
    console.log(floorList.value)
    // 重置楼层选择
    addRoomForm.floor = floorList.value[0] || 1;
  } catch (error) {
    console.error('获取楼层列表失败:', error);
    ElMessage.error('获取楼层列表失败');
    floorList.value = []; // 确保列表为空
  } finally {
    loadingFloors.value = false;
  }
};

// 当性别选择改变时，更新楼层列表
const handleGenderChange = async () => {
  if (addRoomForm.gender) {
    await loadFloorsByGender(addRoomForm.gender);
  } else {
    floorList.value = [];
  }
};

const handleToggleStatus = (row: RoomSummaryVO) => {
  ElMessageBox.confirm(
    `确定要${row.status === 1 ? '关闭' : '启用'}房间 ${row.roomNo} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中，这里会调用API更新房间状态
    ElMessage.success(`${row.status === 1 ? '关闭' : '启用'}成功`);
    // 刷新列表
    fetchRooms();
  }).catch(() => {
    ElMessage.info('操作已取消');
  });
};

// 床位管理相关方法
const handleBedManagement = async (row: RoomSummaryVO) => {
  currentRoom.value = {
    id: row.id,
    roomNo: row.roomNo,
    gender: row.gender,
    roomType: row.roomType,
    floor: row.floor,
    status: row.status,
    description: row.description,
  };
  
  // 打开床位管理对话框并加载床位数据
  bedManagementDialogVisible.value = true;
  await loadBedList(row.id!);
};

const loadBedList = async (roomId: number) => {
  try {
    // 使用 bed API 中的 getBedsByRoomId
    const response = await getBedsByRoomId(roomId);
    console.log(response);

    bedList.value = response;
    console.log(bedList.value);
    console.log(typeof bedList.value);
    
    bedTotal.value = response.length;

    // if (response && response.code === 0 && response.data) {
    //   bedList.value = response.data.records || [];
    //   bedTotal.value = response.data.total || 0;
    // } else {
    //   bedList.value = [];
    //   bedTotal.value = 0;
    // }
  } catch (error) {
    console.error('获取床位列表失败:', error);
    ElMessage.error('获取床位列表失败');
    bedList.value = [];
    bedTotal.value = 0;
  }
};

const showAddBedDialog = () => {
  isBedEditMode.value = false;
  editingBedId.value = null;
  // 设置当前房间ID
  addBedForm.roomId = currentRoom.value?.id || 0;
  resetAddBedForm();
  addBedDialogVisible.value = true;
};

const resetAddBedForm = () => {
  if (addBedFormRef.value) {
    addBedFormRef.value.resetFields();
  }
  Object.assign(addBedForm, {
    roomId: currentRoom.value?.id || 0,
    bedNo: '',
    bedType: 1,
    status: 0,
  });
};

const resetBedManagementForm = () => {
  bedList.value = [];
  bedTotal.value = 0;
  bedCurrentPage.value = 1;
  currentRoom.value = null;
};

const submitAddBed = async () => {
  if (addBedFormRef.value) {
    addBedFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        bedSubmitting.value = true;
        try {
          const bedData = {
            roomId: addBedForm.roomId,
            bedNo: addBedForm.bedNo,
            bedType: addBedForm.bedType,
            status: addBedForm.status,
          };

          if (isBedEditMode.value && editingBedId.value) {
            // 编辑床位
            const response = await updateBed(editingBedId.value, {
              ...bedData,
              id: editingBedId.value
            });
            if (response.code === 0) {
              ElMessage.success('床位更新成功');
            } else {
              throw new Error(response.message || '更新失败');
            }
          } else {
            // 新增床位
            const response = await createBed(bedData);
            ElMessage.success('床位添加成功');
            // if (response.code === 0) {
            //   ElMessage.success('床位添加成功');
            // } else {
            //   throw new Error(response.message || '添加失败');
            // }
          }

          addBedDialogVisible.value = false;
          // 重新加载床位列表
          await loadBedList(addBedForm.roomId);
        } catch (error: any) {
          console.error(isBedEditMode.value ? '更新床位失败' : '添加床位失败', error);
          ElMessage.error(error.message || (isBedEditMode.value ? '更新床位失败' : '添加床位失败'));
        } finally {
          bedSubmitting.value = false;
        }
      } else {
        ElMessage.error('请填写完整的床位信息');
      }
    });
  }
};

const handleEditBed = (row: Bed) => {
  isBedEditMode.value = true;
  editingBedId.value = row.id;
  
  Object.assign(addBedForm, {
    roomId: row.roomId || 0,
    bedNo: row.bedNo || '',
    bedType: row.bedType || 1,
    status: row.status || 0,
  });

  addBedDialogVisible.value = true;
};

const handleDeleteBed = (row: Bed) => {
  ElMessageBox.confirm(
    `确定要删除床位 ${row.bedNo} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      if (row.id) {
        const response = await deleteBed(row.id);
        if (response.code === 0) {
          ElMessage.success('床位删除成功');
        } else {
          throw new Error(response.message || '删除失败');
        }
      } else {
        throw new Error('床位ID不存在');
      }
      // 重新加载床位列表
      await loadBedList(row.roomId || 0);
    } catch (error: any) {
      console.error('删除床位失败:', error);
      ElMessage.error(error.message || '删除床位失败');
    }
  }).catch(() => {
    ElMessage.info('操作已取消');
  });
};

const handleBedPageChange = (newPage: number) => {
  bedCurrentPage.value = newPage;
  // 实现分页功能
};

// 根据床位状态获取标签类型
const getBedStatusType = (status?: number) => {
  if (status === undefined) return 'info';
  
  switch (status) {
    case 0: // 空闲
      return 'success';
    case 1: // 占用
      return 'danger';
    case 2: // 锁定
      return 'warning';
    case 3: // 待打扫
      return 'info';
    default:
      return 'info';
  }
};

// 根据床位状态获取文本
const getBedStatusText = (status?: number) => {
  if (status === undefined) return '未知';
  
  switch (status) {
    case 0: // 空闲
      return '空闲';
    case 1: // 占用
      return '占用';
    case 2: // 锁定
      return '锁定';
    case 3: // 待打扫
      return '待打扫';
    default:
      return '未知';
  }
};

const tableRowClassName = ({ row }: any) => {
  return 'room-table-row';
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});

</script>

<style scoped>
.room-management-container {
  background-color: #FFF8E7;
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
  color: #5D4037;
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
  color: #8D6E63;
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
  background-color: #8D6E63;
  border-radius: 3px 3px 0 0;
}

/* 鼠标悬停样式 */
:deep(.el-tabs__item:hover) {
  color: #8D6E63;
}

:deep(.el-tabs__active-bar) {
  background-color: #8D6E63;
  padding: 20px;
  background-color: #fdf6e3;
  min-height: calc(100vh - 150px);
}

.table-container {
  background: white;
  padding: 20px;
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
  color: #8B4513;
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
  background-color: #8D6E63;
  border-color: #8D6E63;
  color: white;
}

.search-controls .el-button:hover {
  background-color: #6D4C41;
  border-color: #6D4C41;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background-color: #F5F5DC;
  font-weight: normal;
  color: #5D4037;
}

:deep(.el-table .room-table-row:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination span {
  font-size: 14px;
  color: #5D4037;
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