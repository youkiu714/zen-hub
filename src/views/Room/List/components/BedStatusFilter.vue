<template>
  <div class="status-filter">
    <div>
      <el-button
        v-for="status in statusOptions"
        round
        :key="status.value"
        :type="status.type"
        :icon="status.icon"
        :plain="selectedStatus !== status.value"
        @click="handleStatusChange(status.value)"
        :class="{ active: selectedStatus === status.value }"
        class="status-btn"
        >{{ status.label }}</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits(['update:modelValue'])

const selectedStatus = ref(props.modelValue)

// 定义床位分配状态选项
const statusOptions = computed(() => [
  {
    value: 0, // 未分配床位
    label: '未分配床位',
    type: 'default',
    icon: 'Document'
  },
  {
    value: 1, // 已分配床位
    label: '已分配床位',
    type: 'default',
    icon: 'CircleCheck'
  }
])

const handleStatusChange = (value: number) => {
  selectedStatus.value = value
  console.log(value);
  emit('update:modelValue', value)
}
</script>

<style scoped>
.status-filter {
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