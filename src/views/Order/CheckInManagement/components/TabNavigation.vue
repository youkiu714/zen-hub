<template>
  <div class="tab-navigation">
    <div>
      <el-button
        v-for="tab in tabs"
        round
        :key="tab.key"
        type="default"
        :plain="activeTab !== tab.key"
        @click="emit('change', tab.key)"
        :class="{ active: activeTab === tab.key }"
        class="status-btn"
      >
        {{ tab.label }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckinTab, CheckinTabKey } from '../utils'

defineProps<{
  tabs: (CheckinTab & { count?: number })[]
  activeTab: CheckinTabKey
}>()

const emit = defineEmits<{
  (e: 'change', key: CheckinTabKey): void
}>()
</script>

<style scoped>
.tab-navigation {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
.active {
  background-color: rgb(139 90 43 / var(--tw-bg-opacity, 1));
  color: #ffffff;
  border: none;
  font-weight: 600;
}
.status-btn {
  &:hover {
    color: rgb(221, 190, 125);
    border: 1px solid #d8b08c;
  }
}
</style>
