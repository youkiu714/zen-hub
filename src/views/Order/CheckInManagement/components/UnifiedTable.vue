<template>
  <el-table :data="data" :loading="loading" size="large"
    :header-cell-style="{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f5f7fa' }" class="checkin-table">
    <!-- 客人信息列 - 所有状态都有 -->
    <el-table-column label="客人信息" min-width="200">
      <template #default="{ row }">
        <div class="guest-info">
          <el-avatar :src="getGuestAvatar(row)" :size="40">
            {{ getGuestName(row)?.charAt(0) }}
          </el-avatar>
          <div class="guest-details">
            <div class="guest-name">{{ getGuestName(row) }}</div>
            <div class="guest-id">{{ getGuestId(row) }}</div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="性别/年龄" min-width="100">
      <template #default="{ row }">
        <div>{{ row.gender === 1 ? '男' : '女' }} / {{ row.age }}岁</div>
      </template>
    </el-table-column>

    <!-- 申请类型列 - 仅待入住状态显示 -->
    <el-table-column v-if="status === 'pending'" label="申请类型" min-width="120">
      <template #default="{ row }">
        <el-tag :type="getOrderTypeTagType(row.applicationTypeName)" size="small">
          {{ row.applicationTypeName }}
        </el-tag>
      </template>
    </el-table-column>

    <!-- 房间信息列 - 已入住和已退房状态显示 -->
    <!-- todo：未入住的 会不会有入住信息呢？ 有可能未入住的还没有分床 -->
    <el-table-column v-if="status === 'checked-in'" label="房间信息" min-width="120">
      <template #default="{ row }">
        <div class="room-info">
          <div class="room-number">{{ row.roomNo }}</div>
          <div class="bed-number">床位: {{ row.bedNo }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column v-if="status === 'checked-out'" label="房间信息" min-width="140">
      <template #default="{ row }">
        <div class="room-info">
          <div class="room-number">{{ row.room.roomType }} {{ row.room.roomNumber }}</div>
          <div class="room-capacity">{{ row.room.capacity }}位成人</div>
        </div>
      </template>
    </el-table-column>

    <!-- 日期相关列 - 根据状态显示不同内容 -->
    <el-table-column v-if="status === 'pending'" label="预计入住日期" min-width="140">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ row.expectedCheckinDate }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column v-if="status === 'checked-in'" label="入住信息" min-width="160">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ formatDateTime(row.checkinAt) }}</div>
          <div class="time">已住 {{ row.stayedDays }}天</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column v-if="status === 'checked-out'" label="入住日期" min-width="140">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ row.checkIn.checkInDate }}</div>
          <div class="time">{{ row.checkIn.checkInTime }}</div>
        </div>
      </template>
    </el-table-column>

    <!-- 第二个日期列 -->
    <el-table-column v-if="status === 'checked-in'" label="预计退房" min-width="160">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ formatDateTime(row.expectedCheckoutAt) }}</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column v-if="status === 'checked-out'" label="退住日期" min-width="140">
      <template #default="{ row }">
        <div class="date-info">
          <div class="date">{{ row.actualCheckOutDate }}</div>
          <div class="time">{{ row.actualCheckOutTime }}</div>
        </div>
      </template>
    </el-table-column>

    <!-- 天数/状态相关列 -->
    <el-table-column v-if="status === 'pending'" label="挂单天数" min-width="100">
      <template #default="{ row }">
        <div class="days-info">
          <div class="days">{{ row.days }}天</div>
        </div>
      </template>
    </el-table-column>

    <el-table-column v-if="status === 'pending'" label="状态" min-width="100">
      <template #default="{ row }">
        <el-tag type="warning" size="small">
          {{ row.statusDesc }}
        </el-tag>
      </template>
    </el-table-column>

    <!-- <el-table-column v-if="status === 'checked-in'" label="住宿ID" min-width="100">
      <template #default="{ row }">
        <el-tag type="info" size="small">
          {{ row.bedStayId }}
        </el-tag>
      </template>
    </el-table-column> -->

    <el-table-column v-if="status === 'checked-out'" label="住宿天数" min-width="100">
      <template #default="{ row }">
        <div class="days-info">
          <div class="days">{{ row.totalDays }}天</div>
          <div class="status">已完成</div>
        </div>
      </template>
    </el-table-column>

    <!-- 操作列 - 根据状态显示不同按钮 -->
    <el-table-column label="操作" :width="getActionColumnWidth()" align="center">
      <template #default="{ row }">
        <div class="action-buttons">
          <!-- 待入住状态的操作按钮 -->
          <template v-if="status === 'pending'">
            <el-tooltip content="查看详情" placement="top">
              <el-button type="default" size="small" @click="emit('view-application', row.applicationId)">
                查看详情
              </el-button>
            </el-tooltip>
            <el-tooltip content="入住登记" placement="top">
              <el-button type="primary" size="small" @click="emit('check-in', row)">
                入住登记
              </el-button>
            </el-tooltip>
            <!-- <el-tooltip content="分床" placement="top">
              <el-button type="info" size="small" circle @click="emit('assign-bed', row)">
                <el-icon><Grid /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="床位确认" placement="top">
              <el-button type="warning" size="small" circle @click="emit('confirm-bed', row)">
                <el-icon><Check /></el-icon>
              </el-button>
            </el-tooltip> -->
          </template>

          <!-- 已入住状态的操作按钮 -->
          <template v-if="status === 'checked-in'">
            <el-tooltip content="查看详情" placement="top">
              <el-button type="default" size="small" @click="emit('view-detail', row.applicationId)">
                查看详情
              </el-button>
            </el-tooltip>
            <!-- 暂时隐藏退房操作 -->
            <!-- <el-tooltip content="退房处理" placement="top">
              <el-button type="danger" size="small" @click="emit('checkout', row)">
                退房
              </el-button>
            </el-tooltip> -->
            <!-- <el-tooltip content="续单确认" placement="top">
              <el-button type="primary" size="small" circle @click="emit('renewal', row)">
                <el-icon><Calendar /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="审核流程" placement="top">
              <el-button
                type="default"
                size="small"
                circle
                @click="emit('review', row.applicationId)"
              >
                <el-icon><Operation /></el-icon>
              </el-button>
            </el-tooltip> -->
          </template>

          <!-- 已退房状态的操作按钮 -->
          <template v-if="status === 'checked-out'">
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
          </template>
        </div>
      </template>
    </el-table-column>

    <template #empty>
      <el-empty description="暂无申请数据" />
    </template>
  </el-table>
</template>

<script setup lang="ts">
import {
  View,
  Message,
  Star
} from '@element-plus/icons-vue'
import type { PendingCheckinItemVO, InhouseItemVO, CheckedOutRecord } from '@/types/checkin'
import { getOrderTypeTagType, formatDateTime } from '../utils'

type TableStatus = 'pending' | 'checked-in' | 'checked-out'
type TableData = PendingCheckinItemVO | InhouseItemVO | CheckedOutRecord

const props = defineProps<{
  data: TableData[]
  loading: boolean
  status: TableStatus
}>()

const emit = defineEmits<{
  // 待入住状态事件
  (e: 'check-in', row: PendingCheckinItemVO): void
  (e: 'assign-bed', row: PendingCheckinItemVO): void
  (e: 'confirm-bed', row: PendingCheckinItemVO): void
  (e: 'view-application', applicationId?: number): void
  // 已入住状态事件
  (e: 'renewal', row: InhouseItemVO): void
  (e: 'checkout', row: InhouseItemVO): void
  (e: 'view-detail', applicationId?: number | CheckedOutRecord): void
  (e: 'review', applicationId?: number): void
  // 已退房状态事件
  (e: 'lost-notice', row: CheckedOutRecord): void
  (e: 'evaluate', row: CheckedOutRecord): void
}>()

// 获取客人姓名
const getGuestName = (row: TableData): string => {
  if ('name' in row) return row.name || ''
  if ('guest' in row) return row.guest?.name || ''
  return ''
}

// 获取客人ID信息
const getGuestId = (row: TableData): string => {
  if ('idCardMasked' in row) return `身份证号: ${row.idCardMasked || ''}`
  if ('personId' in row) return `ID: ${row.personId || ''}`
  if ('order' in row) return `ID: ${row.order?.orderId || ''}`
  return ''
}

// 获取客人头像
const getGuestAvatar = (row: TableData): string | undefined => {
  if ('guest' in row) return row.guest?.avatar
  return undefined
}

// 获取操作列宽度
const getActionColumnWidth = (): number => {
  switch (props?.status) {
    case 'pending':
      return 200
    case 'checked-in':
      return 180
    case 'checked-out':
      return 180
    default:
      return 180
  }
}
</script>

<style scoped lang="scss">
.checkin-table {
  max-height: calc(100vh - 360px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}

/* 隐藏表格的 Webkit 滚动条 */
.checkin-table::-webkit-scrollbar {
  display: none;
}
/* 固定表头 */
:deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.el-table__fixed-header-wrapper) {
  z-index: 11;
}

:deep(.el-table__fixed-right) {
  z-index: 12;
}

:deep(.el-table__fixed-left) {
  z-index: 12;
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.guest-details {
  flex: 1;
  min-width: 0;
}

.guest-name,
.room-info .room-number,
.date-info .date,
.days-info .days {
  font-weight: 500;
  color: #303133;
}

.guest-id,
.room-info .bed-number,
.room-info .room-capacity,
.date-info .time,
.days-info .status {
  font-size: 14px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center; // flex-end
}

.room-info,
.date-info,
.days-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
