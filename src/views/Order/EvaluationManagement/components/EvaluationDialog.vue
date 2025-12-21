<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800"
    :before-close="handleClose"
    class="evaluation-dialog jobs-style"
  >
    <div class="dialog-content">
      <div class="profile-section">
        <h4 class="section-title">
          <el-icon><User /></el-icon>
          挂单人基本信息
        </h4>
        <el-descriptions :column="2" border class="jobs-descriptions">
          <el-descriptions-item label="姓名">{{ profile.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ profile.gender || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ profile.age || '-' }}</el-descriptions-item>
          <el-descriptions-item label="民族">{{ profile.nation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{
            profile.phone|| '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="挂单类型">
            <el-tag  size="small">
              {{ profile.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="入住日期">{{
            profile.checkInDate || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="退房日期">{{
            profile.checkOutDate || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="入住天数">{{
            profile.stayDays || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="挂单目的">{{
            profile.purpose || '禅修'
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="showForm" class="evaluation-form">
        <h4 class="section-title">
          <el-icon><Star /></el-icon>
          在寺表现评价
        </h4>

        <el-form :model="form" label-width="140px" label-position="top">
          <div class="rating-sections">
            <div v-for="(item, index) in ratingItems" :key="index" class="rating-item">
              <label class="rating-label">{{ index + 1 }}. {{ item.label }}</label>
              <div class="rating-options">
                <el-rate
                  v-model="form.ratings[index]"
                  :colors="['#ff6e6e', '#ffb948', '#fecb65', '#98e34c', '#52c41a']"
                  show-score
                  score-template="{value}分"
                  :texts="['差', '较差', '一般', '良好', '优秀']"
                  @change="(value) => setRating(index, value)"
                />
              </div>
            </div>
          </div>

          <el-form-item label="评价意见与建议" required>
            <el-input
              v-model="form.comments"
              type="textarea"
              :rows="4"
              style="width: 100%"
              placeholder="请输入对挂单人在寺表现的具体评价和建议"
              resize="none"
            />
          </el-form-item>

          <el-form-item label="综合评价等级" required>
            <el-select v-model="form.overall" placeholder="请选择综合评价等级" style="width: 200px">
              <el-option label="优秀" value="excellent" />
              <el-option label="良好" value="good" />
              <el-option label="一般" value="average" />
              <el-option label="较差" value="poor" />
              <el-option label="差" value="bad" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div v-else-if="showEvaluation" class="evaluation-content">
        <h4 class="section-title">
          <el-icon><Star /></el-icon>
          评价内容
        </h4>
        <el-descriptions :column="1" border class="jobs-descriptions">
          <el-descriptions-item label="纪律遵守情况">
            <el-rate
              v-model="viewEvaluationData.discipline"
              disabled
              :colors="['#ff6e6e', '#ffb948', '#fecb65', '#98e34c', '#52c41a']"
              show-score
              score-template="{value}分"
            />
          </el-descriptions-item>
          <el-descriptions-item label="礼仪规范情况">
            <el-rate
              v-model="viewEvaluationData.etiquette"
              disabled
              :colors="['#ff6e6e', '#ffb948', '#fecb65', '#98e34c', '#52c41a']"
              show-score
              score-template="{value}分"
            />
          </el-descriptions-item>
          <el-descriptions-item label="集体活动参与">
            <el-rate
              v-model="viewEvaluationData.activity"
              disabled
              :colors="['#ff6e6e', '#ffb948', '#fecb65', '#98e34c', '#52c41a']"
              show-score
              score-template="{value}分"
            />
          </el-descriptions-item>
          <el-descriptions-item label="环境维护与卫生">
            <el-rate
              v-model="viewEvaluationData.environment"
              disabled
              :colors="['#ff6e6e', '#ffb948', '#fecb65', '#98e34c', '#52c41a']"
              show-score
              score-template="{value}分"
            />
          </el-descriptions-item>
          <el-descriptions-item label="与人相处情况">
            <el-rate
              v-model="viewEvaluationData.interaction"
              disabled
              :colors="['#ff6e6e', '#ffb948', '#fecb65', '#98e34c', '#52c41a']"
              show-score
              score-template="{value}分"
            />
          </el-descriptions-item>
          <el-descriptions-item label="评价意见">
            {{ viewEvaluationData.comments }}
          </el-descriptions-item>
          <el-descriptions-item label="综合评价等级">
            <el-tag :type="getOverallTagType(viewEvaluationData.overall)">
              {{ getOverallLabel(viewEvaluationData.overall) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="form-actions">
          <el-button @click="handleClose" class="btn-secondary">取消</el-button>
          <el-button
            type="primary"
            @click="$emit('submit-evaluation')"
            :loading="submitting"
            class="btn-primary"
          >
            提交评价
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { User, Star} from '@element-plus/icons-vue'
import type {
  EvaluationRecord as Profile,
  EvaluationForm,
  RatingItem,
  ViewEvaluationData
} from '@/types/evaluation'

// Props (保持不变)
interface Props {
  visible: boolean
  title: string
  profile: Profile
  showForm: boolean
  showEvaluation: boolean
  form: EvaluationForm
  submitting: boolean
  viewEvaluationData: ViewEvaluationData
  ratingItems: RatingItem[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  profile: () => ({}) as Profile,
  showForm: false,
  showEvaluation: false,
  form: () => ({
    ratings: [0, 0, 0, 0, 0],
    comments: '',
    overall: ''
  }),
  submitting: false,
  viewEvaluationData: () => ({
    discipline: 4,
    etiquette: 5,
    activity: 4,
    environment: 5,
    interaction: 4,
    comments: '',
    overall: 'good'
  }),
  ratingItems: () => []
})

watch(() => props.profile, (newVal) => {   
console.log("newVal:",newVal)
}, {
    deep: true
})

// Emits (保持不变)
const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  'start-evaluation': []
  'cancel-evaluation': []
  'submit-evaluation': []
  'download-profile': []
  'set-rating': [index: number, value: number]
}>()

// 计算属性 (保持不变)
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 方法 (保持不变)
const handleClose = () => {
  emit('close')
}

const setRating = (index: number, value: number) => {
  emit('set-rating', index, value)
}


const getTypeTagType = (type: string) => {
  const types = {
    short: 'primary',
    express: 'success',
    monk: 'warning',
    group: 'info',
    special: 'danger'
  }
  return types[type] || 'info'
}

const getOverallLabel = (overall: string) => {
  const labels = {
    excellent: '优秀',
    good: '良好',
    average: '一般',
    poor: '较差',
    bad: '差'
  }
  return labels[overall] || overall
}

const getOverallTagType = (overall: string) => {
  const types = {
    excellent: 'success',
    good: 'primary',
    average: 'warning',
    poor: 'danger',
    bad: 'danger'
  }
  return types[overall] || 'info'
}
</script>

<style scoped lang="scss">
/* =========================================
   1. Jobs Style 通用变量/重置
   ========================================= */
$jobs-primary-color: #007aff; /* Apple Blue for action */
$jobs-text-color: #333333;
$jobs-light-text-color: #6a6a6a;
$jobs-border-color: #e0e0e0;
$jobs-background-color: #f7f7f7;

/* 定义 Header 和 Footer 的大致高度，用于 Flex 计算 */
$header-height: 52px;
$footer-height: 60px; // 稍微增加，确保底部按钮有足够的 padding

/* =========================================
   2. 弹窗样式 (Dialog & Form)
   ========================================= */
.evaluation-dialog.jobs-style {
  /* 覆盖 Header */
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px 24px;
    border-bottom: 1px solid $jobs-border-color;
    // background-color: white;
    flex-shrink: 0;
    height: $header-height;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: $jobs-text-color;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: #999999;
      &:hover {
        color: $jobs-primary-color;
      }
    }
  }

  /* 覆盖 Body - 容器弹性伸展，不负责滚动 */
  :deep(.el-dialog__body) {
    padding: 0;
    flex-grow: 1;
    overflow: hidden;
    min-height: 0;

    // 使 dialog body 采用 flex 布局，以容纳内部 content wrapper
    display: flex;
    flex-direction: column;
  }

  /* 覆盖 Footer - 固定高度 */
  :deep(.el-dialog__footer) {
    padding: 16px 24px; // 增加垂直 padding
    border-top: 1px solid $jobs-border-color;
    background-color: #ffffff;
    flex-shrink: 0;
    height: $footer-height;
  }

  .dialog-content {
    flex-grow: 1;
    overflow-y: auto;
    max-height: calc(80vh - #{$header-height} - #{$footer-height} - 4vh);

    /* 隐藏滚动条但保留滚动能力 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none; /* Chrome/Safari */
    }
  }
}

.jobs-descriptions {
  :deep(.el-descriptions__header) {
    margin-bottom: 16px;
  }
  :deep(.el-descriptions__body) {
    background-color: #ffffff;
  }
  :deep(.el-descriptions__table) {
    border-color: $jobs-border-color;
  }
  :deep(.el-descriptions-item__label) {
    background-color: $jobs-background-color; // 浅灰色背景
    color: $jobs-light-text-color;
    font-weight: 500;
    border-color: $jobs-border-color;
    padding: 12px 16px;
  }
  :deep(.el-descriptions-item__content) {
    color: $jobs-text-color;
    border-color: $jobs-border-color;
    padding: 12px 16px;
  }
}

.profile-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: $jobs-text-color; // 强调标题使用深色文本
  margin-bottom: 16px;
  padding-bottom: 8px; // 增加标题底部留白

  :deep(.el-icon) {
    color: $jobs-primary-color; // 图标使用主色调
    font-size: 20px;
  }
}

.evaluation-form {
  .rating-sections {
    margin-bottom: 32px;

    .rating-item {
      margin-bottom: 24px;

      .rating-label {
        display: block;
        font-weight: 500;
        color: $jobs-text-color;
        margin-bottom: 12px;
        font-size: 15px;
      }
    }
  }
}
/* 按钮样式覆盖 */
.dialog-footer {
  .btn-primary.el-button--primary {
    // 保持 Element Plus 默认蓝色或微调为 $jobs-primary-color
    background-color: $jobs-primary-color;
    border-color: $jobs-primary-color;
    font-weight: 500;

    &:hover {
      opacity: 0.9;
    }
  }

  .btn-secondary {
    background-color: #f5f5f5;
    border-color: $jobs-border-color;
    color: $jobs-text-color;

    &:hover {
      background-color: $jobs-border-color;
      border-color: $jobs-border-color;
    }
  }
}
</style>
