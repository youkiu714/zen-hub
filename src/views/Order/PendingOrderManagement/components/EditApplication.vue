<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改挂单信息"
    width="800px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="left"
    >
      <el-form-item label="申请类型" prop="applicationType">
        <el-radio-group v-model="formData.applicationType">
          <el-radio :value="0">短住</el-radio>
          <el-radio :value="1">长住</el-radio>
          <el-radio :value="2">团体</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预计入住日期" prop="checkinDate">
            <el-date-picker
              v-model="formData.checkinDate"
              type="date"
              placeholder="请选择入住日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled-date="disabledCheckinDate"
              @change="handleCheckinDateChange"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计退住日期" prop="checkoutDate">
            <el-date-picker
              v-model="formData.checkoutDate"
              type="date"
              placeholder="请选择退住日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled-date="disabledCheckoutDate"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item 
        v-if="formData.applicationType === 0" 
        label="短住原因及期许" 
        prop="shortStayReaso"     >
        <el-input
          v-model="formData.shortStayReason"
          type="textarea"
          :rows="4"
          placeholder="请输入短住原因及期许"
          resize="none"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="自我评价" prop="selfEvaluation">
        <el-input
          v-model="formData.selfEvaluation"
          type="textarea"
          :rows="4"
          placeholder="请输入自我评价"
          resize="none"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { updateLodgingInfo } from '@/api/application'

// 定义组件属性
interface Props {
  modelValue: boolean
  applicationData?: ApplicationEditData
  applicationId?: number
}

// 定义表单数据类型
interface ApplicationEditData {
  applicationType: number
  checkinDate: string
  checkoutDate: string
  shortStayReason: string
  selfEvaluation: string
}

// 定义事件
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: ApplicationEditData, id: number]
}>()

// 接收属性
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  applicationId: 0,
  applicationData: () => ({
    applicationType: 0,
    checkinDate: '',
    checkoutDate: '',
    shortStayReason: '',
    selfEvaluation: ''
  })
})

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<ApplicationEditData>({
  applicationType: 0,
  checkinDate: '',
  checkoutDate: '',
  shortStayReason: '',
  selfEvaluation: ''
})

// 表单验证规则
const formRules: FormRules = {
  applicationType: [
    { required: true, message: '请选择申请类型', trigger: 'change' }
  ],
  checkinDate: [
    { required: true, message: '请选择入住日期', trigger: 'change' }
  ],
  checkoutDate: [
    { required: true, message: '请选择退住日期', trigger: 'change' }
  ],
  shortStayReason: [
    { 
      validator: (rule, value, callback) => {
        if (formData.applicationType === 0 && !value) {
          callback(new Error('请输入短住原因及期许'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  selfEvaluation: [
    { required: true, message: '请输入自我评价', trigger: 'blur' }
  ]
}

// 监听弹窗显示状态
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.applicationData) {
    // 初始化表单数据
    Object.assign(formData, props.applicationData)
  }
})

watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 日期禁用逻辑
const disabledCheckinDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const disabledCheckoutDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (time.getTime() < today.getTime()) {
    return true
  }
  
  if (formData.checkinDate) {
    const checkinTime = new Date(formData.checkinDate)
    checkinTime.setHours(0, 0, 0, 0)
    return time.getTime() <= checkinTime.getTime()
  }
  
  return false
}

// 处理入住日期变化
const handleCheckinDateChange = () => {
  if (formData.checkoutDate && formData.checkinDate) {
    const checkinTime = new Date(formData.checkinDate)
    const checkoutTime = new Date(formData.checkoutDate)
    
    if (checkoutTime.getTime() <= checkinTime.getTime()) {
      formData.checkoutDate = ''
    }
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 调用修改挂单信息API
    await updateLodgingInfo(props.applicationId, {
      lodging: {
        applicationType: formData.applicationType,
        checkinDate: formData.checkinDate,
        checkoutDate: formData.checkoutDate,
        shortStayReason: formData.shortStayReason,
        selfEvaluation: formData.selfEvaluation
      }
    })
    
    emit('submit', { ...formData }, props.applicationId)
    ElMessage.success('修改成功！')
    handleClose()
  } catch (error) {
    console.error('修改失败:', error)
    ElMessage.error('修改失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-textarea__inner) {
  resize: none !important;
}
</style>

