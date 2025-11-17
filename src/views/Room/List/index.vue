<template>
  <div class="room-management-container">
    <!-- 标题区 -->
    <PageHeader title="房间管理" />

    <!-- Tabs区 -->
    <el-tabs v-model="activeTab" class="room-tabs">
      <el-tab-pane label="使用中" name="active"></el-tab-pane>
      <el-tab-pane label="关闭中" name="inactive"></el-tab-pane>
    </el-tabs>

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
        :data="roomList"
        stripe
        style="width: 100%"
        :row-class-name="tableRowClassName"
        fit 
      >
        <el-table-column prop="roomNo" label="房间号" />
        <el-table-column prop="gender" label="房间类型">
          <template #default="{ row }">
            <el-tag :type="row.gender === 1 ? 'info' : 'pink'" size="small">
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
        <el-table-column label="操作" min-width="150"> <!-- 关键：为操作列设置最小宽度 -->
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="handleBedManagement(row)">床位管理</el-button>
            <el-button type="warning" link @click.stop="handleEditRoom(row)">编辑</el-button>
            <el-button type="danger" link @click.stop="handleToggleStatus(row)">
              {{ row.status === 1 ? '关闭' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
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
        <el-form-item label="房间类型" prop="gender">
          <el-select v-model="addRoomForm.gender" placeholder="请选择房间类型">
            <el-option label="男众" :value="1" />
            <el-option label="女众" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间分类" prop="roomType">
          <el-select v-model="addRoomForm.roomType" placeholder="请选择房间分类">
            <el-option label="单人间" :value="1" />
            <el-option label="双人间" :value="2" />
            <el-option label="多人间" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-select v-model="addRoomForm.floor" placeholder="请选择楼层">
            <el-option v-for="n in 10" :key="n" :label="`${n}层`" :value="n" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间状态" prop="status">
          <el-select v-model="addRoomForm.status" placeholder="请选择房间状态">
            <el-option label="使用中" :value="1" />
            <el-option label="关闭中" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="床位数量" prop="bedCount">
          <el-input-number v-model="addRoomForm.bedCount" :min="1" :max="20" controls-position="right" />
        </el-form-item>
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
import { getRooms, createRoom, updateRoom, type CreateRoomRequest } from '@/api/room';
import type { IPageRoomSummaryVO } from '@/types/room'
import PageHeader from '@/components/PageHeader.vue'

// 页面数据
const activeTab = ref('active'); // 默认选中“使用中”
const searchQuery = ref('');
const selectedGender = ref<number | string>('');
const pageSize = ref(5);


// =============== 响应式状态 ===============
const roomList = ref<IPageRoomSummaryVO[]>([]);
const total = ref(0);
const currentPage = ref(1);
const searchKeyword = ref('');
const selectedType = ref<number | undefined>(undefined);
const selectedDateRange = ref('');
const dialogVisible = ref(false);
const currentItem = ref<IPageRoomSummaryVO | null>(null);
const isViewOnly = ref(true);

// 新增房间对话框相关
const addRoomDialogVisible = ref(false);
const addRoomFormRef = ref();

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
  bedCount: 4,
  description: '',
});

const addRoomRules = reactive({
  roomNo: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  roomType: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  bedCount: [{ required: true, message: '请输入床位数量', trigger: 'blur' }],
});

// 模拟API请求（实际项目中应替换为Axios调用）
const fetchRooms = async () => {
  // 模拟从后端获取数据
  // const mockData: Response = {
  //   code: 0,
  //   data: {
  //     records: [
  //       { id: 1, roomNo: 'A101', gender: 1, floor: 1, bedCount: 4, status: 1, usedBedCount: 2 },
  //       { id: 2, roomNo: 'A102', gender: 2, floor: 1, bedCount: 4, status: 1, usedBedCount: 1 },
  //     ],
  //     total: 12,
  //     size: 5,
  //     current: 1,
  //     pages: 3,
  //   },
  //   message: '',
  //   success: true,
  //   timestamp: Date.now(),
  // };

  // if (mockData.code === 0 && mockData.data) {
  //   roomList.value = mockData.data.records || [];
  //   total.value = mockData.data.total || 0;
  //   currentPage.value = mockData.data.current || 1;
  // }

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


// 方法
const handleSearch = () => {
  console.log('搜索:', searchQuery.value);
  // 实际项目中，这里会调用API并传入searchQuery.value
  fetchRooms();
};

const handleFilterChange = () => {
  console.log('筛选条件变化:', selectedGender.value);
  // 实际项目中，这里会调用API并传入selectedGender.value
  fetchRooms();
};

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
  // 实际项目中，这里会调用API并传入currentPage.value
  fetchRooms();
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
    bedCount: 4,
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
          id: addRoomForm.id,
          roomNo: addRoomForm.roomNo,
          gender: addRoomForm.gender,
          roomType: addRoomForm.roomType,
          bedCount: addRoomForm.bedCount,
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

const handleBedManagement = (row: RoomSummaryVO) => {
  ElMessage.info(`正在管理房间 ${row.roomNo} 的床位`);
  // 跳转到床位管理页面或打开床位管理弹窗
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
    bedCount: row.bedCount || 4,
    description: row.description || '',
  });

  // 打开对话框
  addRoomDialogVisible.value = true;
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

const tableRowClassName = ({ row }: any) => {
  return 'room-table-row';
};

// 初始化加载数据
onMounted(() => {
  fetchRooms();
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
}

.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #8D6E63;
}

.search-controls {
  display: flex;
  gap: 10px;
  align-items: center;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination span {
  font-size: 14px;
  color: #5D4037;
}

.footer {
  background-color: #3E2723;
  color: white;
  padding: 40px 60px;
  margin-top: 40px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h4 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #FFFFFF;
}

.footer-section p,
.footer-section ul li a {
  font-size: 14px;
  color: #BDBDBD;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  text-decoration: none;
  color: #BDBDBD;
}

.footer-section ul li a:hover {
  color: #FFFFFF;
}

.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #FFFFFF;
}

.footer-desc {
  font-size: 14px;
  color: #BDBDBD;
}

.contact-info p {
  margin: 5px 0;
  display: flex;
  align-items: center;
}

.contact-info i {
  margin-right: 8px;
}

.social-icons {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.social-icons :deep(.el-button) {
  background-color: #5D4037;
  border-color: #5D4037;
  color: white;
}

.social-icons :deep(.el-button:hover) {
  background-color: #4E342E;
  border-color: #4E342E;
}

.qr-code-tip {
  font-size: 12px;
  color: #BDBDBD;
  text-align: center;
}

.copyright {
  text-align: center;
  font-size: 12px;
  color: #BDBDBD;
  padding-top: 20px;
  border-top: 1px solid #4E342E;
}
</style>