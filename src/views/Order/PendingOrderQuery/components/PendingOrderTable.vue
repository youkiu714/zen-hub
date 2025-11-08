<template>
  <div class="table-section">
    <el-card>
      <el-table
        v-loading="loading"
        :data="data"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />

        <el-table-column prop="name" label="姓名" width="120" />

        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === 'male' ? 'primary' : 'success'">
              {{ row.gender === 'male' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="idCard" label="身份证号码" width="180">
          <template #default="{ row }">
            <span class="masked-text">{{ maskIdCard(row.idCard) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="电话号码" width="140">
          <template #default="{ row }">
            <span class="masked-text">{{ maskPhone(row.phone) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="birthDate" label="出生日期" width="120" />

        <el-table-column prop="nation" label="民族" width="100" />

        <el-table-column
          prop="totalOrderCount"
          label="挂单总次数"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="warning">{{ row.totalOrderCount }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="$emit('view-detail', row)"
            >
              查看
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="$emit('view-history', row)"
            >
              历史记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { PendingOrderRecord } from './types'

interface Props {
  loading: boolean
  data: PendingOrderRecord[]
}

interface Emits {
  (e: 'view-detail', record: PendingOrderRecord): void
  (e: 'view-history', record: PendingOrderRecord): void
}

defineProps<Props>()
defineEmits<Emits>()

// 数据脱敏函数
const maskIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.substring(0, 4) + '********' + idCard.substring(idCard.length - 4)
}

const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
}
</script>

<style scoped lang="scss">
.table-section {
  background: white;
  border-radius: 8px;

  .masked-text {
    font-family: 'Courier New', monospace;
    color: #606266;
    font-weight: 500;
  }
}
</style>