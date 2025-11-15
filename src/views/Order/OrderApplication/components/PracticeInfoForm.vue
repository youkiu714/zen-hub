<template>
  <div class="section">
    <div class="section-header">
      <el-icon><Reading /></el-icon>
      <span>学修情况{{ form.hasTakenPrecepts }}</span>
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
        <el-col :span="8">
          <el-form-item label="皈依时间" prop="refugeTakenDate">
            <el-date-picker
              v-model="form.refugeTakenDate"
              type="date"
              placeholder="yyyy/mm/dd"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="皈依寺庙" prop="refugeTemple">
            <el-input v-model="form.refugeTemple" placeholder="请输入皈依寺庙" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="是否受戒" prop="hasTakenPrecepts">
            <el-radio-group v-model="form.hasTakenPrecepts">
              <el-radio :label="0" key="0">无</el-radio>
              <el-radio :label="1" key="1">居士五戒</el-radio>
              <el-radio :label="2" key="2">八戒</el-radio>
              <el-radio :label="3" key="3">八关斋戒</el-radio>
              <el-radio :label="4" key="4">菩萨戒</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="过往学修/承担经历" prop="pastPracticeExperience">
            <el-input
              v-model="form.pastPracticeExperience"
              type="textarea"
              :rows="4"
              placeholder="请输入过往学修/承担经历"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="现参加承担/学修" prop="currentPracticeExperience">
            <el-input
              v-model="form.currentPracticeExperience"
              type="textarea"
              :rows="4"
              placeholder="请输入现参加承担/学修"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="来崇恩寺的次数及时间" prop="visitRecords">
            <el-input
              v-model="form.visitRecords"
              type="textarea"
              :rows="4"
              placeholder="请输入来崇恩寺的次数及时间"
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
import { Reading } from '@element-plus/icons-vue'
import type { PracticeInfo } from '@/types'
import { useFormValidationRules } from '@/views/Order/OrderApplication/CheckHook'

const props = defineProps<{ modelValue: PracticeInfo }>()
const emit = defineEmits<{ 'update:modelValue': [PracticeInfo] }>()
const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const disabledDate = (time: Date) => time.getTime() > Date.now()

const vr = useFormValidationRules()
const rules = reactive<FormRules>({
  refugeTakenDate: [{ required: true, message: '请选择皈依时间', trigger: 'change' }],
  refugeTemple: [
    { required: true, message: '请输入皈依寺庙', trigger: 'blur' },
    { min: 2, max: 50, message: '皈依寺庙名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
//   hasTakenPrecepts: [
//     { required: true, message: '请选择是否受戒', trigger: 'change' },
//   ],
  pastPracticeExperience: [{ required: true, message: '请输入过往学修/承担经历', trigger: 'blur' }],
  currentPracticeExperience: [
    { required: true, message: '请输入现参加承担/学修', trigger: 'blur' }
  ],
  visitRecords: [{ required: true, message: '请输入来崇恩寺的次数及时间', trigger: 'blur' }]
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
