<template>
  <el-dialog
    v-model="visible"
    title="续住申请"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" label-position="top">
      <el-form-item label="原计划退住日期" prop="originalCheckoutDate">
        <el-input
          v-model="form.originalCheckoutDate"
          placeholder="原计划退住日期"
          readonly
          style="width: 100%"
          disabled
        />
      </el-form-item>

      <el-form-item label="申请续住至" prop="requestedCheckoutDate">
        <el-date-picker
          v-model="form.requestedCheckoutDate"
          type="date"
          placeholder="年/月/日"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item label="续住原因" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="请输入续住原因"
          maxlength="200"
          show-word-limit
          resize="none"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" size="large"> 取消 </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
          提交申请
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { applyRenew } from '@/api/application'

import { debounce } from 'lodash-es'

interface RenewalApplicationForm {
  originalCheckoutDate: string
  requestedCheckoutDate: string
  reason: string
}

interface Props {
  modelValue: boolean
  orderData?: {
    id?: number
    applicantName?: string
    checkoutDate?: string
    [key: string]: any
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: RenewalApplicationForm & { orderId?: number }]
}>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<RenewalApplicationForm>({
  originalCheckoutDate: '',
  requestedCheckoutDate: '',
  reason: ''
})

const rules: FormRules = {
  requestedCheckoutDate: [{ required: true, message: '请选择续住日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入续住原因', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      initForm()
    }
  },
  { immediate: true }
)

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const initForm = () => {
  if (props.orderData?.checkoutDate) {
    form.originalCheckoutDate = props.orderData.checkoutDate
  }
  form.reason = ''
  form.requestedCheckoutDate = ''

  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 禁用日期 - 只能选择原退住日期之后的日期
const disabledDate = (time: Date) => {
  if (!form.originalCheckoutDate) return false

  const originalDate = new Date(form.originalCheckoutDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return time.getTime() <= Math.max(originalDate.getTime(), today.getTime())
}

// 处理取消
const handleCancel = () => {
  handleClose()
}

// 处理关闭
const handleClose = () => {
  visible.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

// 重置表单
const resetForm = () => {
  form.originalCheckoutDate = ''
  form.reason = ''
form.requestedCheckoutDate = ''
  formRef.value?.resetFields()
}

const handleSubmit = debounce(async () => {
  const applicationId = props.orderData?.applicationId

  if (!formRef.value || !applicationId) return

  try {
    await formRef.value.validate()

    submitting.value = true

    const submitData = {
      ...form,
      applicationId
    }

    await applyRenew(submitData)

    ElMessage.success('续住申请提交成功，请等待审核结果')

    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}, 300)
</script>
