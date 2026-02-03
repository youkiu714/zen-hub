<template>
  <div class="section">
    <div class="section-header">
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

    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { FormInstance, FormRules } from 'element-plus'
import type { LodgingInfo } from '@/types'
import { useUserStore } from '@/store/modules/user'

type LocalLodging = LodgingInfo & { agreement: boolean; }


const userStore = useUserStore()


const props = defineProps<{ modelValue: LocalLodging }>()
const emit = defineEmits<{ 'update:modelValue': [LocalLodging] }>()
const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

form.value.applicationType = 3 // 直通车

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

const rules = reactive<FormRules>({
  checkinDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  checkoutDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
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
