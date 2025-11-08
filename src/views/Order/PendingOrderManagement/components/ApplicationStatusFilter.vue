<!-- components/ApplicationStatusFilter.vue -->
<template>
  <div class="status-filter">
    <el-button-group>
      <el-button
        v-for="status in statusOptions"
        :key="status.value"
        :type="status.type"
        :icon="status.icon"
        :plain="selectedStatus !== status.value"
        @click="handleStatusChange(status.value)"
      >
        {{ status.label }}
      </el-button>
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ApplicationStatus, StatusTag } from '@/types/application';

const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits(['update:modelValue']);

const selectedStatus = ref(props.modelValue);

const statusOptions = computed<StatusTag[]>(() => [
  {
    value: ApplicationStatus.ALL,
    label: '全部状态',
    type: 'primary',
    icon: 'Document',
  },
  {
    value: ApplicationStatus.APPLIED,
    label: '申请中',
    type: 'warning',
    icon: 'Edit',
  },
  {
    value: ApplicationStatus.PENDING,
    label: '待入住',
    type: 'info',
    icon: 'CircleCheck',
  },
  {
    value: ApplicationStatus.CHECKED_IN,
    label: '入住中',
    type: 'success',
    icon: 'HomeFilled',
  },
  {
    value: ApplicationStatus.CHECKED_OUT,
    label: '已退住',
    type: 'default',
    icon: 'SwitchButton',
  },
  {
    value: ApplicationStatus.REJECTED,
    label: '未通过',
    type: 'danger',
    icon: 'Close',
  },
]);

const handleStatusChange = (value: number) => {
  selectedStatus.value = value;
  emit('update:modelValue', value);
};
</script>

<style scoped>
.status-filter {
  margin-bottom: 20px;
}
</style>