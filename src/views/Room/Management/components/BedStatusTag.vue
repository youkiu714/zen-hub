<template>
  <div class="bed-status-tag" :class="statusClass">
    <el-icon v-if="status === 'occupied'" size="16"><User /></el-icon>
    <el-icon v-else-if="status === 'vacant'" size="16"><Grid /></el-icon>
    <el-icon v-else-if="status === 'locked'" size="16"><Lock /></el-icon>
    <el-icon v-else-if="status === 'cleaning'" size="16"><Brush /></el-icon>
    <span class="bed-no">{{ bedNo }}</span>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  User,
  Grid,
  Lock,
  Brush,
} from '@element-plus/icons-vue';

const props = defineProps<{
  bedNo: string;
  occupied: boolean;
  isLocked?: boolean;
  isCleaning?: boolean;
}>();

const status = computed(() => {
  if (props.isLocked) return 'locked';
  if (props.isCleaning) return 'cleaning';
  return props.occupied ? 'occupied' : 'vacant';
});

const statusClass = computed(() => {
  switch (status.value) {
    case 'occupied': return 'occupied';
    case 'vacant': return 'vacant';
    case 'locked': return 'locked';
    case 'cleaning': return 'cleaning';
    default: return '';
  }
});

const statusText = computed(() => {
  switch (status.value) {
    case 'occupied': return '已占用';
    case 'vacant': return '空闲';
    case 'locked': return '已锁定';
    case 'cleaning': return '待打扫';
    default: return '';
  }
});
</script>

<style scoped>
.bed-status-tag {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin: 4px;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bed-status-tag:hover {
  transform: scale(1.02);
}

.bed-status-tag .el-icon {
  margin-right: 4px;
}

.bed-status-tag .bed-no {
  font-weight: bold;
  margin-right: 4px;
}

.bed-status-tag .status-text {
  margin-left: 4px;
}

.bed-status-tag.occupied {
  background-color: #e1f8e1;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.bed-status-tag.vacant {
  background-color: #f2fafc;
  border: 1px solid #b3e5fc;
  color: #0288d1;
}

.bed-status-tag.locked {
  background-color: #fff3e0;
  border: 1px solid #ffe082;
  color: #ff8f00;
}

.bed-status-tag.cleaning {
  background-color: #fce4ec;
  border: 1px solid #f48fb1;
  color: #c2185b;
}
</style>