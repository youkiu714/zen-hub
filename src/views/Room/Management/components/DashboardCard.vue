<template>
  <el-card class="dashboard-card">
    <div class="card-header">
      <span>{{ title }}</span>
      <el-icon :color="iconColor" :size="24">
        <component :is="iconComponent" />
      </el-icon>
    </div>
    <div class="card-value">{{ value }}</div>
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  House,
  Grid,
  User,
  Clock,
} from '@element-plus/icons-vue';

const props = defineProps<{
  title: string;
  value: string | number;
  icon: 'house' | 'bed' | 'user' | 'clock';
  footerText?: string;
  footerIcon?: 'check' | 'warning' | 'error';
  footerColor?: string;
}>();

const iconColor = computed(() => {
  switch (props.icon) {
    case 'house': return '#606266';
    case 'bed': return '#909399';
    case 'user': return '#E6A23C';
    case 'clock': return '#F56C6C';
    default: return '#606266';
  }
});

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'house': return House;
    case 'bed': return Grid;
    case 'user': return User;
    case 'clock': return Clock;
    default: return House;
  }
});
</script>

<style scoped>
.dashboard-card {
  width: 24%;
  margin-right: 1.5%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-footer {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.card-footer .el-icon {
  margin-right: 5px;
}

.card-footer.warning {
  color: #E6A23C;
}

.card-footer.error {
  color: #F56C6C;
}
</style>