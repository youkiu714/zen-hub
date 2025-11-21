<template>
  <el-dialog
    v-model="dialogVisible"
    title="分配床位"
    width="700px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 人员信息 -->
    <div class="person-info-section">
      <div class="info-header">
        <el-icon class="info-icon"><User /></el-icon>
        <span class="info-title">人员信息</span>
      </div>
      <div class="info-content">
        <div class="info-item">
          <span class="label">姓名：</span>
          <span class="value">{{ selectedPerson?.name || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">性别：</span>
          <span class="value">{{ getGenderText(selectedPerson?.gender) }}</span>
        </div>
        <div class="info-item">
          <span class="label">年龄：</span>
          <span class="value">{{ selectedPerson?.age || '-' }}岁</span>
        </div>
        <div class="info-item">
          <span class="label">身份证号：</span>
          <span class="value">{{ selectedPerson?.idCardMasked || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 分配区域 -->
    <div class="assignment-section">
      <div class="section-header">
        <el-icon class="section-icon"><House /></el-icon>
        <span class="section-title">床位选择</span>
      </div>

      <!-- 楼层选择 -->
      <div class="form-item">
        <label class="form-label">
          <el-icon><School /></el-icon>
          楼层选择
        </label>
        <el-select
          v-model="selectedFloor"
          placeholder="请选择楼层"
          @change="handleFloorChange"
          :loading="loadingFloors"
          style="width: 100%"
        >
          <el-option
            v-for="floor in floors"
            :key="floor"
            :label="`${floor}楼`"
            :value="floor"
          />
        </el-select>
      </div>

      <!-- 房间选择 -->
      <div class="form-item">
        <label class="form-label">
          <el-icon><House /></el-icon>
          房间选择
        </label>
        <el-select
          v-model="selectedRoom"
          placeholder="请选择房间"
          @change="handleRoomChange"
          :loading="loadingRooms"
          :disabled="!selectedFloor"
          style="width: 100%"
        >
          <el-option
            v-for="room in rooms"
            :key="room.roomId"
            :label="`${room.roomNo}房 (可用${room.capacity - room.occupiedCount}床)`"
            :value="room.roomId"
            :disabled="room.full"
          >
            <div class="room-option">
              <span class="room-no">{{ room.roomNo }}</span>
              <el-tag
                :type="room.full ? 'danger' : 'success'"
                size="small"
                effect="light"
              >
                {{ room.full ? '满员' : `${room.capacity - room.occupiedCount}/${room.capacity}` }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- 床位选择 -->
      <div class="form-item">
        <label class="form-label">
          <el-icon><Key /></el-icon>
          床位选择
        </label>
        <div v-loading="loadingBeds" class="beds-grid">
          <div
            v-for="bed in beds"
            :key="bed.id"
            class="bed-item"
            :class="{
              'bed-available': bed.status === 0,
              'bed-occupied': bed.status === 1,
              'bed-locked': bed.status === 2,
              'bed-cleaning': bed.status === 3,
              'bed-selected': selectedBed === bed.id
            }"
            @click="handleBedClick(bed)"
          >
            <div class="bed-number">{{ bed.bedNo }}</div>
            <div class="bed-type">{{ getBedTypeText(bed.bedType) }}</div>
            <div class="bed-status">
              <el-tag
                :type="getBedStatusType(bed.status)"
                size="small"
                effect="light"
              >
                {{ getBedStatusText(bed.status) }}
              </el-tag>
            </div>
          </div>
          <div v-if="beds.length === 0" class="no-beds">
            <el-empty description="暂无可用床位" :image-size="80" />
          </div>
        </div>
      </div>

      <!-- 时间设置 -->
      <div class="time-section">
        <div class="time-item">
          <label class="form-label">
            <el-icon><Clock /></el-icon>
            入住时间
          </label>
          <el-date-picker
            v-model="checkinTime"
            type="datetime"
            placeholder="选择入住时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </div>
        <div class="time-item">
          <label class="form-label">
            <el-icon><Clock /></el-icon>
            退住时间
          </label>
          <el-date-picker
            v-model="checkoutTime"
            type="datetime"
            placeholder="选择退住时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </div>
      </div>

      <!-- 备注 -->
      <div class="form-item">
        <label class="form-label">
          <el-icon><EditPen /></el-icon>
          备注
        </label>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
          maxlength="200"
          show-word-limit
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!selectedBed"
          @click="handleSubmit"
          :style="{ backgroundColor: '#8B5E3C', borderColor: '#8B5E3C' }"
        >
          确认分配
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, House, Grid,
  Clock, EditPen, School, Key
} from '@element-plus/icons-vue'
import {
  getFloors, getRoomsByFloor, getBedsByRoom, allocateBed
} from '@/api/assignment'
import type {
  AssignmentListItemVO,
  FloorRequest,
  RoomRequest,
  BedRequest,
  AllocateBedRequest,
  Bed
} from '@/types/assignment'
import { BED_STATUS_MAP, BED_TYPE_MAP, Gender, BedStatus, BedType } from '@/types/assignment'

// Props
interface Props {
  modelValue: boolean
  selectedPerson: AssignmentListItemVO | null
}

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const dialogVisible = ref(false)
const submitting = ref(false)
const loadingFloors = ref(false)
const loadingRooms = ref(false)
const loadingBeds = ref(false)

// 选择的数据
const selectedFloor = ref<number>()
const selectedRoom = ref<number>()
const selectedBed = ref<number>()

// 列表数据
const floors = ref<number[]>([])
const rooms = ref<any[]>([])
const beds = ref<Bed[]>([])

// 时间和备注
const checkinTime = ref('')
const checkoutTime = ref('')
const remark = ref('')

// 监听弹窗显示状态
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.selectedPerson) {
    initializeData()
  }
})

// 监听弹窗关闭
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 初始化数据
const initializeData = async () => {
  // 重置数据
  selectedFloor.value = undefined
  selectedRoom.value = undefined
  selectedBed.value = undefined
  rooms.value = []
  beds.value = []
  checkinTime.value = ''
  checkoutTime.value = ''
  remark.value = ''

  // 加载楼层列表
  await loadFloors()
}

// 加载楼层列表
const loadFloors = async () => {
  if (!props.selectedPerson) return

  loadingFloors.value = true
  try {
    const params: FloorRequest = {
      gender: props.selectedPerson.gender
    }
    const response = await getFloors(params)
    floors.value = response.data || response || []
  } catch (error) {
    console.error('获取楼层列表失败:', error)
    ElMessage.error('获取楼层列表失败')
  } finally {
    loadingFloors.value = false
  }
}

// 处理楼层变化
const handleFloorChange = async () => {
  selectedRoom.value = undefined
  selectedBed.value = undefined
  rooms.value = []
  beds.value = []

  if (!selectedFloor.value || !props.selectedPerson) return

  loadingRooms.value = true
  try {
    const params: RoomRequest = {
      floor: selectedFloor.value,
      gender: props.selectedPerson.gender
    }
    const response = await getRoomsByFloor(params)
    rooms.value = response.data || response || []
  } catch (error) {
    console.error('获取房间列表失败:', error)
    ElMessage.error('获取房间列表失败')
  } finally {
    loadingRooms.value = false
  }
}

// 处理房间变化
const handleRoomChange = async () => {
  selectedBed.value = undefined
  beds.value = []

  if (!selectedRoom.value) return

  loadingBeds.value = true
  try {
    const params: BedRequest = {
      roomId: selectedRoom.value
    }
    const response = await getBedsByRoom(params)
    console.log(response);
    console.log(response.data);
    
    beds.value = response.data || response || []
    console.log(beds.value);

  } catch (error) {
    console.error('获取床位列表失败:', error)
    ElMessage.error('获取床位列表失败')
  } finally {
    loadingBeds.value = false
  }
}

// 处理床位点击
const handleBedClick = (bed: Bed) => {
  if (bed.status !== 0) {
    ElMessage.warning('该床位不可用')
    return
  }
  selectedBed.value = bed.id
}

// 提交分配
const handleSubmit = async () => {
  if (!props.selectedPerson || !selectedBed.value) {
    ElMessage.warning('请选择床位')
    return
  }

  submitting.value = true
  // try {
    const params: AllocateBedRequest = {
      applicationId: props.selectedPerson.applicationId,
      bedId: selectedBed.value,
      checkinAt: checkinTime.value,
      checkoutAt: checkoutTime.value,
      remark: remark.value,
      type: 1 // 1=新住
    }

    const response = await allocateBed(params)
  //   console.log(response);
    // ElMessage.success('床位分配成功')
    emit('success')
    handleClose()

  //   if (response.code === 0) {
  //     ElMessage.success('床位分配成功')
  //     emit('success')
  //     handleClose()
  //   } else {
  //     ElMessage.error(response.message || '分配失败')
  //   }
  // } catch (error) {
  //   console.error('分配床位失败:', error)
  //   ElMessage.error('分配床位失败，请重试')
  // } finally {
  //   submitting.value = false
  // }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 工具函数
const getGenderText = (gender?: number) => {
  if (gender === Gender.MALE) return '男'
  if (gender === Gender.FEMALE) return '女'
  return '-'
}

const getBedTypeText = (bedType?: number) => {
  return BED_TYPE_MAP[bedType as BedType]?.label || '-'
}

const getBedStatusText = (status?: number) => {
  return BED_STATUS_MAP[status as BedStatus]?.label || '-'
}

const getBedStatusType = (status?: number) => {
  if (status === undefined) return 'info'

  // Map bed status to appropriate Element-Plus tag types
  switch (status) {
    case BedStatus.AVAILABLE:  // 空闲 - #67C23A (green)
      return 'success'
    case BedStatus.OCCUPIED:   // 占用 - #F56C6C (red)
      return 'danger'
    case BedStatus.LOCKED:     // 锁定 - #E6A23C (orange)
      return 'warning'
    case BedStatus.CLEANING:   // 待打扫 - #909399 (gray)
      return 'info'
    default:
      return 'info'
  }
}
</script>

<style scoped lang="scss">
.person-info-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;

  .info-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .info-icon {
      color: #8B5E3C;
      margin-right: 8px;
      font-size: 18px;
    }

    .info-title {
      font-weight: 600;
      color: #333;
      font-size: 16px;
    }
  }

  .info-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .info-item {
      display: flex;
      align-items: center;

      .label {
        color: #666;
        font-weight: 500;
        margin-right: 8px;
        min-width: 70px;
      }

      .value {
        color: #333;
        font-weight: 400;
      }
    }
  }
}

.assignment-section {
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .section-icon {
      color: #8B5E3C;
      margin-right: 8px;
      font-size: 18px;
    }

    .section-title {
      font-weight: 600;
      color: #333;
      font-size: 16px;
    }
  }

  .form-item {
    margin-bottom: 20px;

    .form-label {
      display: flex;
      align-items: center;
      color: #333;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 14px;

      .el-icon {
        margin-right: 6px;
        color: #8B5E3C;
      }
    }
  }

  .room-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .room-no {
      font-weight: 500;
    }
  }

  .beds-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    min-height: 100px;

    .bed-item {
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fff;

      &:hover {
        border-color: #8B5E3C;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 94, 60, 0.15);
      }

      &.bed-available {
        border-color: #67c23a;

        &:hover {
          background-color: #f0f9ff;
        }
      }

      &.bed-occupied {
        border-color: #f56c6c;
        cursor: not-allowed;
        opacity: 0.6;
      }

      &.bed-locked {
        border-color: #e6a23c;
        cursor: not-allowed;
        opacity: 0.6;
      }

      &.bed-cleaning {
        border-color: #909399;
        cursor: not-allowed;
        opacity: 0.6;
      }

      &.bed-selected {
        border-color: #8B5E3C;
        background-color: #f6f0ea;
        box-shadow: 0 4px 12px rgba(139, 94, 60, 0.25);
      }

      .bed-number {
        font-weight: 600;
        color: #333;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .bed-type {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .bed-status {
        .el-tag {
          font-size: 10px;
        }
      }
    }

    .no-beds {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
  }

  .time-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;

    .time-item {
      .form-label {
        margin-bottom: 8px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    border-radius: 6px;
    font-weight: 500;
    padding: 10px 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .person-info-section .info-content {
    grid-template-columns: 1fr;
  }

  .time-section {
    grid-template-columns: 1fr;
  }

  .beds-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>