<template>
  <el-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="" width="600px"
    :close-on-click-modal="false" class="review-dialog">
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">申请详情 - GS20230615001</h3>
      </div>
    </template>

    <div v-if="record" class="review-content">
      <!-- 申请信息 -->
      <!-- <div class="application-info">
        <div class="info-header">
          <h4>申请信息</h4>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="info-label">申请人：</span>
            <span class="info-value">{{ record.applicant }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">申请类型：</span>
            <el-tag :type="getApplicationTypeTag(record.applicationType) as any" size="small">
              {{ getApplicationTypeText(record.applicationType) }}
            </el-tag>
          </div>
          <div class="info-row">
            <span class="info-label">申请起止日期：</span>
            <span class="info-value date-range">{{ formatDateRange(record.startDate, record.endDate) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">挂单天数：</span>
            <span class="info-value stay-days">{{ record.stayDays }}天</span>
          </div>
        </div>
      </div> -->

      <!-- 审核表单 -->
      <div class="review-form">
        <div class="form-header">
          <h4>客堂义工审核</h4>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="review-form-content">
          
          <el-form-item label="审核意见" prop="comment">
            <el-input v-model="form.comment" type="textarea" :rows="5" placeholder="请输入审核意见" class="review-textarea"
              resize="none" />
          </el-form-item>
          <el-form-item label="审核结果" prop="result">
          <el-radio-group v-model="form.result">
              <el-radio value="approved" size="large">信息完整，提交给客堂法师审核</el-radio>
              <el-radio value="rejected" size="large">信息不完整，退回申请人</el-radio>
            </el-radio-group>
            <!-- <el-radio-group v-model="form.result" class="radio-group">
              <el-radio value="approved" class="radio-option">
                <div class="radio-content">
                  <div class="radio-title">信息完整，提交给客堂法师审核</div>
                </div>
              </el-radio>
              <el-radio value="rejected" class="radio-option">
                <div class="radio-content">
                  <div class="radio-title">信息不完整，退回申请人</div>
                </div>
              </el-radio>
            </el-radio-group> -->
          </el-form-item>
        </el-form>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button @click="handleCancel" size="large">取消</el-button>
          <el-button type="primary" @click="handleSubmit" size="large" :loading="submitting">
            提交审核
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <!-- 下载申请材料按钮 -->
      <div class="download-footer">
        <el-button type="default" size="large" class="download-button" @click="handleDownload">
          <el-icon class="download-icon">
            <Download />
          </el-icon>
          下载申请材料
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Download } from '@element-plus/icons-vue'
import type { OrderApplication, ReviewForm } from '../types'
import type { FormInstance, FormRules } from 'element-plus'
import { useOrderUtils } from '../composables/useOrderUtils'

interface Props {
  modelValue: boolean
  record: OrderApplication | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', form: ReviewForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getApplicationTypeText, getApplicationTypeTag, formatDateRange } = useOrderUtils()

const formRef = ref<FormInstance>()
const form = ref<ReviewForm>({
  result: 'approved',
  comment: ''
})

const submitting = ref(false)

const rules: FormRules = {
  result: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入审核意见', trigger: 'blur' }
  ]
}

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('submit', { ...form.value })
  } catch (error) {
    console.error('审核验证失败:', error)
  }
}

const handleDownload = () => {
  if (!props.record) return

  // 模拟下载申请材料
  console.log('下载申请材料:', props.record.applicant)

  // 创建一个模拟的下载链接
  const link = document.createElement('a')
  link.href = '#'
  link.download = `申请材料_${props.record.applicant}_${props.record.id}.pdf`
  link.click()
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.value = {
      result: 'approved',
      comment: ''
    }
  }
})
</script>

<style scoped lang="scss">
:deep(.review-dialog) {
  .el-dialog {
    border-radius: 12px;
    overflow: hidden;
  }

  .el-dialog__header {
    padding: 0;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px;
  background: #fff;

  .dialog-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
  }
}

.review-content {
  max-height: 60vh;
  overflow-y: auto;
  background: #fff;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}

.application-info {
  padding: 20px 24px;
  border-bottom: 8px solid #f8f9fa;

  .info-header {
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: #3b82f6;
        border-radius: 2px;
      }
    }
  }

  .info-content {
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        min-width: 100px;
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
      }

      .info-value {
        font-size: 14px;
        color: #374151;

        &.date-range {
          color: #059669;
          font-weight: 500;
        }

        &.stay-days {
          font-weight: 600;
          color: #3b82f6;
        }

        .el-tag {
          font-weight: 500;
        }
      }
    }
  }
}

.review-form {
  padding: 20px 24px;

  .form-header {
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: #3b82f6;
        border-radius: 2px;
      }
    }
  }

  .review-form-content {
    .radio-group {
      display: flex;
      gap: 24px;
      flex-direction: row;

      .radio-option {
        display: flex;
        align-items: flex-start;
        padding: 16px 20px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
        flex: 1;
        min-height: 80px;

        &:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .radio-content {
          flex: 1;
          margin-left: 8px;

          .radio-title {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            line-height: 1.5;
          }
        }

        &.is-checked {
          border-color: #3b82f6;
          background: #eff6ff;

          .radio-content .radio-title {
            color: #1d4ed8;
          }
        }
      }
    }

    .review-textarea {
      :deep(.el-textarea__inner) {
        border-radius: 8px;
        border: 2px solid #e5e7eb;
        transition: border-color 0.3s ease;

        &:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &::placeholder {
          color: #9ca3af;
        }
      }
    }
  }
}

.download-footer {
  display: flex;
  justify-content: right;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;

  .download-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #475569;
    transition: all 0.3s ease;

    &:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #334155;
      transform: translateY(-1px);
    }

    .download-icon {
      font-size: 16px;
    }
  }
}

.action-buttons {
  margin-top: 24px;
  padding-top: 20px;
  // border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  :deep(.review-dialog) {
    .el-dialog {
      width: 95% !important;
      margin: 0 auto;
    }
  }

  .dialog-header {
    padding: 20px 16px 16px;

    .dialog-title {
      font-size: 18px;
    }
  }

  .application-info,
  .review-form {
    padding: 16px;

    .info-content .info-row {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 8px;

      .info-label {
        min-width: auto;
        margin-bottom: 4px;
      }
    }

    .review-form-content .radio-group {
      flex-direction: column;
      gap: 12px;

      .radio-option {
        min-height: auto;
      }
    }
  }
}
</style>