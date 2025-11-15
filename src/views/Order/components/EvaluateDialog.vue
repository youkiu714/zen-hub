<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="推荐人评价"
    width="600px"
    :close-on-click-modal="false"
  >
    <div v-if="record" class="evaluate-content">
      <div class="evaluate-info">
        <h4>申请信息</h4>
        <el-descriptions :column="1" size="small">
          <el-descriptions-item label="申请人">{{ record.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请类型">
            {{ getApplicationTypeText(record.applicationType) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="margin-top: 20px"
      >
        <el-form-item label="评价结果" prop="result">
          <el-radio-group v-model="form.result">
            <el-radio value="positive">积极评价</el-radio>
            <el-radio value="negative">消极评价</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="评价内容" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入评价内容"
          />
        </el-form-item>

        <el-form-item label="推荐指数" prop="rating">
          <el-rate
            v-model="form.rating"
            :max="5"
            show-text
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交评价</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { OrderApplication, EvaluateForm } from '../types'
import type { FormInstance, FormRules } from 'element-plus'
import { useOrderUtils } from '../composables/useOrderUtils'

interface Props {
  modelValue: boolean
  record: OrderApplication | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', form: EvaluateForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getApplicationTypeText } = useOrderUtils()

const formRef = ref<FormInstance>()
const form = ref<EvaluateForm>({
  result: 'positive',
  comment: '',
  rating: 5
})

const rules: FormRules = {
  result: [
    { required: true, message: '请选择评价结果', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' }
  ],
  rating: [
    { required: true, message: '请选择推荐指数', trigger: 'change' }
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
    console.error('评价验证失败:', error)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.value = {
      result: 'positive',
      comment: '',
      rating: 5
    }
  }
})
</script>

<style scoped lang="scss">
.evaluate-content {
  .evaluate-info {
    margin-bottom: 20px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>