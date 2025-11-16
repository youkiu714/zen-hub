<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改挂单信息"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
    modal-class="edit-application-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="top"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="申请类型" prop="applicationType">
            <el-select
              v-model="formData.applicationType"
              placeholder="请选择申请类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in applicationTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属部族" prop="departmentCode">
            <el-select
              v-model="formData.departmentCode"
              placeholder="请选择所属部族"
              style="width: 100%"
            >
              <el-option
                v-for="item in departmentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="用餐选择" prop="mealPreference">
            <el-select
              v-model="formData.mealPreference"
              placeholder="请选择用餐类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in mealOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="短住开始时间" prop="checkinDate">
            <el-date-picker
              v-model="formData.checkinDate"
              type="date"
              placeholder="请选择开始时间"
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
          <el-form-item label="短住结束时间" prop="checkoutDate">
            <el-date-picker
              v-model="formData.checkoutDate"
              type="date"
              placeholder="请选择结束时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled-date="disabledCheckoutDate"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="行程到达时间" prop="departureDate">
            <el-date-picker
              v-model="formData.departureDate"
              type="date"
              placeholder="请选择到达时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled-date="disabledCheckinDate"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行程离开时间" prop="returnDate">
            <el-date-picker
              v-model="formData.returnDate"
              type="date"
              placeholder="请选择离开时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled-date="disabledCheckoutDate"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="短住期许" prop="shortStayReason">
        <el-input
          v-model="formData.shortStayReason"
          type="textarea"
          :rows="2"
          placeholder="请输入短住期许"
          resize="none"
        />
      </el-form-item>

      <el-form-item label="自我评价" prop="selfEvaluation">
        <el-input
          v-model="formData.selfEvaluation"
          type="textarea"
          :rows="2"
          placeholder="请输入自我评价"
          resize="none"
        />
      </el-form-item>

      <el-form-item label="推荐人评价" prop="recommenderComment">
        <el-input
          v-model="formData.recommenderComment"
          type="textarea"
          :rows="2"
          placeholder="请输入推荐人评价"
          resize="none"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { updateLodgingInfo, getApplicationById } from '@/api/application'
import { applicationTypeOptions, departmentOptions, mealOptions } from '@/utils/constants'
import { debounce } from 'lodash-es'

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
  departmentCode: string
  mealPreference: number
  departureDate: string
  returnDate: string
  recommenderComment: string
}

// 定义事件
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ApplicationEditData, id: number]
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
    selfEvaluation: '',
    departmentCode: '',
    mealPreference: 0,
    departureDate: '',
    returnDate: '',
    recommenderComment: ''
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
  selfEvaluation: '',
  departmentCode: '',
  mealPreference: 0,
  departureDate: '',
  returnDate: '',
  recommenderComment: ''
})

// 表单验证规则
const formRules: FormRules = {
  applicationType: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  checkinDate: [{ required: true, message: '请选择短住开始时间', trigger: 'change' }],
  checkoutDate: [{ required: true, message: '请选择短住结束时间', trigger: 'change' }],
  departureDate: [{ required: true, message: '请选择行程到达时间', trigger: 'change' }],
  returnDate: [{ required: true, message: '请选择行程离开时间', trigger: 'change' }],
  departmentCode: [{ required: true, message: '请选择所属部族', trigger: 'change' }],
  mealPreference: [{ required: true, message: '请选择用餐类型', trigger: 'change' }],
  shortStayReason: [{ required: true, message: '请输入短住期许', trigger: 'blur' }],
  selfEvaluation: [{ required: true, message: '请输入自我评价', trigger: 'blur' }],
  recommenderComment: [{ required: true, message: '请输入推荐人评价', trigger: 'blur' }]
}

// 获取申请详情数据
const getApplicationDetail = async (applicationId: number) => {
  if (!applicationId) return

  try {
    loading.value = true
    const data = await getApplicationById(applicationId)

    if (data) {
      const departmentCode =
        data.lodging?.departmentCode || data.basic?.departmentCode || data.departmentCode || ''
      
      formData.applicationType = data.lodging?.applicationType || 0
      formData.checkinDate = data.lodging?.checkinDate || ''
      formData.checkoutDate = data.lodging?.checkoutDate || ''
      formData.shortStayReason = data.lodging?.shortStayReason || ''
      formData.selfEvaluation = data.lodging?.selfEvaluation || ''
      formData.departmentCode = departmentCode
      formData.mealPreference = data.lodging?.mealPreference || 0
      formData.departureDate = data.lodging?.departureDate || ''
      formData.returnDate = data.lodging?.returnDate || ''
      formData.recommenderComment = data.lodging?.recommenderComment || ''
    }
  } catch (error) {
    console.error('获取申请详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  async (newVal) => {
    dialogVisible.value = newVal
    if (newVal && props.applicationId) {
      await getApplicationDetail(props.applicationId)
    }
  }
)

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

// 提交表单 - 添加防抖控制
const handleSubmit = debounce(async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await updateLodgingInfo(props.applicationId, {
      basic: {
        departmentCode: formData.departmentCode
      },
      lodging: {
        applicationType: formData.applicationType,
        checkinDate: formData.checkinDate,
        checkoutDate: formData.checkoutDate,
        shortStayReason: formData.shortStayReason,
        selfEvaluation: formData.selfEvaluation,
        mealPreference: formData.mealPreference,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        recommenderComment: formData.recommenderComment
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
}, 500) // 500ms 防抖延迟
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

<style lang="scss">
.edit-application-dialog {
  .el-dialog {
    border-radius: 12px;
  }
  .el-dialog__header {
    font-weight: 600;
  }
}
</style>
