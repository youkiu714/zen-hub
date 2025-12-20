<template>
  <div class="room-management-container">
    <PageHeader title="床位安排管理" />
    <div class="room">
      <!-- 筛选区域 -->
      <div class="filter">
        <div class="filter-time">
          <el-date-picker
            v-model="roomInfo.time"
            type="daterange"
            range-separator="至"
            start-placeholder="入住时间"
            end-placeholder="退房时间"
            size="default"
          />
        </div>
        <el-select v-model="roomInfo.type" style="width: 240px" :clearable="false">
          <template #label="{ value }">
            <span>房间类型: </span>
            <span style="font-weight: bold">{{ value }}</span>
          </template>
          <el-option
            v-for="item in genderOptions"
            :key="item.value"
            :label="item.value"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="room-data" v-loading="sharedLoading">
        <div v-if="!isTimeSelected" class="empty-tip">请选择入住时间段</div>

        <div v-else-if="sharedError" class="error-tip">
          <div class="error-text">请求失败，请重试</div>
          <el-button type="primary" @click="reloadAll">重新请求数据</el-button>
        </div>

        <template v-else>
          <Bed ref="bedRef" class="bed" @add-member="addMember" :roomInfo="roomInfo" />
          <Room
            :selectedMembers="selectedMembers"
            :roomStatusData="roomStatusData"
            :rooms="rooms"
            @assignment-success="handleAssignmentSuccess"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import dayjs from 'dayjs'
import type { DashboardOverviewVO, RoomStatusDashboardVO } from '@/types/room-bed-management'
import { getRoomOverview, getRoomStatus } from '@/api/room'
import PageHeader from '@/components/PageHeader.vue'
import Bed from './components/Bed.vue'
import Room from './components/Room.vue'
import { getRoomsByFloor } from '@/api/assignment'

const roomInfo = ref({
    time: [dayjs().subtract(7, 'day').startOf('day').toDate(), dayjs().startOf('day').toDate()] as [
      Date,
      Date
    ],
    type: '全部类型'
})
const rooms = ref([])
const sharedLoading = ref(false)
const sharedError = ref<string | null>(null)

const genderOptions = [
  { label: 'all', value: '全部类型' },
  { label: 'M', value: '男众房' },
  { label: 'F', value: '女众房' }
]

// 数据响应式变量
const dashboardData = ref<DashboardOverviewVO>({
  totalRooms: 0,
  totalBeds: 0,
  maleBeds: 0,
  femaleBeds: 0,
  occupiedBeds: 0,
  occupancyRate: 0,
  pendingAssignments: 0
})
const roomStatusData = ref<RoomStatusDashboardVO>({
  male: { floors: [] },
  female: { floors: [] }
})
const selectedFloor = ref<string>('')
const selectedGender = ref<string>('')
const dateRange = ref<[string, string]>(['', ''])

const selectedMembers = ref<any[]>([])
const bedRef = ref<any>(null)

const isTimeSelected = computed(() => {
  const time = roomInfo.value.time
  return Array.isArray(time) && time.length === 2 && time[0] && time[1]
})

// 加载统计概览数据
const loadDashboardData = async () => {
  const res = await getRoomOverview()
  dashboardData.value = res || {}
}

watch(
  [() => roomInfo.value.type, () => roomInfo.value.time],
  async () => {
    if (!isTimeSelected.value) {
      rooms.value = []
      bedRef.value?.clearData?.()
      sharedError.value = null
      sharedLoading.value = false
      return
    }

    // 等待 Bed/Room 渲染完成，确保 bedRef 已就绪，避免初次进入触发两次请求
    await nextTick()
    await reloadAll()
  },
  {
    immediate: true,
    flush: 'post'
  }
)

const addMember = (value) => {
  console.log('value:', value)
  selectedMembers.value = Array.isArray(value) ? value : []
}

const handleAssignmentSuccess = async () => {
  await reloadAll()
  bedRef.value?.clearSelection?.()
  selectedMembers.value = []
}

async function reloadAll() {
    console.log("reloadAll")
  if (!isTimeSelected.value) return
  sharedLoading.value = true
  sharedError.value = null

  const [rawStart, rawEnd] = Array.isArray(roomInfo.value.time) ? roomInfo.value.time : []
  const start = rawStart && dayjs(rawStart).isValid() ? dayjs(rawStart).format('YYYY-MM-DD') : undefined
  const end = rawEnd && dayjs(rawEnd).isValid() ? dayjs(rawEnd).format('YYYY-MM-DD') : undefined

  try {
    const [_, roomRes] = await Promise.all([
      bedRef.value?.reloadUnassignedForRoomInfo?.(),
      getRoomsByFloor({
        gender:
          roomInfo.value.type === '全部类型'
            ? undefined
            : roomInfo.value.type === '男众房'
              ? '1'
              : '2',
        start,
        end
      })
    ])

    rooms.value = roomRes
  } catch (error) {
    console.log('reloadAll error:', error)
    sharedError.value = '请求失败'
    rooms.value = []
  } finally {
    sharedLoading.value = false
  }
}

</script>

<style scoped>
.room-management-container {
  background-color: #fdf6e3;
  padding: 20px;
  font-family: 'Inter', system-ui, sans-serif;
}
.room {
  display: flex;
  height: calc(100vh - 180px);
  background-color: #ffffff;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
}
.filter {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
}
.filter-time {
  margin-right: 8px;
}
.room-data {
  padding: 16px;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 16px;
}

.empty-tip,
.error-tip {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86868b;
  gap: 12px;
}

.error-text {
  color: #ff3b30;
}

.action-buttons .el-button {
  margin-left: 10px;
}
</style>
