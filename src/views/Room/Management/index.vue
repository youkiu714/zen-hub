<template>
  <div class="room-management-container">
    <!-- 标题区 -->
    <PageHeader title="床位安排管理">
      <div class="action-buttons">
        <el-button type="primary" @click="refreshData" :loading="refreshing">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新数据
        </el-button>
      </div>
    </PageHeader>

    <!-- 统计卡片区 -->
    <div class="dashboard-cards">
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">总房间数</p>
          <h3 class="stat-value">{{ dashboardData?.totalRooms || 0 }}</h3>
          <p class="stat-footer success">
            <el-icon>
              <Check />
            </el-icon>
            全部可用
          </p>
        </div>
        <div class="stat-icon rooms">
          <el-icon>
            <House />
          </el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">总床位数</p>
          <h3 class="stat-value">{{ dashboardData?.totalBeds || 0 }}</h3>
          <p class="stat-footer neutral">
            男众:{{ dashboardData?.maleBeds || 0 }}, 女众:{{ dashboardData?.femaleBeds || 0 }}
          </p>
        </div>
        <div class="stat-icon beds">
          <el-icon>
            <House />
          </el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">已占用床位</p>
          <h3 class="stat-value">{{ dashboardData?.occupiedBeds || 0 }}</h3>
          <p class="stat-footer warning">
            <el-icon>
              <WarningFilled />
            </el-icon>
            占用率 {{ ((dashboardData?.occupancyRate || 0) * 100).toFixed(1) }}%
          </p>
        </div>
        <div class="stat-icon occupied">
          <el-icon>
            <User />
          </el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-title">待分床申请</p>
          <h3 class="stat-value">{{ dashboardData?.pendingAssignments || 0 }}</h3>
          <p class="stat-footer danger">
            <el-icon>
              <Clock />
            </el-icon>
            需要及时处理
          </p>
        </div>
        <div class="stat-icon pending">
          <el-icon>
            <Clock />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 房间区 -->
    <div class="room-section">
      <div class="filter-header">
        <div style="display: flex;justify-content: space-between;width: 100%;">
          <div>
            <h3>房间类型</h3>
          </div>
          <div style="display: flex;gap: 10px;">
            <span class="text-sm">筛选:</span>
            <el-select v-model="selectedFloor" placeholder="所有楼层" style="width: 120px;">
              <el-option label="所有楼层" value="" />
              <el-option
                v-for="floor in floorOptions"
                :key="floor"
                :label="'第' + floor + '层'"
                :value="floor"
              />
            </el-select>
            <el-select v-model="selectedGender" placeholder="所有性别" style="width: 120px;">
              <el-option label="所有性别" value="" />
              <el-option label="男众" value="1" />
              <el-option label="女众" value="2" />
            </el-select>
          </div>
        </div>
        <div class="filters">
          <div class="date-range-picker">
            <el-icon>
              <Calendar />
            </el-icon>
            <span class="date-label">开始日期:</span>
            <el-date-picker
              v-model="dateRange[0]"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择开始日期"
            />
            <span class="date-separator">至</span>
            <span class="date-label">结束日期:</span>
            <el-date-picker
              v-model="dateRange[1]"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择结束日期"
            />
            <el-button type="primary" @click="applyFilters">
              <el-icon>
                <Filter />
              </el-icon>
              筛选
            </el-button>
          </div>
        </div>
      </div>

      <!-- 男众房间 -->
      <div v-if="maleRooms.length > 0" class="gender-section">
        <h4 class="gender-title">
          <div class="gender-indicator male"></div>
          男众房间 ({{ getTotalRooms(maleRooms) }}个房间, 共{{ getTotalBeds(maleRooms) }}个床位)
        </h4>
        <div class="rooms-grid-1" style="grid-template-columns: repeat(1, 1fr);">
          <div
            v-for="floor in maleRooms"
            :key="floor.floor"
            class="floor-section"
          >
            <h5 class="floor-title">第{{ floor.floor }}层</h5>
            <div class="rooms-grid-3">
              <div
                v-for="room in floor.rooms"
                :key="room.roomId"
                class="room-card"
                @click="viewRoomDetails(room)"
              >
                <div class="room-header">
                  <h5 class="room-name">{{ room.roomNo }}室</h5>
                  <span class="room-type">{{ room.roomTypeName }}</span>
                </div>

                <!-- 房间汇总信息 -->
                <div class="room-summary">
                  <span class="occupancy-info">
                    已占用: {{ room.occupiedCount || 0 }}/{{ room.capacity || 0 }}
                  </span>
                  <span v-if="room.capacity">
                    剩余: {{ Math.max((room.capacity || 0) - (room.occupiedCount || 0), 0) }} 床
                  </span>

                  <el-button
                    v-if="room.beds && room.beds.length"
                    text
                    size="small"
                    class="toggle-beds-btn"
                    @click.stop="toggleRoomBeds(room)"
                  >
                    {{ isRoomExpanded(room) ? '收起床位' : '查看床位' }}
                  </el-button>
                </div>

                <!-- 床位区域：有床位且展开时才显示 -->
                <div
                  v-if="room.beds && room.beds.length && isRoomExpanded(room)"
                  class="beds-container"
                >
                  <div class="beds-grid">
                    <div
                      v-for="bed in room.beds"
                      :key="bed.bedId"
                      class="bed-item"
                      :class="getBedClass(bed)"
                      @click.stop="handleBedClick(bed, room)"
                    >
                      <div class="bed-number">
                        {{ bed.bedNo }}（{{ bed.bedTypeName }}）
                      </div>
                      <div class="bed-status">
                        <el-icon>
                          <User v-if="bed.occupied" />
                          <Lock v-else-if="bed.locked" />
                          <Brush v-else-if="bed.needsCleaning" />
                          <House v-else />
                        </el-icon>
                        {{ getBedStatusText(bed) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div> <!-- room-card -->
            </div>
          </div>
        </div>
      </div>

      <!-- 女众房间 -->
      <div v-if="femaleRooms.length > 0" class="gender-section">
        <h4 class="gender-title">
          <div class="gender-indicator female"></div>
          女众房间 ({{ getTotalRooms(femaleRooms) }}个房间, 共{{ getTotalBeds(femaleRooms) }}个床位)
        </h4>
        <div class="rooms-grid-1">
          <div
            v-for="floor in femaleRooms"
            :key="floor.floor"
            class="floor-section"
          >
            <h5 class="floor-title">第{{ floor.floor }}层</h5>
            <div class="rooms-grid-3">
              <div
                v-for="room in floor.rooms"
                :key="room.roomId"
                class="room-card"
              >
                <div class="room-header">
                  <h5 class="room-name">{{ room.roomNo }}室</h5>
                  <span class="room-type">{{ room.roomTypeName }}</span>
                </div>

                <!-- 房间汇总信息 -->
                <div class="room-summary">
                  <span class="occupancy-info">
                    已占用: {{ room.occupiedCount || 0 }}/{{ room.capacity || 0 }}
                  </span>
                  <span v-if="room.capacity">
                    剩余: {{ Math.max((room.capacity || 0) - (room.occupiedCount || 0), 0) }} 床
                  </span>

                  <div class="room-summary-actions">
                    <el-button
                      v-if="room.beds && room.beds.length"
                      text
                      size="small"
                      class="toggle-beds-btn"
                      @click.stop="toggleRoomBeds(room)"
                    >
                      {{ isRoomExpanded(room) ? '收起床位' : '查看床位' }}
                    </el-button>
                    <!-- <el-button
                      text
                      size="small"
                      class="details-link-btn"
                      @click.stop="viewRoomDetails(room)"
                    >
                      详情
                    </el-button> -->
                  </div>
                </div>

                <!-- 床位区域：有床位且展开时才显示 -->
                <div
                  v-if="room.beds && room.beds.length && isRoomExpanded(room)"
                  class="beds-container"
                >
                  <div class="beds-grid">
                    <div
                      v-for="bed in room.beds"
                      :key="bed.bedId"
                      class="bed-item"
                      :class="getBedClass(bed)"
                      @click.stop="handleBedClick(bed, room)"
                    >
                      <div class="bed-number">
                        {{ bed.bedNo }}（{{ bed.bedTypeName }}）
                      </div>
                      <div class="bed-status">
                        <el-icon>
                          <User v-if="bed.occupied" />
                          <Lock v-else-if="bed.locked" />
                          <Brush v-else-if="bed.needsCleaning" />
                          <House v-else />
                        </el-icon>
                        {{ getBedStatusText(bed) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div> <!-- room-card -->
            </div>
          </div>
        </div>
      </div>

      <!-- 显示更多按钮 -->
      <div class="load-more">
        <el-button type="primary" text @click="loadMoreRooms">
          <el-icon>
            <Plus />
          </el-icon>
          显示更多房间
        </el-button>
      </div>
    </div>

    <!-- 床位分配弹窗 -->
    <el-dialog
      v-model="bedAllocationVisible"
      title="分配床位"
      width="600px"
      @close="resetAllocationForm"
    >
      <template #header>
        <div class="flex items-center">
          <h3>分配床位 - {{ currentBed?.bedNo }}</h3>
        </div>
      </template>

      <div class="allocation-form">
        <div class="form-section">
          <label class="form-label">待分配人员列表</label>
          <div class="person-list">
            <div
              v-for="person in pendingPersons"
              :key="person.id"
              class="person-item"
              :class="{ selected: selectedPerson?.id === person.id }"
              @click="selectPerson(person)"
            >
              <div class="person-avatar">
                <el-icon>
                  <User />
                </el-icon>
              </div>
              <div class="person-info">
                <div class="person-name">{{ person.name }}</div>
                <div class="person-details">
                  挂单号: {{ person.orderNo }} |
                  {{ person.gender === 1 ? '男' : '女' }} |
                  预计入住{{ person.stayDays }}天
                </div>
              </div>
              <div class="select-indicator">
                <el-icon v-if="selectedPerson?.id === person.id">
                  <Check />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <el-form :model="allocationForm" label-width="100px">
          <el-form-item label="挂单人员">
            <el-select
              v-model="allocationForm.personId"
              placeholder="选择挂单人员"
              style="width: 100%"
            >
              <el-option
                v-for="person in pendingPersons"
                :key="person.id"
                :label="`${person.name} - 挂单号: ${person.orderNo}`"
                :value="person.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="入住日期">
            <el-date-picker
              v-model="allocationForm.checkinDate"
              type="date"
              placeholder="选择入住日期"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="预计离店日期">
            <el-date-picker
              v-model="allocationForm.checkoutDate"
              type="date"
              placeholder="选择离店日期"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="备注信息">
            <el-input
              v-model="allocationForm.notes"
              type="textarea"
              placeholder="请输入备注信息"
              :rows="3"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bedAllocationVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAllocation" :loading="allocating">
            确认分配
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 床位详情弹窗 -->
    <el-dialog v-model="bedDetailsVisible" title="床位详细信息" width="500px">
      <div v-if="currentBed" class="bed-details">
        <div class="detail-row">
          <span class="detail-label">床位编号:</span>
          <span class="detail-value">{{ currentBed.bedNo }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">床位状态:</span>
          <el-tag :type="getBedStatusType(currentBed)" size="small">
            {{ getBedStatusText(currentBed) }}
          </el-tag>
        </div>
        <div v-if="currentBed.occupied && currentBed.occupant" class="occupant-info">
          <h4>入住人员信息</h4>
          <div class="detail-row">
            <span class="detail-label">姓名:</span>
            <span class="detail-value">{{ currentBed.occupant.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">挂单号:</span>
            <span class="detail-value">{{ currentBed.occupant.orderNo }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">性别:</span>
            <span class="detail-value">
              {{ currentBed.occupant.gender === 1 ? '男' : '女' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">入住日期:</span>
            <span class="detail-value">{{ currentBed.occupant.checkinDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">预计离店:</span>
            <span class="detail-value">{{ currentBed.occupant.checkoutDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">联系方式:</span>
            <span class="detail-value">{{ currentBed.occupant.phone }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bedDetailsVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Refresh,
  Download,
  Filter,
  Male,
  Female,
  Plus,
  Check,
  WarningFilled,
  House,
  User,
  Clock,
  Lock,
  Brush,
  Calendar,
} from '@element-plus/icons-vue';
import type {
  DashboardOverviewVO,
  RoomStatusDashboardVO,
  RoomWithBedsVO,
  BedStatusVO,
} from '@/types/room-bed-management';
import { getRoomOverview, getRoomStatus } from '@/api/room';
import PageHeader from '@/components/PageHeader.vue';

// 数据响应式变量
const dashboardData = ref<DashboardOverviewVO>({
  totalRooms: 0,
  totalBeds: 0,
  maleBeds: 0,
  femaleBeds: 0,
  occupiedBeds: 0,
  occupancyRate: 0,
  pendingAssignments: 0,
});
const roomStatusData = ref<RoomStatusDashboardVO>({
  male: { floors: [] },
  female: { floors: [] },
});
const selectedFloor = ref<string>('');
const selectedGender = ref<string>('');
const dateRange = ref<[string, string]>(['', '']);
const currentPage = ref(1);
const pageSize = 5;

// 房间展开状态：记录哪些房间展开了床位
const expandedRooms = ref<Set<number | string>>(new Set());

// 床位分配相关状态
const bedAllocationVisible = ref(false);
const bedDetailsVisible = ref(false);
const currentBed = ref<BedStatusVO | null>(null);
const currentRoom = ref<RoomWithBedsVO | null>(null);
const refreshing = ref(false);
const exporting = ref(false);
const allocating = ref(false);

// 床位分配表单
const allocationForm = ref({
  personId: '',
  checkinDate: '',
  checkoutDate: '',
  notes: '',
});

// 待分配人员列表（模拟数据）
const pendingPersons = ref([
  { id: 1, name: '张三', orderNo: 'GD2023041', gender: 1, stayDays: 3 },
  { id: 2, name: '李四', orderNo: 'GD2023042', gender: 1, stayDays: 5 },
  { id: 3, name: '王五', orderNo: 'GD2023043', gender: 2, stayDays: 7 },
  { id: 4, name: '赵六', orderNo: 'GD2023044', gender: 1, stayDays: 4 },
  { id: 5, name: '孙七', orderNo: 'GD2023045', gender: 2, stayDays: 6 },
]);

const selectedPerson = ref(pendingPersons.value[0] || null);

// 计算属性：获取楼层选项
const floorOptions = computed(() => {
  const floors = new Set<number>();
  if (roomStatusData.value?.male?.floors) {
    roomStatusData.value.male.floors.forEach((f) => floors.add(f.floor!));
  }
  if (roomStatusData.value?.female?.floors) {
    roomStatusData.value.female.floors.forEach((f) => floors.add(f.floor!));
  }
  return Array.from(floors).sort();
});

// 计算属性：过滤后的男众房间
const maleRooms = computed(() => {
  if (!roomStatusData.value?.male?.floors) return [];
  let filteredFloors = roomStatusData.value.male.floors;

  if (selectedFloor.value) {
    filteredFloors = filteredFloors.filter((f) => f.floor === Number(selectedFloor.value));
  }

  return filteredFloors;
});

// 计算属性：过滤后的女众房间
const femaleRooms = computed(() => {
  if (!roomStatusData.value?.female?.floors) return [];
  let filteredFloors = roomStatusData.value.female.floors;

  if (selectedFloor.value) {
    filteredFloors = filteredFloors.filter((f) => f.floor === Number(selectedFloor.value));
  }

  return filteredFloors;
});

// 工具方法
const getTotalRooms = (genderRooms: any[]) => {
  return genderRooms.reduce((sum, floor) => sum + (floor.rooms?.length || 0), 0);
};

const getTotalBeds = (genderRooms: any[]) => {
  return genderRooms.reduce(
    (sum, floor) =>
      sum +
      (floor.rooms?.reduce(
        (roomSum: number, room: any) => roomSum + (room.capacity || 0),
        0,
      ) || 0),
    0,
  );
};

const getBedClass = (bed: any) => {
  if (bed.occupied) return 'bed-occupied';
  if (bed.locked) return 'bed-locked';
  if (bed.needsCleaning) return 'bed-cleaning';
  return 'bed-available';
};

const getBedStatusText = (bed: any) => {
  if (bed.occupied) return '已占用';
  if (bed.locked) return '已锁定';
  if (bed.needsCleaning) return '待打扫';
  return '空闲';
};

const getBedStatusType = (bed: any) => {
  if (bed.occupied) return 'success';
  if (bed.locked) return 'warning';
  if (bed.needsCleaning) return 'danger';
  return 'info';
};

// 房间展开控制
const isRoomExpanded = (room: RoomWithBedsVO) => {
  return expandedRooms.value.has(room.roomId as any);
};

const toggleRoomBeds = (room: RoomWithBedsVO) => {
  const set = new Set(expandedRooms.value);
  const key = room.roomId as any;
  if (set.has(key)) {
    set.delete(key);
  } else {
    set.add(key);
  }
  expandedRooms.value = set;
};

// 床位分配相关方法
const handleBedClick = (bed: BedStatusVO, room: RoomWithBedsVO) => {
  currentBed.value = bed;
  currentRoom.value = room;

  if (bed.occupied) {
    showBedDetails(bed);
  } else {
    showAllocationDialog(bed);
  }
};

const showBedDetails = (bed: BedStatusVO) => {
  // 模拟床位详情数据
  currentBed.value = {
    ...bed,
    occupant: {
      name: '张三',
      orderNo: 'GD2023001',
      gender: 1,
      checkinDate: '2023-10-01',
      checkoutDate: '2023-10-10',
      phone: '138****5678',
    },
  };
  bedDetailsVisible.value = true;
};

const showAllocationDialog = (bed: BedStatusVO) => {
  currentBed.value = bed;
  bedAllocationVisible.value = true;
};

const selectPerson = (person: any) => {
  selectedPerson.value = person;
  allocationForm.value.personId = person.id;
};

const resetAllocationForm = () => {
  allocationForm.value = {
    personId: '',
    checkinDate: '',
    checkoutDate: '',
    notes: '',
  };
  selectedPerson.value = pendingPersons.value[0] || null;
};

const confirmAllocation = async () => {
  if (!allocationForm.value.personId || !allocationForm.value.checkinDate || !allocationForm.value.checkoutDate) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  allocating.value = true;

  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 更新床位状态
    if (currentBed.value && currentRoom.value) {
      const bedIndex = currentRoom.value.beds?.findIndex(
        (b) => b.bedId === currentBed.value!.bedId,
      );
      if (bedIndex !== undefined && bedIndex !== -1 && currentRoom.value.beds) {
        currentRoom.value.beds[bedIndex].occupied = true;
      }

      // 更新房间占用数量
      if (currentRoom.value.occupiedCount !== undefined) {
        currentRoom.value.occupiedCount++;
      }
    }

    ElMessage.success('床位分配成功');
    bedAllocationVisible.value = false;
    resetAllocationForm();

    // 刷新数据
    await loadRoomStatusData();
  } catch (error) {
    ElMessage.error('分配失败，请重试');
  } finally {
    allocating.value = false;
  }
};

// 加载统计概览数据
const loadDashboardData = async () => {
  const res = await getRoomOverview();
  dashboardData.value = res || {};
};

// 加载房间状态数据
const loadRoomStatusData = async () => {
  const params = {
    start: dateRange.value[0] || '',
    end: dateRange.value[1] || '',
    floor: selectedFloor.value ? Number(selectedFloor.value) : undefined,
    gender: selectedGender.value ? Number(selectedGender.value) : undefined,
  };
  const res = await getRoomStatus(params);
  roomStatusData.value = res || {};
};

// 刷新数据
const refreshData = async () => {
  refreshing.value = true;
  try {
    await loadDashboardData();
    await loadRoomStatusData();
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('刷新失败');
  } finally {
    refreshing.value = false;
  }
};

// 导出报表（保留，占位用）
const exportReport = async () => {
  exporting.value = true;
  try {
    // 模拟导出延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));
    ElMessage.success('报表导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// 应用筛选
const applyFilters = async () => {
  await loadRoomStatusData();
  ElMessage.success('筛选条件已应用');
};

// 查看房间详情
// const viewRoomDetails = (room: RoomWithBedsVO) => {
//   ElMessage.info(`正在查看房间 ${room.roomNo} 的详情`);
//   // 这里可以跳转到详情页或打开弹窗
// };

// 加载更多房间（模拟分页）
const loadMoreRooms = () => {
  currentPage.value++;
  ElMessage.info(`已加载第${currentPage.value}页数据`);
  // 实际项目中需要调用后端API获取下一页数据
};

// 初始化加载数据
onMounted(async () => {
  await loadDashboardData();
  await loadRoomStatusData();
});
</script>

<style scoped>
.room-management-container {
  background-color: #fdf6e3;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Inter', system-ui, sans-serif;
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
  color: #6b8e7f;
}

.stat-footer.neutral {
  color: #666;
}

.stat-footer.warning {
  color: #d9a566;
}

.stat-footer.danger {
  color: #b94e48;
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

.stat-icon.rooms {
  background-color: rgba(74, 111, 165, 0.1);
  color: #4a6fa5;
}

.stat-icon.beds {
  background-color: rgba(212, 181, 158, 0.1);
  color: #d4b59e;
}

.stat-icon.occupied {
  background-color: rgba(217, 165, 102, 0.1);
  color: #d9a566;
}

.stat-icon.pending {
  background-color: rgba(185, 78, 72, 0.1);
  color: #b94e48;
}

/* 房间区域 */
.room-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.filter-label {
  font-size: 14px;
  color: #666;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
}

.date-label {
  font-size: 14px;
  color: #666;
}

.date-separator {
  color: #999;
  font-size: 14px;
}

/* 性别分区 */
.gender-section {
  margin-bottom: 30px;
}

.gender-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.gender-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.gender-indicator.male {
  background-color: #4a6fa5;
}

.gender-indicator.female {
  background-color: #d4b59e;
}

.floor-section {
  margin-bottom: 20px;
}

.floor-title {
  font-size: 15px;
  font-weight: 500;
  color: #555;
  margin-bottom: 15px;
  padding-left: 20px;
}

/* 房间网格 */
.rooms-grid-1 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

.rooms-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.room-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.room-card:hover {
  border-color: #4a6fa5;
  box-shadow: 0 4px 20px rgba(74, 111, 165, 0.1);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.room-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.room-type {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: rgba(107, 142, 127, 0.1);
  color: #6b8e7f;
}

/* 房间汇总信息 */
.room-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  margin-bottom: 4px;
}

.room-summary-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-beds-btn,
.details-link-btn {
  padding: 0 4px;
  font-size: 12px;
}

/* 床位网格 */
.beds-container {
  margin-top: 6px;
}

.beds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
}

.bed-item {
  border: 1px solid #ddd;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  white-space: nowrap;
}

.bed-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bed-number {
  font-size: 11px;
  color: #555;
}

.bed-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

/* 床位状态样式 */
.bed-available {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #6b7280;
}

.bed-available:hover {
  background-color: #e5e7eb;
  border-color: #4a6fa5;
  box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.2);
}

.bed-occupied {
  background-color: rgba(107, 142, 127, 0.1);
  border-color: rgba(107, 142, 127, 0.3);
  color: #6b8e7f;
}

.bed-locked {
  background-color: rgba(217, 165, 102, 0.1);
  border-color: rgba(217, 165, 102, 0.3);
  color: #d9a566;
}

.bed-cleaning {
  background-color: rgba(185, 78, 72, 0.1);
  border-color: rgba(185, 78, 72, 0.3);
  color: #b94e48;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.occupancy-info {
  font-size: 12px;
  color: #666;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 20px;
}

/* 页脚 */
.footer {
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links .el-link {
  font-size: 12px;
}

/* 弹窗样式 */
.allocation-form {
  padding: 0;
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.person-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.person-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.person-item:last-child {
  border-bottom: none;
}

.person-item:hover {
  background-color: #f9fafb;
}

.person-item.selected {
  background-color: rgba(74, 111, 165, 0.05);
  border-color: #4a6fa5;
}

.person-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6b7280;
}

.person-info {
  flex: 1;
}

.person-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.person-details {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.select-indicator {
  color: #4a6fa5;
  font-size: 16px;
}

.bed-details {
  padding: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.occupant-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.occupant-info h4 {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .rooms-grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .room-management-container {
    padding: 10px;
  }

  .dashboard-cards {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-range-picker {
    flex-direction: column;
    align-items: flex-start;
  }

  .rooms-grid-3 {
    grid-template-columns: 1fr;
  }

  .beds-grid {
    grid-template-columns: 1fr;
  }

  .footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>
