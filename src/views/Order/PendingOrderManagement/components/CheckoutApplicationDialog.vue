<template>
  <el-dialog
    v-model="visible"
    :title="`退住申请 - ${props.orderData?.applicantName || ''}`"
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

      <el-form-item label="实际退住日期" prop="actualCheckoutDate">
        <el-date-picker
          v-model="form.actualCheckoutDate"
          type="date"
          placeholder="年/月/日"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" size="large"> 取消 </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
          提交退住申请
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { debounce } from 'lodash-es'
import { applyWithdraw } from '@/api/application'

interface CheckoutApplicationForm {
  originalCheckoutDate: string
  actualCheckoutDate: string
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
  submit: [data: CheckoutApplicationForm & { orderId?: number }]
}>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<CheckoutApplicationForm>({
  originalCheckoutDate: '',
  actualCheckoutDate: ''
})

const rules: FormRules = {
  actualCheckoutDate: [{ required: true, message: '请选择实际退住日期', trigger: 'change' }]
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
  form.actualCheckoutDate = ''

  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleCancel = () => {
  handleClose()
}

const handleClose = () => {
  visible.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

const resetForm = () => {
  form.originalCheckoutDate = ''
  form.actualCheckoutDate = ''
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

    emit('submit', submitData)
    await applyWithdraw(submitData)

    ElMessage.success('退住申请提交成功，请按时办理退住手续')
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('退住申请提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}, 300)
</script>
