<template>
  <div class="filter-section">
    <el-input
      v-model="keywordModel"
      :placeholder="searchPlaceholder"
      :prefix-icon="Search"
      clearable
      style="width: 320px"
    />

    <el-select
      v-model="roomTypeModel"
      placeholder="所有房间类型"
      style="width: 160px"
      clearable
    >
      <el-option
        v-for="item in roomOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <el-select
      v-model="statusModel"
      placeholder="所有状态"
      style="width: 140px"
      clearable
      @change="emit('filter')"
    >
      <el-option
        v-for="item in statusOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <el-button type="primary" @click="emit('filter')">
      筛选
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Filter, Search } from '@element-plus/icons-vue'

interface SelectOption {
  label: string
  value: string
}

const props = defineProps<{
  keyword: string
  roomType: string
  status: string
  searchPlaceholder: string
  roomOptions: SelectOption[]
  statusOptions: SelectOption[]
}>()

const emit = defineEmits<{
  (e: 'update:keyword', value: string): void
  (e: 'update:roomType', value: string): void
  (e: 'update:status', value: string): void
  (e: 'search'): void
  (e: 'filter'): void
}>()

const keywordModel = computed({
  get: () => props.keyword,
  set: (value) => emit('update:keyword', value)
})

const roomTypeModel = computed({
  get: () => props.roomType,
  set: (value) => emit('update:roomType', value)
})

const statusModel = computed({
  get: () => props.status,
  set: (value) => emit('update:status', value)
})
</script>
<style scoped lang="scss">
.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
</style>