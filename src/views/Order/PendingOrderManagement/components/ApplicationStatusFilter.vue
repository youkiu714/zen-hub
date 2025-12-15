<template>
  <div class="filter-card">
    <div class="filter-group">
      <button
        v-for="item in statusOptions"
        :key="item.value"
        @click="handleSelect(item.value)"
        class="custom-btn"
        :class="getBtnClass(item)"
      >
        <el-icon class="icon-margin" :size="14">
          <component :is="item.iconComponent" />
        </el-icon>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
// 引入 Element Plus 图标
import { 
  List, 
  Timer, 
  CircleCheck, 
  House, 
  Right, 
  CircleClose 
} from '@element-plus/icons-vue'
import { ApplicationStatus, StatusTag } from '@/types/application'

// Props & Emits
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue', 'change'])

// 类型定义
interface StatusOption {
  label: string
  value: number
  iconComponent: any // 存储图标组件
  cssClass: string   // 对应的颜色样式类
}

// 配置项：将原型的 FontAwesome 图标映射为 Element Plus 图标
const statusOptions: StatusOption[] = [
  {
    label: '全部状态',
    value: ApplicationStatus.DRAFT, // 对应 data-status="all"
    // 原型图标: fa-th-list -> Element: List
    iconComponent: markRaw(List), 
    cssClass: 'btn-gray'
  },
  {
    label: '申请中',
    value: ApplicationStatus.PENDING_REVIEW,
    // 原型图标: fa-hourglass-half -> Element: Timer (等待中)
    iconComponent: markRaw(Timer),
    cssClass: 'btn-yellow'
  },
  {
    label: '待入住',
    value: ApplicationStatus.WAITING_CHECKIN,
    // 原型图标: fa-check-circle -> Element: CircleCheck
    iconComponent: markRaw(CircleCheck),
    cssClass: 'btn-blue'
  },
  {
    label: '入住中',
    value: ApplicationStatus.CHECKED_IN,
    // 原型图标: fa-bed -> Element: House (代表住宿)
    iconComponent: markRaw(House),
    cssClass: 'btn-green'
  },
  {
    label: '已退住',
    value: ApplicationStatus.CHECKED_OUT,
    // 原型图标: fa-sign-out-alt -> Element: Right (向右/离开)
    iconComponent: markRaw(Right),
    cssClass: 'btn-gray-light'
  },
  {
    label: '未通过',
    value: ApplicationStatus.REJECTED,
    // 原型图标: fa-times-circle -> Element: CircleClose
    iconComponent: markRaw(CircleClose),
    cssClass: 'btn-red'
  },
  {
    label: '已取消',
    value: ApplicationStatus.CANCELED,
    // 原型图标: fa-times-circle -> Element: CircleClose
    iconComponent: markRaw(CircleClose),
    cssClass: 'btn-purple'
  }
]

// 样式计算逻辑
const getBtnClass = (item: StatusOption) => {
  if (props.modelValue === item.value) {
    return 'is-active'
  }
  return item.cssClass
}

// 切换处理
const handleSelect = (val: string) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style scoped>
/* --- 1. 容器样式 (保持原型风格) --- */
.filter-card {
  background-color: #ffffff;
  border-radius: 16px; /* rounded-2xl */
  padding: 16px;       /* p-4 */
  margin-bottom: 32px; /* mb-8 */
  /* 还原 shadow-elegant */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); 
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px; /* gap-2 */
}

/* 响应式间距 */
@media (min-width: 768px) {
  .filter-group {
    gap: 16px; /* md:gap-4 */
  }
}

/* --- 2. 按钮样式 (自定义以覆盖默认 Element 风格，确保还原度) --- */
.custom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 9999px; /* rounded-full */
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent; /* 预留边框，防抖动 */
  outline: none;
  transition: all 0.3s ease;
  line-height: 1.5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.icon-margin {
  margin-right: 6px;
  /* 垂直居中微调 */
  position: relative;
  top: -1px;
}

/* --- 3. 选中激活状态 --- */
.is-active {
  /* 原型 Primary 色 */
  background-color: #8B5A2B !important; 
  color: #ffffff !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

/* --- 4. 未选中状态的特定颜色 (严格对应原型 HTML) --- */

/* 全部 (灰色) */
.btn-gray {
  background-color: #f3f4f6;
  color: #374151;
}
.btn-gray:hover {
  background-color: #e5e7eb;
}

/* 申请中 (浅黄 #FBF9C9) */
.btn-yellow {
  background-color: #FBF9C9;
  color: #374151;
}
.btn-yellow:hover {
  background-color: #f0eea9;
}

/* 待入住 (浅蓝 #DFEAFC) */
.btn-blue {
  background-color: #DFEAFC;
  color: #374151;
}
.btn-blue:hover {
  background-color: #cddff8;
}

/* 入住中 (浅绿 #E4FBE9) */
.btn-green {
  background-color: #E4FBE9;
  color: #374151;
}
.btn-green:hover {
  background-color: #d0f5da;
}

/* 已退住 (浅灰) */
.btn-gray-light {
  background-color: #f3f4f6;
  color: #374151;
}
.btn-gray-light:hover {
  background-color: #e5e7eb;
}

/* 未通过 (浅红 #F7E3E3) */
.btn-red {
  background-color: #F7E3E3;
  color: #374151;
}
.btn-red:hover {
  background-color: #ebd0d0;
}

/* 未通过 (浅红 #F7E3E3) */
.btn-purple {
  background-color: #D8BFD8;
  color: #374151;
}
.btn-purple:hover {
  background-color: #C8A2C8;
}
</style>