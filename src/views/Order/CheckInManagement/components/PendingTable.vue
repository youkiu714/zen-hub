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
            <div class="guest-id">身份证号: {{ row.idCardMasked }}</div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="申请类型" min-width="120">
      <template #default="{ row }">
        <el-tag :type="getOrderTypeTagType(row.applicationTypeName)" size="small">
          {{ row.applicationTypeName }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="预计入住日期" min-width="140">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ row.expectedCheckinDate }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="挂单天数" min-width="100">
      <template #default="{ row }">
        <div class="days-info">
          <div class="days">{{ row.days }}天</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="状态" min-width="100">
      <template #default="{ row }">
        <el-tag type="warning" size="small">
          {{ row.statusDesc }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="200" align="right">
      <template #default="{ row }">
        <div class="action-buttons">
          <el-tooltip content="入住登记" placement="top">
            <el-button type="primary" size="small" circle @click="emit('check-in', row)">
              <el-icon>
                <Right />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="分床" placement="top">
            <el-button type="info" size="small" circle @click="emit('assign-bed', row)">
              <el-icon>
                <Grid />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="床位确认" placement="top">
            <el-button type="warning" size="small" circle @click="emit('confirm-bed', row)">
              <el-icon>
                <Check />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="查看详情" placement="top">
            <el-button
              type="default"
              size="small"
              circle
              @click="emit('view-application', row.applicationId)"
            >
              <el-icon>
                <View />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>

    <template >
      <el-empty description="暂无申请数据" />
    </template>
  </el-table>
</template>

<script setup lang="ts">
import { Check, Grid, Right, View } from '@element-plus/icons-vue'
import type { PendingCheckinItemVO } from '@/types/checkin'
import { getOrderTypeTagType } from '../utils'

defineProps<{
  data: PendingCheckinItemVO[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'check-in', row: PendingCheckinItemVO): void
  (e: 'assign-bed', row: PendingCheckinItemVO): void
  (e: 'confirm-bed', row: PendingCheckinItemVO): void
  (e: 'view-application', applicationId?: number): void
}>()
</script>
