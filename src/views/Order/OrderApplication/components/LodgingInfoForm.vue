<template>
  <div class="section">
    <div class="section-header">
      <el-icon><House /></el-icon>
      <span>挂单信息</span>
    </div>

    <el-form
      ref="formRef"
      class="form-content"
      label-position="top"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="申请短住开始时间" prop="checkinDate">
            <el-date-picker
              v-model="form.checkinDate"
              type="date"
              placeholder="yyyy/mm/dd"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledCheckinDate"
              @change="handleCheckinDateChange"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请短住结束时间" prop="checkoutDate">
            <el-date-picker
              v-model="form.checkoutDate"
              type="date"
              placeholder="yyyy/mm/dd"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledCheckoutDate"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="出发行程时间" prop="departureDate">
            <el-date-picker
              v-model="form.departureDate"
              type="date"
              placeholder="yyyy/mm/dd"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledCheckinDate"
              @change="handleCheckinDateChange"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="离开行程日期" prop="returnDate">
            <el-date-picker
              v-model="form.returnDate"
              type="date"
              placeholder="yyyy/mm/dd"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledCheckoutDate"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="所属部组" prop="departmentCode">
            <el-select v-model="form.departmentCode" placeholder="请选择所属部组" clearable>
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
          <el-form-item label="用斋选择" prop="mealPreference">
            <el-select v-model="form.mealPreference" placeholder="请选择所属部组" clearable>
              <el-option
                v-for="item in mealOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="挂单申请类型" prop="applicationTypeOptions">
            <el-select
              v-model="form.applicationTypeOptions"
              placeholder="请选择挂单申请类型"
              clearable
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
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="来寺因缘" prop="causeOfVisit">
            <el-input
              v-model="form.causeOfVisit"
              type="textarea"
              :rows="3"
              placeholder="请输入来寺因缘"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="短住的原因及期许" prop="shortStayReason">
            <el-input
              v-model="form.shortStayReason"
              type="textarea"
              :rows="3"
              placeholder="请输入短住的原因及期许"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="特殊需求" prop="specialRequest">
            <el-input
              v-model="form.specialRequest"
              type="textarea"
              :rows="3"
              placeholder="请输入特殊需求"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="推荐人" prop="recommenderName">
            <el-input v-model="form.recommenderName" placeholder="请输入推荐人姓名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="推荐人联系方式" prop="recommenderPhone">
            <el-input
              v-model="form.recommenderPhone"
              placeholder="请输入推荐人联系方式"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="推荐人评价" prop="recommenderComment">
            <el-input
              v-model="form.recommenderComment"
              type="textarea"
              :rows="3"
              placeholder="请输入推荐人评价"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { FormInstance, FormRules } from 'element-plus'
import { House } from '@element-plus/icons-vue'
import type { LodgingInfo } from '@/types'
import { useFormValidationRules } from '@/views/Order/OrderApplication/CheckHook'
import { departmentOptions, mealOptions, applicationTypeOptions} from "@/utils/constants"

type LocalLodging = LodgingInfo & { agreement: boolean; selfEvaluation?: string }

const props = defineProps<{ modelValue: LocalLodging }>()
const emit = defineEmits<{ 'update:modelValue': [LocalLodging] }>()
const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})


const disabledCheckinDate = (time: Date) => time.getTime() < Date.now() - 24 * 60 * 60 * 1000
const disabledCheckoutDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (time.getTime() < today.getTime()) return true
  if (form.value.checkinDate) {
    const c = new Date(form.value.checkinDate)
    c.setHours(0, 0, 0, 0)
    return time.getTime() <= c.getTime()
  }
  return false
}
const handleCheckinDateChange = () => {
  if (form.value.checkoutDate && form.value.checkinDate) {
    const inTs = new Date(form.value.checkinDate).getTime()
    const outTs = new Date(form.value.checkoutDate).getTime()
    if (outTs <= inTs) form.value.checkoutDate = ''
  }
}

const vr = useFormValidationRules()

const rules = reactive<FormRules>({
  checkinDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  checkoutDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  departureDate: [{ required: true, message: '请选择出发行程时间', trigger: 'change' }],
  returnDate: [{ required: true, message: '请选择离开行程时间', trigger: 'change' }],
  specialRequest: [{ required: true, message: '请输特殊需求', trigger: 'blur' }],
  shortStayReason: [{ required: true, message: '请输入短住原因及期许', trigger: 'blur' }],
  causeOfVisit: [{ required: true, message: '请输入短住原因及期许', trigger: 'blur' }],
  recommenderPhone: vr.recommenderPhone,
  recommenderComment: [{ required: true, message: '请输入推荐人评价', trigger: 'blur' }],
  selfEvaluation: [{ required: true, message: '请输入自我评价', trigger: 'blur' }],
  recommenderName: [{ required: true, message: '请输入推荐人姓名', trigger: 'blur' }],
  departmentCode: [{ required: true, message: '请选择所属部组', trigger: 'change' }],
  mealPreference: [{ required: true, message: '请选择用斋类型', trigger: 'change' }],
  applicationTypeOptions: [{ required: true, message: '请申请挂单类型', trigger: 'change' }]
})

const formRef = ref<FormInstance>()
const validate = () => formRef.value?.validate()
defineExpose({ validate, formRef })
</script>

<style scoped lang="scss">
.section {
  margin-bottom: 32px;
  :deep(.el-select) {
    width: 100%;
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #5a3e2b;
  font-weight: bold;
  font-size: 18px;
}

.section-header .el-icon {
  margin-right: 8px;
  font-size: 20px;
}
</style>
