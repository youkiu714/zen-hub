<!-- src/components/ReviewDetailDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    title="申请详情"
    width="80%"
    :before-close="handleClose"
    :close-on-click-modal="false"
    class="review-detail-dialog"
  >
    <div class="dialog-content" ref="contentRef">
      <!-- 审批流程 -->
      <div class="process-section">
        <h3>审核流程</h3>
        <div class="process-steps">
          <div class="process-step completed">
            <div class="step-icon"><el-icon><Check /></el-icon></div>
            <div class="step-info">
              <div class="step-title">申请提交</div>
              <div class="step-time">{{ props.currentItem?.lastReviewTime || '-' }}</div>
            </div>
          </div>
          <div
            class="process-step"
            :class="{ active: props.currentItem?.reviewStatus === 10, completed: props.currentItem?.reviewStatus && props.currentItem.reviewStatus > 10 }"
          >
            <div class="step-icon">
              <el-icon v-if="props.currentItem?.reviewStatus && props.currentItem.reviewStatus > 10"><Check /></el-icon>
              <el-icon v-else-if="props.currentItem?.reviewStatus === 10"><Timer /></el-icon>
              <span  v-else class="empty-circle"></span>
            </div>
            <div class="step-info">
              <div class="step-title">客堂义工审核</div>
              <div v-if="props.currentItem?.reviewStatus === 10" class="step-status">等待审核...</div>
            </div>
          </div>
          <div
            class="process-step"
            :class="{ active: props.currentItem?.reviewStatus === 20, completed: props.currentItem?.reviewStatus && props.currentItem.reviewStatus > 20 }"
          >
            <div class="step-icon">
              <el-icon v-if="props.currentItem?.reviewStatus && props.currentItem.reviewStatus > 20"><Check /></el-icon>
              <el-icon v-else-if="props.currentItem?.reviewStatus === 20"><Timer /></el-icon>
              <el-icon v-else><Circle /></el-icon>
            </div>
            <div class="step-info">
              <div class="step-title">客堂法师审核</div>
              <div v-if="props.currentItem?.reviewStatus === 20" class="step-status">等待审核...</div>
            </div>
          </div>
          <div class="process-step" :class="{ completed: props.currentItem?.reviewStatus && props.currentItem.reviewStatus >= 30 }">
            <div class="step-icon">
              <el-icon v-if="props.currentItem?.reviewStatus && props.currentItem.reviewStatus >= 30"><Check /></el-icon>
              <el-icon v-else><Circle /></el-icon>
            </div>
            <div class="step-info">
              <div class="step-title">审核完成</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 信息区 -->
      <div class="info-section">
        <div class="info-card">
          <h4><el-icon><User /></el-icon> 申请人基本信息</h4>
          <div class="info-grid">
            <div><span>姓名</span><span>{{ props.currentItem?.applicantName }}</span></div>
            <div><span>身份证号</span><span>{{ props.currentItem?.idCardMasked }}</span></div>
          </div>
        </div>
        <div class="info-card">
          <h4><el-icon><Calendar /></el-icon> 挂单信息</h4>
          <div class="info-grid">
            <div><span>申请类型</span><span>{{ ApplicationTypeMap[props.currentItem?.applicationType || 0] }}</span></div>
            <div><span>申请编号</span><span>{{ props.currentItem?.id ? 'GS' + props.currentItem.id : '-' }}</span></div>
            <div><span>入住日期</span><span>{{ props.currentItem?.checkinDate }}</span></div>
            <div><span>离店日期</span><span>{{ props.currentItem?.checkoutDate }}</span></div>
            <div><span>挂单天数</span><span>{{ props.currentItem?.days }}天</span></div>
          </div>
        </div>
      </div>

      <!-- 审核区域 -->
      <div v-if="showReviewArea" class="review-area">
        <h4><el-icon><EditPen /></el-icon> 客堂义工审核</h4>
        <div class="review-form">
          <div class="form-item">
            <label>审核意见</label>
            <el-input
              v-model="reviewComment"
              type="textarea"
              placeholder="请输入审核意见..."
              rows="3"
            />
          </div>
          <div class="form-item">
            <label>审核结果</label>
            <el-radio-group v-model="reviewResult">
              <el-radio :label="1">信息完整，提交给客堂法师审核</el-radio>
              <el-radio :label="0">信息不完整，退回申请人</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          v-if="!showReviewArea && props.currentItem?.reviewStatus === 10"
          type="primary"
          @click="startReview"
        >开始审核</el-button>
        <template v-else-if="showReviewArea">
          <el-button @click="cancelReview">取消</el-button>
          <el-button type="primary" @click="submitReview">提交审核</el-button>
        </template>
        <el-button type="warning" style="float: right" @click="downloadMaterials">下载申请材料</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Timer, User, Calendar, EditPen } from '@element-plus/icons-vue';
import type { ReviewListItemVO } from '@/types/review';

const props = defineProps<{
  modelValue: boolean;
  currentItem: ReviewListItemVO | null;
  isViewOnly: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'close', 'reviewSubmitted']);

const visible = ref(false);
const showReviewArea = ref(false);
const reviewComment = ref('');
const reviewResult = ref(1);

const ApplicationTypeMap = {
  1: '短住',
  2: '直通车',
  3: '僧亲',
  4: '团队挂单',
  5: '特殊客人',
};

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val && !props.isViewOnly) {
      showReviewArea.value = true;
      nextTick(() => {
        // 可选：滚动到底部审核区
      });
    } else {
      showReviewArea.value = false;
    }
  },
  { immediate: true }
);

const handleClose = () => {
  visible.value = false;
  emit('update:modelValue', false);
  emit('close');
};

const startReview = () => {
  showReviewArea.value = true;
};

const cancelReview = () => {
  showReviewArea.value = false;
};

const submitReview = () => {
  ElMessage.success('审核已提交');
  emit('reviewSubmitted');
  handleClose();
};

const downloadMaterials = () => {
  ElMessage.info('下载功能待实现');
};
</script>

<style scoped>
.review-detail-dialog :deep(.el-dialog) {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  max-height: calc(90vh - 120px);
}

.process-section,
.info-section,
.review-area {
  margin-bottom: 25px;
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.process-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #f9fafc;
}

.process-step.completed {
  border-color: #67c23a;
  background: #f0f9eb;
}

.process-step.active {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.step-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-section {
  display: flex;
  gap: 20px;
}

.info-card {
  flex: 1;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.info-card h4 {
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.info-grid div {
  display: flex;
  justify-content: space-between;
}

.info-grid span:first-child {
  font-weight: bold;
  color: #666;
}

.review-form .form-item {
  margin-bottom: 16px;
}

.review-form label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.empty-circle {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #dcdfe6;
  border-radius: 50%;
  background: transparent;
}
</style>