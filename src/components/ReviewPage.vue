<template>
  <el-drawer 
    v-model="visible" 
    width="800px"
    close-on-click-modal
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">审核流程</span>
      </div>
    </template>
    <div class="review-content">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in timelineData"
          :key="index"
          :icon="item.icon"
          :type="item.type"
          :color="item.color"
          :size="item.size"
          :timestamp="item.timestamp"
          placement="top"
        >
            <div class="timeline-header">
              <h4>{{ item.title }}</h4>
            </div>
            <p class="timeline-description">{{ item.description }}</p>
            <div v-if="item.comment" class="timeline-comment">
              <span class="comment-text">{{ item.comment }}</span>
            </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, Clock, ChatDotRound, MoreFilled, Select } from '@element-plus/icons-vue'
import { getApplicationById } from '@/api/application'

const props = defineProps<{
  modelValue: boolean
  applicationId: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const visible = ref(false)
const detail = ref<any>(null)
const timelineData = ref<any[]>([])

// 获取审核流程数据
const getApplicationItem = async (applicationId: number) => {
  const data = await getApplicationById(applicationId)
  detail.value = data
  
  // 处理时间线数据
  if (data && data.timeline) {
    // 将接口返回的timeline数据转换为组件需要的格式
    const processedTimeline = data.timeline.map((item: any, index: number) => {
      // 反转后，最后一个元素（原数组的第一个）是最新的
      const isLatest = index === data.timeline.length - 1
      return {
        title: item.title,
        timestamp: item.time,
        description: "",
        comment: item.content,
        icon: getStageIcon(isLatest),
        type: getStageType(item.stage, item.result, isLatest),
        color: getStageColor(item.stage, item.result, isLatest),
        size: 'large',
        status: getStageStatus(item.stage, item.result),
        statusClass: getStageStatusClass(item.stage, item.result)
      }
    })
    
    timelineData.value = processedTimeline.reverse()
  }
}

const getStageIcon = (isLatest: boolean = false) => {
  if (isLatest) return MoreFilled
  return Select
}


// 根据stage和result获取类型
const getStageType = (stage: number, result: number, isLatest: boolean = false) => {
  if (isLatest) return 'primary'
  if (result === 1) return 'success'
  if (result === 0) return 'danger'
  return 'info'
}

// 根据stage和result获取颜色
const getStageColor = (stage: number, result: number, isLatest: boolean = false) => {
  if (isLatest) return '#409EFF'
  return '#0bbd87'
}

// 根据stage和result获取状态
const getStageStatus = (stage: number, result: number) => {
  if (result === 1) return '已完成'
  if (result === 0) return '未通过'
  return '当前状态'
}

// 根据stage和result获取状态样式类
const getStageStatusClass = (stage: number, result: number) => {
  if (result === 1) return 'status-success'
  if (result === 0) return 'status-error'
  return 'status-current'
}

watch(
  () => [props.modelValue, props.applicationId] as const,
  async ([modelValue, newId]) => {
    visible.value = modelValue
    if (modelValue && newId && newId > 0) {
      await getApplicationItem(newId)
    }
  },
  { immediate: true }
)

const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: #8b6546;
}

.review-content {
//   padding: 20px;
}

.review-header {
  margin-bottom: 30px;
  
  h3 {
    font-size: 20px;
    color: #303133;
    margin: 0 0 8px 0;
  }
  
  .application-info {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }
}

.timeline-card {
  margin-bottom: 0;
  border: 1px solid #EBEEF5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  h4 {
    margin: 0;
    font-size: 16px;
    color: #303133;
    font-weight: 600;
  }
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  &.status-success {
    background-color: #f0f9ff;
    color: #67C23A;
    border: 1px solid #b3e19d;
  }
  
  &.status-current {
    background-color: #f4f4f5;
    color: #909399;
    border: 1px solid #d3d4d6;
  }
  
  &.status-error {
    background-color: #fef0f0;
    color: #F56C6C;
    border: 1px solid #fbc4c4;
  }
}

.timeline-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.timeline-comment {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #67C23A;
  
  .el-icon {
    color: #67C23A;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  .comment-text {
    color: #606266;
    font-size: 14px;
    font-style: italic;
    line-height: 1.5;
  }
}

:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid #E4E7ED;
}

:deep(.el-timeline-item__node) {
  width: 20px;
  height: 20px;
  left: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-timeline-item__node .el-icon) {
  font-size: 12px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}
</style>
