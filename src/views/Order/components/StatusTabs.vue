<template>
  <el-tabs :model-value="modelValue" @update:model-value="handleTabChange" @tab-change="handleTabChange">
    <el-tab-pane
      v-for="tab in tabs"
      :key="tab.name"
      :label="tab.label"
      :name="tab.name"
    >
      <template #label>
        <div class="tab-label">
          <span>{{ tab.label }}</span>
          <el-badge :value="tab.count" :hidden="tab.count === 0" class="tab-badge" />
        </div>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import type { TabConfig } from '../types'

interface Props {
  modelValue: string
  tabs: TabConfig[]
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'tab-change', tabName: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleTabChange = (tabName: string | number) => {
  const tabNameStr = String(tabName)
  emit('update:modelValue', tabNameStr)
  emit('tab-change', tabNameStr)
}
</script>

<style scoped lang="scss">
.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;

  .tab-badge {
    margin-left: 4px;
  }
}
</style>