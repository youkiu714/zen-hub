<template>
  <el-table :data="data" stripe :loading="loading">
    <el-table-column label="客人信息" min-width="200">
      <template #default="{ row }">
        <div class="guest-info">
          <el-avatar :src="row.guest.avatar" :size="40">
            {{ row.guest.name.charAt(0) }}
          </el-avatar>
          <div class="guest-details">
            <div class="guest-name">{{ row.guest.name }}</div>
            <div class="guest-id">ID: {{ row.order?.orderId }}</div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="房间信息" min-width="140">
      <template #default="{ row }">
        <div class="room-info">
          <div class="room-number">{{ row.room.roomType }} {{ row.room.roomNumber }}</div>
          <div class="room-capacity">{{ row.room.capacity }}位成人</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="入住日期" min-width="140">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ row.checkIn.checkInDate }}</div>
          <div class="time">{{ row.checkIn.checkInTime }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="退住日期" min-width="140">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ row.actualCheckOutDate }}</div>
          <div class="time">{{ row.actualCheckOutTime }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="住宿天数" min-width="100">
      <template #default="{ row }">
        <div class="days-info">
          <div class="days">{{ row.totalDays }}天</div>
          <div class="status">已完成</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="180" align="right">
      <template #default="{ row }">
        <div class="action-buttons">
          <el-tooltip content="发送遗漏物品通知" placement="top">
            <el-button type="primary" size="small" circle @click="emit('lost-notice', row)">
              <el-icon>
                <Message />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="表现评价" placement="top">
            <el-button type="warning" size="small" circle @click="emit('evaluate', row)">
              <el-icon>
                <Star />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="查看详情" placement="top">
            <el-button type="default" size="small" circle @click="emit('view-detail', row)">
              <el-icon>
                <View />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>

    <template #empty>
      <el-empty description="暂无申请数据" />
    </template>
  </el-table>
</template>

<script setup lang="ts">
import { Message, Star, View } from '@element-plus/icons-vue'
import type { CheckedOutRecord } from '@/types/checkin'

defineProps<{
  data: CheckedOutRecord[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'lost-notice', row: CheckedOutRecord): void
  (e: 'evaluate', row: CheckedOutRecord): void
  (e: 'view-detail', row: CheckedOutRecord): void
}>()
</script>
