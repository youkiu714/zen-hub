<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="900px"
    :close-on-click-modal="false"
    :top="'5vh'"
    class="renewal-detail-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">续单申请详情</h3>
      </div>
    </template>

    <div class="dialog-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <!-- 在寺表现评价 -->
        <div class="section">
          <h4 class="section-title">在寺表现评价</h4>
          <el-form-item label="纪律遵守" prop="scoreRules">
            <div class="evaluation-item">
              <el-rate v-model="formData.scoreRules" allow-half size="large" />
              <span class="rating-text">{{ getRatingText(formData.scoreRules) }}</span>
            </div>
          </el-form-item>
          <el-form-item label="共修评分" prop="scorePractice">
            <div class="evaluation-item">
              <el-rate v-model="formData.scorePractice" allow-half size="large" />
              <span class="rating-text">{{ getRatingText(formData.scorePractice) }}</span>
            </div>
          </el-form-item>
          <el-form-item label="日常行为" prop="scoreBehavior">
            <div class="evaluation-item">
              <el-rate v-model="formData.scoreBehavior" allow-half size="large" />
              <span class="rating-text">{{ getRatingText(formData.scoreBehavior) }}</span>
            </div>
          </el-form-item>
          <el-form-item label="表现评价" prop="overallComment">
            <el-input
              v-model="formData.scoreRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入表现评价"
              maxlength="200"
              show-word-limit
              resize="none"
            />
          </el-form-item>
        </div>

        <div class="section">
          <h4 class="section-title">审核意见</h4>
          <el-form-item label="审核结果" prop="reviewResult">
            <el-radio-group v-model="formData.reviewResult">
              <el-radio label="approve">同意续住</el-radio>
              <el-radio label="reject">拒绝续住</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核意见" prop="comment">
            <el-input
              v-model="formData.comment"
              type="textarea"
              :rows="4"
              placeholder="请输入审核意见"
              maxlength="200"
              show-word-limit
              resize="none"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting"> 提交审核 </el-button>
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
    adjustCheckoutDate: props.orderData?.checkoutDate || ''
  })

  // 重置表单验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const getRatingText = (rating: number) => {
  if (rating >= 4.5) return '优秀'
  if (rating >= 3.5) return '良好'
  if (rating >= 2.5) return '一般'
  if (rating >= 1.5) return '较差'
  return '很差'
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

    const response = await reviewExtension(props.orderData.applicationId, submitData)
    console.log('response:', response)

    if (response.data.code === 0) {
      ElMessage.success('审核提交成功')
      emit('submit', submitData)
      emit('update:modelValue', false)
    } else if (response.data.code === 1) {
      ElMessage.error(response.data.message || '审核提交失败')
    }
  } catch (error) {
    console.error('审核提交失败:', error)
  } finally {
    submitting.value = false
  }
}, 500)
</script>

<style scoped lang="scss">
.renewal-detail-dialog {
  .dialog-header {
    text-align: center;
    padding: 0;

    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.dialog-content {
  max-height: calc(85vh - 120px);
  overflow-y: auto;
  padding: 0;
}

.section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
  }
}

.evaluation-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .rating-text {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0 0;
}
</style>
