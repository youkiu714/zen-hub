<template>
  <el-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" width="680px"
    :close-on-click-modal="false" class="apple-dialog" align-center destroy-on-close>
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">续单审核</h3>
        <p class="dialog-subtitle">请评估申请人的在寺表现并给出审核意见</p>
      </div>
    </template>

    <div class="dialog-body">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="apple-form">
        <div class="form-section">
          <div class="section-header">
            <span class="icon">📊</span>
            <span class="text">表现评估</span>
          </div>

          <div class="card-container">
            <div class="rating-grid">
              <el-form-item label="纪律遵守" prop="scoreRules" class="rating-item">
                <div class="rating-wrapper">
                  <el-rate v-model="formData.scoreRules" allow-half size="large"
                    :colors="['#99A9BF', '#F7BA2A', '#FF9F0A']" />
                  <span class="rating-badge" :class="getRatingClass(formData.scoreRules)">
                    {{ getRatingText(formData.scoreRules) }}
                  </span>
                </div>
              </el-form-item>

              <el-form-item label="共修评分" prop="scorePractice" class="rating-item">
                <div class="rating-wrapper">
                  <el-rate v-model="formData.scorePractice" allow-half size="large"
                    :colors="['#99A9BF', '#F7BA2A', '#FF9F0A']" />
                  <span class="rating-badge" :class="getRatingClass(formData.scorePractice)">
                    {{ getRatingText(formData.scorePractice) }}
                  </span>
                </div>
              </el-form-item>

              <el-form-item label="日常行为" prop="scoreBehavior" class="rating-item">
                <div class="rating-wrapper">
                  <el-rate v-model="formData.scoreBehavior" allow-half size="large"
                    :colors="['#99A9BF', '#F7BA2A', '#FF9F0A']" />
                  <span class="rating-badge" :class="getRatingClass(formData.scoreBehavior)">
                    {{ getRatingText(formData.scoreBehavior) }}
                  </span>
                </div>
              </el-form-item>
            </div>

            <el-form-item label="综合评价备注" prop="scoreRemark" class="remark-item">
              <el-input v-model="formData.scoreRemark" type="textarea" :rows="3" placeholder="请输入关于申请人表现的详细描述..."
                maxlength="200" show-word-limit resize="none" class="apple-input" />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="icon">⚖️</span>
            <span class="text">审核决定</span>
          </div>

          <div class="card-container result-card">
            <el-form-item prop="reviewResult" class="radio-item">
              <el-radio-group v-model="formData.reviewResult" class="apple-radio-group">
                <el-radio label="approve" border class="radio-box approve">
                  <div class="radio-content">
                    <span class="radio-title">同意续住</span>
                    <span class="radio-desc">符合留宿条件</span>
                  </div>
                </el-radio>
                <el-radio label="reject" border class="radio-box reject">
                  <div class="radio-content">
                    <span class="radio-title">拒绝续住</span>
                    <span class="radio-desc">不符合留宿条件</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="最终审核意见" prop="comment">
              <el-input v-model="formData.comment" type="textarea" :rows="4" placeholder="请填写最终的审核说明或拒绝理由..."
                maxlength="200" show-word-limit resize="none" class="apple-input" />
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="apple-btn cancel" @click="handleCancel">取消</el-button>
        <el-button type="primary" class="apple-btn submit" @click="handleSubmit" :loading="submitting">
          确认提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { reviewExtension, type ExtensionReviewParams } from '@/api/extensions'
import type { ReviewListItemVO } from '@/types/review'
import { debounce } from 'lodash-es'

interface Props {
  modelValue: boolean
  orderData: ReviewListItemVO | null
}

interface FormData {
  scoreRules: number
  scorePractice: number
  scoreBehavior: number
  scoreRemark: string
  reviewResult: string
  comment: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive<FormData>({
  scoreRules: 0,
  scorePractice: 0,
  scoreBehavior: 0,
  scoreRemark: '',
  reviewResult: 'approve',
  comment: ''
})

const formRules: FormRules = {
  reviewResult: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  comment: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.orderData) {
      initFormData()
    }
  },
  { immediate: true }
)

const initFormData = () => {
  if (!props.orderData) return

  Object.assign(formData, {
    scoreRules: 0,
    scorePractice: 0,
    scoreBehavior: 0,
    scoreRemark: '',
    reviewResult: 'approve',
    comment: '',
  })

  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const getRatingText = (rating: number) => {
  if (rating >= 4.5) return '优秀'
  if (rating >= 3.5) return '良好'
  if (rating >= 2.5) return '一般'
  if (rating >= 1.5) return '较差'
  return '未评'
}

const getRatingClass = (rating: number) => {
  if (rating >= 4.5) return 'is-excellent'
  if (rating >= 3.5) return 'is-good'
  if (rating >= 2.5) return 'is-average'
  return 'is-poor'
}

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleSubmit = debounce(async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (!props.orderData?.id) {
      ElMessage.error('申请ID不存在')
      return
    }

    submitting.value = true

    const submitData: ExtensionReviewParams = {
      pass: formData.reviewResult === 'approve',
      comment: formData.comment,
      scoreRules: formData.scoreRules,
      scorePractice: formData.scorePractice,
      scoreBehavior: formData.scoreBehavior,
      scoreRemark: formData.scoreRemark
    }

    const response = await reviewExtension(props.orderData.id, submitData)

    if (response) {
      ElMessage.success('审核提交成功')
      emit('submit', submitData)
      emit('update:modelValue', false)
    } else {
      ElMessage.error('审核提交失败')
    }
  } catch (error) {
    console.error('表单验证失败或提交异常:', error)
  } finally {
    submitting.value = false
  }
}, 500)
</script>

<style scoped lang="scss">
/* Apple/Modern Style Variables */
$bg-primary: #ffffff;
$bg-secondary: #f5f5f7;
$text-primary: #1d1d1f;
$text-secondary: #86868b;
$accent-color: #0071e3;
$danger-color: #ff3b30;
$success-color: #34c759;
$border-radius-lg: 18px;
$border-radius-md: 12px;
$shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

:deep(.apple-dialog) {
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  .el-dialog__header {
    margin: 0;
    padding: 24px 24px 0;
    background: $bg-primary;
  }

  .el-dialog__body {
    padding: 24px 32px;
  }

  .el-dialog__footer {
    padding: 20px 32px 24px;
    background: $bg-primary;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
}

/* Header Styles */
.dialog-header {
  text-align: center;

  .dialog-title {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
  }

  .dialog-subtitle {
    font-size: 13px;
    color: $text-secondary;
    margin: 0;
  }
}

/* Section Styles */
.form-section {
  margin-bottom: 28px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .icon {
      font-size: 16px;
    }

    .text {
      font-size: 13px;
      font-weight: 600;
      color: $text-secondary;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
}

.card-container {
  background: $bg-primary;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: $border-radius-md;
  padding: 20px;
  box-shadow: $shadow-sm;

  &.result-card {
    background: linear-gradient(to bottom, #fff, #fafafa);
  }
}

/* Rating Styles */
.rating-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.rating-item {
  margin-bottom: 0 !important;

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: $text-secondary;
    padding-bottom: 4px;
  }
}

.rating-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-secondary;
  padding: 8px 12px;
  border-radius: 8px;
  width: 100%;

  :deep(.el-rate) {
    height: auto;
    --el-rate-icon-margin: 2px;
  }
}

.rating-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 40px;
  text-align: center;

  &.is-excellent {
    background: rgba($success-color, 0.1);
    color: $success-color;
  }

  &.is-good {
    background: rgba(#0071e3, 0.1);
    color: #0071e3;
  }

  &.is-average {
    background: rgba(#ff9f0a, 0.1);
    color: #ff9f0a;
  }

  &.is-poor {
    background: rgba($text-secondary, 0.1);
    color: $text-secondary;
  }
}

/* Input Styles */
.apple-input {
  :deep(.el-textarea__inner) {
    background-color: $bg-secondary;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    padding: 12px;
    font-size: 14px;
    color: $text-primary;
    transition: all 0.3s ease;
    box-shadow: none;

    &:hover {
      background-color: darken($bg-secondary, 2%);
    }

    &:focus {
      background-color: $bg-primary;
      border-color: rgba($accent-color, 0.5);
      box-shadow: 0 0 0 3px rgba($accent-color, 0.1);
    }

    &::placeholder {
      color: lighten($text-secondary, 10%);
    }
  }

  :deep(.el-input__count) {
    background: transparent;
    font-size: 11px;
  }
}

/* Radio Group Styles - Custom Cards */
.apple-radio-group {
  display: flex;
  gap: 16px;
  width: 100%;

  .radio-box {
    flex: 1;
    margin: 0 !important;
    height: auto;
    padding: 16px;
    border-radius: $border-radius-md;
    border: 2px solid $bg-secondary;
    transition: all 0.2s ease;
    display: flex;
    align-items: flex-start;

    &.is-checked {
      &.approve {
        border-color: $accent-color;
        background-color: rgba($accent-color, 0.04);

        :deep(.el-radio__inner) {
          border-color: $accent-color;
          background: $accent-color;
        }
      }

      &.reject {
        border-color: $danger-color;
        background-color: rgba($danger-color, 0.04);

        :deep(.el-radio__inner) {
          border-color: $danger-color;
          background: $danger-color;
        }
      }
    }

    .radio-content {
      display: flex;
      flex-direction: column;
      margin-left: 4px;

      .radio-title {
        font-weight: 600;
        font-size: 15px;
        color: $text-primary;
        margin-bottom: 2px;
      }

      .radio-desc {
        font-size: 12px;
        color: $text-secondary;
      }
    }
  }
}

/* Buttons */
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .apple-btn {
    padding: 10px 24px;
    border-radius: 20px;
    /* Pill shape */
    font-weight: 500;
    font-size: 14px;
    height: 40px;
    transition: all 0.2s;

    &.cancel {
      border: none;
      background: $bg-secondary;
      color: $text-primary;

      &:hover {
        background: darken($bg-secondary, 5%);
      }
    }

    &.submit {
      background: $accent-color;
      border: none;

      &:hover {
        background: lighten($accent-color, 5%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba($accent-color, 0.3);
      }
    }
  }
}

/* Responsive adjust */
@media (max-width: 600px) {
  .rating-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .apple-radio-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>