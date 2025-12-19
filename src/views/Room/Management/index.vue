<template>
  <div class="room-management-container">
    <PageHeader title="床位安排管理" />
    <div class="room">
      <!-- 筛选区域 -->
      <div class="filter">
        <div class="filter-time">
          <el-date-picker
            v-model="time"
            type="daterange"
            range-separator="至"
            start-placeholder="入住时间"
            end-placeholder="退房时间"
            size="default"
          />
        </div>
        <el-select v-model="value1" style="width: 240px" clearable>
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
      <div class="room-data">
        <Bed class="bed" @add-member="addMember" />
        <Room :selectedMembers="selectedMembers" :roomStatusData="roomStatusData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DashboardOverviewVO, RoomStatusDashboardVO } from '@/types/room-bed-management'
import { getRoomOverview, getRoomStatus } from '@/api/room'
import PageHeader from '@/components/PageHeader.vue'
import Bed from './components/Bed.vue'
import Room from './components/Room.vue'

const time = ref('')
const value1 = ref<string>('全')
const genderOptions = [
  { label: 'all', value: '全' },
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

const selectedMembers = ref(0)

// 加载统计概览数据
const loadDashboardData = async () => {
  const res = await getRoomOverview()
  dashboardData.value = res || {}
}

// 加载房间状态数据
const loadRoomStatusData = async () => {
  const params = {
    start: dateRange.value[0] || '',
    end: dateRange.value[1] || '',
    floor: selectedFloor.value ? Number(selectedFloor.value) : undefined,
    gender: selectedGender.value ? Number(selectedGender.value) : undefined
  }
  const res = await getRoomStatus(params)
  roomStatusData.value = res || {}
}

const addMember = (value) => {
  console.log('value:', value)
  selectedMembers.value = value
}

// 初始化加载数据
onMounted(async () => {
  await loadDashboardData()
  await loadRoomStatusData()
})
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

.action-buttons .el-button {
  margin-left: 10px;
}
</style>
