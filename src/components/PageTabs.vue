<template>
  <div class="page-tabs-container">
    <div class="button-group">
      <el-button
        v-for="item in options"
        :key="item.value"
        round
        :icon="item.icon"
        :plain="modelValue !== item.value"
        @click="handleTabChange(item.value)"
        :class="{ active: modelValue === item.value }"
        class="tab-btn"
      >
        {{ item.label }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// 定义接口，增加 icon 可选字段
export interface TabOption {
  label: string
  value: string | number
  icon?: string | any // 支持字符串或组件对象
}

defineProps<{
  modelValue: string | number
  options: TabOption[]
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const handleTabChange = (value: string | number) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.page-tabs-container {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  /* 使用标准 CSS 模拟 Tailwind 的阴影效果，保证没有 Tailwind 也能显示 */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.button-group {
  display: flex;
  gap: 12px; /* 按钮之间的间距 */
  flex-wrap: wrap;
}

/* 选中状态：深棕色背景，白字 */
.active {
  background-color: rgb(139, 90, 43) !important;
  border-color: rgb(139, 90, 43) !important;
  color: #ffffff !important;
  font-weight: 600;
}

/* 未选中状态 hover 效果 */
.tab-btn:not(.active):hover {
  color: rgb(139, 90, 43);
  border-color: rgb(216, 176, 140);
  background-color: rgb(252, 249, 242);
}

/* 默认按钮样式微调 */
.tab-btn {
  border: 1px solid #dcdfe6; /* 默认边框 */
  transition: all 0.3s;
}
</style>