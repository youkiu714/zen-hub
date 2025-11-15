<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[5, 10, 20, 50]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="$emit('size-change', $event)"
      @current-change="$emit('current-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Pagination } from './types'

interface Props {
  pagination: Pagination
}

interface Emits {
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped lang="scss">
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>