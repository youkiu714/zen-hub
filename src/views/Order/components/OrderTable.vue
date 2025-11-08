<template>
  <div class="table-section">
    <el-table
      v-loading="loading"
      :data="data"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="applicant" label="申请人" width="150">
        <template #default="{ row }">
          <div class="applicant-cell">
            <el-avatar
              :size="32"
              :src="row.avatar"
              :alt="row.applicant"
              class="applicant-avatar"
            >
              {{ row.applicant.charAt(0) }}
            </el-avatar>
            <span class="applicant-name">{{ row.applicant }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="idCard" label="身份证号" width="180">
        <template #default="{ row }">
          <span class="id-card-text">{{ maskIdCard(row.idCard) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="applicationType" label="申请类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getApplicationTypeTag(row.applicationType) as any">
            {{ getApplicationTypeText(row.applicationType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="dateRange" label="申请起止日期" width="200">
        <template #default="{ row }">
          <span class="date-range-text">{{ formatDateRange(row.startDate, row.endDate) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="stayDays" label="挂单天数" width="100" align="center">
        <template #default="{ row }">
          <span class="stay-days-text">{{ row.stayDays }}天</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status) as any">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="$emit('view-detail', row)"
          >
            查看
          </el-button>
          <el-button
            v-if="actionButtonConfig(row.status).show"
            :type="actionButtonConfig(row.status).type"
            size="small"
            @click="handleAction(row)"
          >
            {{ actionButtonConfig(row.status).text }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderApplication, PaginationConfig } from '../types'
import { useOrderUtils } from '../composables/useOrderUtils'

interface Props {
  loading: boolean
  data: OrderApplication[]
  pagination: PaginationConfig
}

interface Emits {
  (e: 'view-detail', record: OrderApplication): void
  (e: 'review', record: OrderApplication): void
  (e: 'evaluate', record: OrderApplication): void
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getApplicationTypeTag,
  getApplicationTypeText,
  getStatusTag,
  getStatusText,
  getActionButtonConfig,
  maskIdCard,
  formatDateRange
} = useOrderUtils()

const handleAction = (record: OrderApplication) => {
  const config = getActionButtonConfig(record.status)
  if (config.action === 'review') {
    emit('review', record)
  } else if (config.action === 'evaluate') {
    emit('evaluate', record)
  }
}

const actionButtonConfig = (status: string) => {
  return getActionButtonConfig(status as OrderApplication['status'])
}
</script>

<style scoped lang="scss">
.table-section {
  margin-top: 20px;

  .applicant-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .applicant-avatar {
      flex-shrink: 0;
    }

    .applicant-name {
      font-size: 14px;
      color: #303133;
    }
  }

  .id-card-text {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #606266;
  }

  .date-range-text {
    font-size: 13px;
    color: #606266;
  }

  .stay-days-text {
    font-weight: 500;
    color: #409eff;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>