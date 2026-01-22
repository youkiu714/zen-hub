<template>
  <el-dialog
    v-model="visible"
    title="挂单详情"
    width="800px"
    :close-on-click-modal="false"
    custom-class="application-detail-dialog"
    @close="handleClose"
  >
    <!-- 自定义标题栏（含关闭图标） -->
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">挂单详情</span>
      </div>
    </template>

    <!-- 主体内容（可滚动） -->
     <div v-if="!detail" class="loading">加载中...</div>
    <div v-else class="dialog-body">
      <!-- 申请人信息 & 挂单信息（左右布局） -->
      <div class="info-row">
        <!-- 申请人信息 -->
        <div class="info-card">
          <h3 class="section-title">申请人信息</h3>
          <div class="info-item">
            <label>姓名</label>
            <span>{{ detail.basic?.name || '—' }}</span>
          </div>
          <div class="info-item">
            <label>性别</label>
            <span>{{ getGenderText(detail.basic?.gender) }}</span>
          </div>
          <div class="info-item">
            <label>联系电话</label>
            <span>{{ detail.basic?.mobile || '—' }}</span>
          </div>
          <div class="info-item">
            <label>微信号</label>
            <span>{{ detail.basic?.weChat || '—' }}</span>
          </div>
          <div class="info-item">
            <label>证件号码</label>
            <span>{{ detail.basic?.idCard || '—' }}</span>
          </div>
          <div class="info-item">
            <label>籍贯</label>
            <span>{{ [detail.basic?.province, detail.basic?.city].filter(Boolean).join(' ') || '—' }}</span>
          </div>
          <div class="info-item">
            <label>联系地址</label>
            <span>{{ detail.basic?.address || '—' }}</span>
          </div>
          <div class="info-item">
            <label>健康情况</label>
            <span>{{ detail.basic?.diseaseHistory || '无特殊病史' }}</span>
          </div>
        </div>

        <!-- 挂单信息 -->
        <div class="info-card">
          <h3 class="section-title">挂单信息</h3>
          <div class="info-item">
            <label>挂单类型</label>
            <span>{{ getApplicationTypeText(detail.lodging?.applicationType) }}</span>
          </div>
          <div class="info-item">
            <label>入住日期</label>
            <span>{{ detail.lodging?.checkinDate || '—' }}</span>
          </div>
          <div class="info-item">
            <label>退住日期</label>
            <span>{{ detail.lodging?.checkoutDate || '—' }}</span>
          </div>
          <div class="info-item">
            <label>特殊需求</label>
            <span>{{ detail.lodging?.specialRequest || '无' }}</span>
          </div>
          <div class="info-item">
            <label>推荐人</label>
            <span>{{ detail.lodging?.recommenderName || '—' }}</span>
          </div>
          <div class="info-item">
            <label>推荐关系</label>
            <span>{{ detail.lodging?.recommenderRelation || '—' }}</span>
          </div>
          <div class="info-item">
            <label>推荐意见</label>
            <span class="comment">{{ detail.lodging?.recommenderComment || '无' }}</span>
          </div>
        </div>
      </div>

      <!-- 审核进度 -->
      <div class="progress-section">
        <h3 class="section-title">审核进度</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in detail.timeline"
            :key="index"
            :timestamp="item.time"
            :type="getTimelineType(item.type)"
            :color="getTimelineColor(item.type)"
            size="large"
          >
            <h4>{{ item.title }}</h4>
            <p v-if="item.content" class="timeline-content">{{ item.content }}</p>
            <p v-if="item.operator" class="timeline-operator">操作人：{{ item.operator }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { ApplicationDetailVO } from './types' // 假设接口定义在同级 types.ts
import  { getApplicationById }  from '@/api/application'

// Props & Emits
const props = defineProps<{
  modelValue: boolean
  applicationId: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()


// 控制显示
const visible = ref(false)

// 模拟数据（符合接口结构）
const detail = ref<ApplicationDetailVO | null>(null);

watch(
  () => [props.modelValue, props.applicationId] as const,
  async ([modelValue, newId]) => {
    visible.value = modelValue
console.log(modelValue);
console.log(newId);
    if (modelValue && newId && newId > 0) {
      await getApplicationItem(newId)
    }
  },
  { immediate: true }
)

// onMounted(()=>{
//   getApplicationItem(props.applicationId)
// })

const getApplicationItem = async (applicationId:number) => {
  console.log(applicationId)
  const data  = await getApplicationById(applicationId);
  console.log(data);
  detail.value = data
}

const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}

// 工具函数
const getGenderText = (gender?: number): string => {
  if (gender === 1) return '男'
  if (gender === 2) return '女'
  return '未知'
}

const getApplicationTypeText = (type?: number): string => {
  const map: Record<number, string> = {
    1: '短住',
    2: '团体',
    3: '直通车',
    4: '特殊'
  }
  return map[type ?? 0] || '未知类型'
}

const getTimelineType = (type?: string): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  if (type === 'approved') return 'success'
  if (type === 'rejected') return 'danger'
  if (type === 'submit' || type === 'recommend_done') return 'primary'
  return 'info'
}

const getTimelineColor = (type?: string): string => {
  if (type === 'approved') return '#67C23A'
  if (type === 'rejected') return '#F56C6C'
  if (type === 'submit' || type === 'recommend_done') return '#409EFF'
  return '#909399'
}
</script>

<style scoped>
.application-detail-dialog {
  --el-dialog-title-font-size: 18px;
  --el-dialog-title-color: #8b6546;
}

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

.close-icon {
  font-size: 18px;
  color: #909399;
}

.dialog-body {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  padding: 0 20px 20px;
}

.info-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  flex: 1;
  background-color: #fafafa;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #8b6546;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  line-height: 1.5;
}

.info-item label {
  width: 90px;
  font-weight: bold;
  color: #606266;
}

.info-item span {
  flex: 1;
  color: #303133;
}

.comment {
  color: #606266;
  font-style: italic;
  background-color: #f5f7fa;
  padding: 6px 8px;
  border-radius: 4px;
}

.progress-section {
  margin-top: 16px;
}

.timeline-content {
  margin: 4px 0 0;
  color: #606266;
  font-size: 14px;
}

.timeline-operator {
  margin: 4px 0 0;
  color: #909399;
  font-size: 13px;
}

.dialog-footer {
  text-align: center;
}
</style>