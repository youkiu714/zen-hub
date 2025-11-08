<template>
  <el-dialog
    v-model="visible"
    title=""
    width="1100px"
    :close-on-click-modal="false"
    class="history-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-info">
          <h3>挂单记录统计</h3>
          <p>{{ record?.name }}（{{ record?.gender === 'male' ? '男' : '女' }}）</p>
        </div>
      </div>
    </template>

    <div v-if="record" class="history-content">
      <!-- 统计信息 -->
      <div class="statistics-section">
        <div class="stat-card">
          <div class="stat-number">{{ statistics.totalCount }}</div>
          <div class="stat-label">总挂单次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.totalDays }}</div>
          <div class="stat-label">总挂单天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.currentYearCount }}</div>
          <div class="stat-label">本年度次数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ statistics.violationCount }}</div>
          <div class="stat-label">违规记录</div>
        </div>
      </div>

      <!-- 详细记录 -->
      <div class="records-section">
        <h4 class="section-title">详细记录</h4>
        <el-table
          :data="historyData"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#fafafa', color: '#606266' }"
        >
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="orderDate" label="挂单日期" width="130" />
          <el-table-column prop="leaveDate" label="离寺日期" width="130" />
          <el-table-column prop="duration" label="挂单时长" width="110" align="center">
            <template #default="{ row }">
              {{ row.duration }}天
            </template>
          </el-table-column>
          <el-table-column prop="roomNumber" label="房间号码" width="120" />
          <el-table-column prop="roomType" label="房间类型" width="120" />
          <el-table-column prop="bedNumber" label="床位号码" width="120" />
          <el-table-column prop="performance" label="挂单表现" width="130" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getPerformanceTag(row.performance)"
                size="small"
              >
                {{ row.performance }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getStatusTag(row.status)"
                size="small"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PendingOrderRecord, OrderHistory, OrderStatistics } from './types'

interface Props {
  modelValue: boolean
  record: PendingOrderRecord | null
  historyData: OrderHistory[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 计算统计数据
const statistics = computed<OrderStatistics>(() => {
  const currentYear = new Date().getFullYear()
  const currentYearRecords = props.historyData.filter(record =>
    new Date(record.orderDate).getFullYear() === currentYear
  )

  const violationRecords = props.historyData.filter(record =>
    record.status === 'violation'
  )

  const totalDays = props.historyData.reduce((sum, record) =>
    sum + (record.duration || 0), 0
  )

  return {
    totalCount: props.historyData.length,
    totalDays,
    currentYearCount: currentYearRecords.length,
    violationCount: violationRecords.length
  }
})

// 辅助方法
const getPerformanceTag = (performance: string) => {
  const tagMap: Record<string, string> = {
    '优秀': 'success',
    '良好': 'primary',
    '一般': 'warning',
    '较差': 'danger'
  }
  return tagMap[performance] || 'info'
}

const getStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    completed: 'success',
    cancelled: 'info',
    violation: 'danger'
  }
  return tagMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    completed: '已完成',
    cancelled: '已取消',
    violation: '违规'
  }
  return textMap[status] || '未知'
}
</script>

<style scoped lang="scss">
.history-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 0;
    background: #fafafa;
    border-bottom: 1px solid #e9ecef;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-header {
  padding: 20px 24px;

  .header-info {
    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #606266;
    }
  }
}

.history-content {
  padding: 24px;

  .statistics-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;

    .stat-card {
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: #409eff;
        margin-bottom: 8px;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        font-weight: 500;
      }
    }
  }

  .records-section {
    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      padding-bottom: 8px;
      border-bottom: 2px solid #e4e7ed;
    }

    .el-table {
      border-radius: 8px;
      overflow: hidden;

      :deep(.el-table__header) {
        th {
          background: #fafafa !important;
          color: #606266;
          font-weight: 500;
          border-bottom: 1px solid #ebeef5;
        }
      }

      :deep(.el-table__body) {
        tr {
          &:hover {
            background-color: #f5f7fa;
          }
        }

        td {
          border-bottom: 1px solid #ebeef5;
          padding: 12px 0;
        }
      }

      :deep(.el-table__cell) {
        padding: 12px;
      }

      .el-tag {
        border: none;
        border-radius: 4px;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .history-dialog {
    :deep(.el-dialog) {
      width: 900px !important;
    }
  }

  .history-content {
    .statistics-section {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .history-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 5vh auto;
    }
  }

  .history-content {
    padding: 16px;

    .statistics-section {
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 24px;

      .stat-card {
        padding: 16px;

        .stat-number {
          font-size: 28px;
        }
      }
    }

    .records-section {
      .section-title {
        font-size: 14px;
      }

      .el-table {
        :deep(.el-table__cell) {
          padding: 8px 6px;
        }
      }
    }
  }

  .dialog-header {
    padding: 16px 20px;

    .header-info {
      h3 {
        font-size: 16px;
      }

      p {
        font-size: 13px;
      }
    }
  }
}
</style>