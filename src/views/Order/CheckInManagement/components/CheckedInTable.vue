<template>
  <el-table :data="data" stripe :loading="loading">
    <el-table-column label="客人信息" min-width="200">
      <template #default="{ row }">
        <div class="guest-info">
          <el-avatar :size="40">
            {{ row.name?.charAt(0) }}
          </el-avatar>
          <div class="guest-details">
            <div class="guest-name">{{ row.name }}</div>
            <div class="guest-id">ID: {{ row.personId }}</div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="房间信息" min-width="120">
      <template #default="{ row }">
        <div class="room-info">
          <div class="room-number">{{ row.roomNo }}</div>
          <div class="bed-number">床位: {{ row.bedNo }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="入住信息" min-width="160">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ formatDateTime(row.checkinAt) }}</div>
          <div class="time">已住 {{ row.stayedDays }}天</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="预计退房" min-width="160">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ formatDateTime(row.expectedCheckoutAt) }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="住宿ID" min-width="100">
      <template #default="{ row }">
        <el-tag type="info" size="small">
          {{ row.bedStayId }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="180" align="right">
      <template #default="{ row }">
        <div class="action-buttons">
          <el-tooltip content="续单确认" placement="top">
            <el-button type="primary" size="small" circle @click="emit('renewal', row)">
              <el-icon>
                <Calendar />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="退单处理" placement="top">
            <el-button type="danger" size="small" circle @click="emit('checkout', row)">
              <el-icon>
                <Right />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="查看详情" placement="top">
            <el-button type="default" size="small" circle @click="emit('view-detail', row.applicationId)">
              <el-icon>
                <View />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="审核流程" placement="top">
            <el-button type="default" size="small" circle @click="emit('review', row.applicationId)">
              <el-icon>
                <Operation />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { Calendar, Operation, Right, View } from '@element-plus/icons-vue'
import type { InhouseItemVO } from '@/types/checkin'
import { formatDateTime } from '../utils'

defineProps<{
  data: InhouseItemVO[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'renewal', row: InhouseItemVO): void
  (e: 'checkout', row: InhouseItemVO): void
  (e: 'view-detail', applicationId?: number): void
  (e: 'review', applicationId?: number): void
}>()
</script>
