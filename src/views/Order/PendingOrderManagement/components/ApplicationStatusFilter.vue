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
import { ApplicationStatus, StatusTag } from '@/types/application'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits(['update:modelValue'])

const selectedStatus = ref(props.modelValue)

const statusOptions = computed<StatusTag[]>(() => [
  {
    value: ApplicationStatus.ALL,
    label: '全部状态',
    type: 'default',
    icon: 'Document'
  },
  {
    value: ApplicationStatus.APPLIED,
    label: '申请中',
    type: 'default',
    icon: 'Edit'
  },
  {
    value: ApplicationStatus.PENDING,
    label: '待入住',
    type: 'default',
    icon: 'CircleCheck'
  },
  {
    value: ApplicationStatus.CHECKED_IN,
    label: '入住中',
    type: 'default',
    icon: 'HomeFilled'
  },
  {
    value: ApplicationStatus.CHECKED_OUT,
    label: '已退住',
    type: 'default',
    icon: 'SwitchButton'
  },
  {
    value: ApplicationStatus.REJECTED,
    label: '未通过',
    type: 'default',
    icon: 'Close'
  }
])

const handleStatusChange = (value: number) => {
  selectedStatus.value = value
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
