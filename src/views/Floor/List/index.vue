<template>
  <div class="floor-management-container">
    <!-- 标题区 -->
    <div class="page-header">
      <div class="title-section">
        <h1>楼层管理</h1>
        <p>管理寺院楼层信息，包括楼层编号、性别分类和房间数量</p>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="showAddFloorDialog" :loading="addingFloor">
          <el-icon>
            <Plus />
          </el-icon>
          新增楼层
        </el-button>
        <el-button type="primary" @click="refreshData" :loading="refreshing">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="dashboard-cards">
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">总楼层数</p>
          <h3 class="stat-value">{{ dashboardData.totalFloors || 0 }}</h3>
          <p class="stat-footer success">
            <el-icon>
              <Check />
            </el-icon>
            {{ dashboardData.totalSpaces || 0 }} 个空间
          </p>
        </div>
        <div class="stat-icon floors">
          <el-icon>
            <House />
          </el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">男众楼层</p>
          <h3 class="stat-value">{{ dashboardData.maleFloors || 0 }}</h3>
          <p class="stat-footer neutral">
            <el-icon>
              <Male />
            </el-icon>
            {{ dashboardData.maleSpaces || 0 }} 个空间
          </p>
        </div>
        <div class="stat-icon male">
          <el-icon>
            <Male />
          </el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">女众楼层</p>
          <h3 class="stat-value">{{ dashboardData.femaleFloors || 0 }}</h3>
          <p class="stat-footer warning">
            <el-icon>
              <Female />
            </el-icon>
            {{ dashboardData.femaleSpaces || 0 }} 个空间
          </p>
        </div>
        <div class="stat-icon female">
          <el-icon>
            <Female />
          </el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">可用楼层</p>
          <h3 class="stat-value">{{ dashboardData.availableFloors || 0 }}</h3>
          <p class="stat-footer danger">
            <el-icon>
              <Check />
            </el-icon>
            {{ dashboardData.occupancyRate ? (dashboardData.occupancyRate * 100).toFixed(1) + '%' : '0%' }} 占用率
          </p>
        </div>
        <div class="stat-icon available">
          <el-icon>
            <Check />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 楼层列表区 -->
    <div class="floor-list-container">
      <div class="filter-header">
        <div class="search-controls">
          <el-input
            v-model="searchQuery"
            placeholder="搜索楼层号或类型"
            clearable
            prefix-icon="Search"
            @input="handleSearch"
            style="width: 250px;"
          />
          <el-select v-model="selectedGender" placeholder="全部性别" @change="handleFilterChange">
            <el-option label="全部性别" value="" />
            <el-option label="男众" :value="1" />
            <el-option label="女众" :value="2" />
          </el-select>
        </div>
        <div class="list-actions">
          <el-button type="primary" @click="exportFloors" :loading="exporting">
            <el-icon>
              <Download />
            </el-icon>
            导出
          </el-button>
        </div>
      </div>

      <el-table
        :data="floorList"
        stripe
        style="width: 100%"
        :row-class-name="tableRowClassName"
        fit
        v-loading="loading"
      >
        <el-table-column prop="floor" label="楼层" width="120">
          <template #default="{ row }">
            <span class="floor-number">{{ row.floor }}楼</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别分类" width="150">
          <template #default="{ row }">
            <el-tag :type="row.gender === 1 ? 'info' : 'danger'" size="small">
              {{ row.gender === 1 ? '男众' : '女众' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalRooms" label="房间数量" width="120">
          <template #default="{ row }">
            <span class="room-count">{{ row.totalRooms || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="availableRooms" label="可用房间" width="120">
          <template #default="{ row }">
            <span class="available-count">{{ row.availableRooms || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalBeds" label="床位总数" width="120">
          <template #default="{ row }">
            <span class="bed-count">{{ row.totalBeds || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewFloorDetails(row)">查看房间</el-button>
            <el-button type="warning" link @click="handleEditFloor(row)">编辑</el-button>
            <el-button type="info" link @click="viewFloorOccupancy(row)">查看占用</el-button>
            <el-button type="danger" link @click="handleToggleStatus(row)">
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

    <!-- 新增/编辑楼层对话框 -->
    <el-dialog
      v-model="addFloorDialogVisible"
      :title="isEditMode ? '编辑楼层' : '新增楼层'"
      width="500px"
      @close="resetAddForm"
    >
      <el-form ref="addFloorFormRef" :model="addFloorForm" :rules="addFloorRules" label-width="100px">
        <el-form-item label="楼层号" prop="floor">
          <el-input-number 
            v-model="addFloorForm.floor" 
            placeholder="请输入楼层号" 
            :min="1" 
            :max="20"
            :disabled="isEditMode"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="性别分类" prop="gender">
          <el-select v-model="addFloorForm.gender" placeholder="请选择性别分类" style="width: 100%;">
            <el-option label="男众" :value="1" />
            <el-option label="女众" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层状态" prop="status">
          <el-select v-model="addFloorForm.status" placeholder="请选择楼层状态" style="width: 100%;">
            <el-option label="启用" :value="1" />
            <el-option label="关闭" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层描述">
          <el-input
            v-model="addFloorForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入楼层描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addFloorDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddFloor" :loading="submitting">
            保存楼层
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Refresh,
  Download,
  Plus,
  Check,
  House,
  Male,
  Female,
  Search
} from '@element-plus/icons-vue';
import { getFloors, createFloor, updateFloor, toggleFloorStatus } from '@/api/floor';
import type { FloorItem, CreateFloorRequest, UpdateFloorRequest } from '@/types/floor';

// 定义统计概览数据类型
interface DashboardData {
  totalFloors: number;
  maleFloors: number;
  femaleFloors: number;
  totalSpaces: number;
  maleSpaces: number;
  femaleSpaces: number;
  availableFloors: number;
  occupancyRate: number;
}

// 页面数据
const searchQuery = ref('');
const selectedGender = ref<number | string>('');
const pageSize = ref(10);
const currentPage = ref(1);
const total = ref(0);
const loading = ref(false);
const refreshing = ref(false);
const exporting = ref(false);
const addingFloor = ref(false);
const submitting = ref(false);

// 楼层列表
const floorList = ref<FloorItem[]>([]);

// 统计数据
const dashboardData = ref<DashboardData>({
  totalFloors: 0,
  maleFloors: 0,
  femaleFloors: 0,
  totalSpaces: 0,
  maleSpaces: 0,
  femaleSpaces: 0,
  availableFloors: 0,
  occupancyRate: 0
});

// 新增楼层对话框相关
const addFloorDialogVisible = ref(false);
const addFloorFormRef = ref();
const isEditMode = ref(false);
const editingFloorId = ref<number | null>(null);

// 新增楼层表单
const addFloorForm = reactive({
  floor: 1,
  gender: 1,
  status: 1,
  description: '',
});

// 表单验证规则
const addFloorRules = reactive({
  floor: [
    { required: true, message: '请输入楼层号', trigger: 'blur' },
    { type: 'number', min: 1, max: 20, message: '楼层号必须在1-20之间', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别分类', trigger: 'change' }],
  status: [{ required: true, message: '请选择楼层状态', trigger: 'change' }],
});

// 模拟数据加载函数
const fetchFloors = async () => {
  loading.value = true;
  try {
    const params = {
      gender: selectedGender.value ? Number(selectedGender.value) : undefined,
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      floorNo: searchQuery.value || undefined,
    };
    
    const response = await getFloors(params);
    
    if (response.code === 0 && response.data) {
      floorList.value = response.data.records || [];
      total.value = response.data.total || 0;
      currentPage.value = response.data.current || 1;
    } else {
      throw new Error(response.message || '获取楼层列表失败');
    }
  } catch (error: any) {
    console.error('获取楼层列表失败:', error);
    ElMessage.error(error.message || '获取楼层列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取统计概览数据
const fetchDashboardData = async () => {
  try {
    // 在实际项目中，这里应该调用API获取真实数据
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟统计数据
    dashboardData.value = {
      totalFloors: 8,
      maleFloors: 4,
      femaleFloors: 4,
      totalSpaces: 94, // 总房间数
      maleSpaces: 47,
      femaleSpaces: 47,
      availableFloors: 6, // 可用楼层
      occupancyRate: 0.68 // 占用率
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
  }
};

// 事件处理函数
const handleSearch = () => {
  currentPage.value = 1;
  fetchFloors();
};

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchFloors();
};

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
  fetchFloors();
};

const refreshData = async () => {
  refreshing.value = true;
  try {
    await Promise.all([
      fetchDashboardData(),
      fetchFloors()
    ]);
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('刷新失败');
  } finally {
    refreshing.value = false;
  }
};

const exportFloors = async () => {
  exporting.value = true;
  try {
    // 模拟导出操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('楼层数据导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

const showAddFloorDialog = () => {
  isEditMode.value = false;
  editingFloorId.value = null;
  resetAddForm();
  addFloorDialogVisible.value = true;
};

const resetAddForm = () => {
  if (addFloorFormRef.value) {
    addFloorFormRef.value.resetFields();
  }
  Object.assign(addFloorForm, {
    floor: 1,
    gender: 1,
    status: 1,
    description: '',
  });
};

const submitAddFloor = async () => {
  if (addFloorFormRef.value) {
    addFloorFormRef.value.validate(async (valid: boolean) => {
      if (valid) {
        submitting.value = true;
        try {
          const floorData: CreateFloorRequest = {
            floor: addFloorForm.floor,
            gender: addFloorForm.gender,
            status: addFloorForm.status,
            description: addFloorForm.description || undefined,
          };

          if (isEditMode.value) {
            // 编辑模式 - 调用更新API
            const updateData: UpdateFloorRequest = {
              ...floorData,
              id: editingFloorId.value || 0
            };
            const response = await updateFloor(updateData.id, updateData);
            if (response.code === 0) {
              ElMessage.success('楼层更新成功');
            } else {
              throw new Error(response.message || '更新失败');
            }
          } else {
            // 新增模式 - 调用创建API
            const response = await createFloor(floorData);
            if (response.code === 0) {
              ElMessage.success('楼层添加成功');
            } else {
              throw new Error(response.message || '添加失败');
            }
          }

          addFloorDialogVisible.value = false;
          await fetchFloors();
          await fetchDashboardData();
        } catch (error: any) {
          console.error(isEditMode.value ? '更新楼层失败' : '添加楼层失败', error);
          ElMessage.error(error.message || (isEditMode.value ? '楼层更新失败' : '楼层添加失败'));
        } finally {
          submitting.value = false;
        }
      } else {
        ElMessage.error('请填写完整的楼层信息');
      }
    });
  }
};

const handleEditFloor = (row: FloorItem) => {
  isEditMode.value = true;
  editingFloorId.value = row.floor; // 使用楼层号作为ID

  Object.assign(addFloorForm, {
    floor: row.floor,
    gender: row.gender,
    status: row.status,
    description: row.description || '',
  });

  addFloorDialogVisible.value = true;
};

const handleToggleStatus = (row: FloorItem) => {
  ElMessageBox.confirm(
    `确定要${row.status === 1 ? '关闭' : '启用'}第${row.floor}楼吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const newStatus = row.status === 1 ? 0 : 1;
      const response = await toggleFloorStatus(row.floor, newStatus); // 使用楼层号作为ID
      
      if (response.code === 0) {
        // 更新本地数据
        row.status = newStatus;
        ElMessage.success(`${row.status === 1 ? '启用' : '关闭'}成功`);
        
        // 刷新统计数据
        await fetchDashboardData();
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (error: any) {
      console.error('切换楼层状态失败:', error);
      ElMessage.error(error.message || '操作失败');
    }
  }).catch(() => {
    ElMessage.info('操作已取消');
  });
};

const viewFloorDetails = (row: FloorItem) => {
  ElMessage.info(`正在查看第${row.floor}楼的房间详情`);
  // 这里可以导航到房间列表页面或打开房间详情弹窗
};

const viewFloorOccupancy = (row: FloorItem) => {
  ElMessage.info(`正在查看第${row.floor}楼占用情况`);
  // 这里可以打开占用详情弹窗
};

const tableRowClassName = ({ row }: any) => {
  return 'floor-table-row';
};

// 初始化加载数据
onMounted(async () => {
  await fetchDashboardData();
  await fetchFloors();
});
</script>

<style scoped>
.floor-management-container {
  background-color: #f9f7f0;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Inter', system-ui, sans-serif;
}

/* 页面标题区 */
.page-header {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title-section h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.title-section p {
  font-size: 14px;
  color: #666;
  margin: 5px 0 0 0;
}

.action-buttons .el-button {
  margin-left: 10px;
}

/* 统计卡片区 */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-content {
  flex: 1;
}

.stat-title {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 8px 0;
}

.stat-footer {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-footer.success {
  color: #6B8E7F;
}

.stat-footer.neutral {
  color: #666;
}

.stat-footer.warning {
  color: #D9A566;
}

.stat-footer.danger {
  color: #B94E48;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.floors {
  background-color: rgba(74, 111, 165, 0.1);
  color: #4A6FA5;
}

.stat-icon.male {
  background-color: rgba(212, 181, 158, 0.1);
  color: #D4B59E;
}

.stat-icon.female {
  background-color: rgba(217, 165, 102, 0.1);
  color: #D9A566;
}

.stat-icon.available {
  background-color: rgba(185, 78, 72, 0.1);
  color: #B94E48;
}

/* 楼层列表区 */
.floor-list-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 筛选头部 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.search-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* 表格样式 */
.floor-number {
  font-weight: bold;
  color: #4A6FA5;
}

.room-count, .available-count, .bed-count {
  font-weight: 500;
  color: #333;
}

.available-count {
  color: #6B8E7F;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background-color: #F9F7F0;
  font-weight: normal;
  color: #5D4037;
}

:deep(.el-table .floor-table-row:hover) {
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .floor-management-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .dashboard-cards {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-controls {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .list-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>