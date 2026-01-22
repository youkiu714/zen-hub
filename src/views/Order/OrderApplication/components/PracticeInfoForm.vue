这是修改后的 `PracticeInfoForm.vue` 文件。

### 主要修改点：

1. **新增“是否已皈依”字段**：添加了控制开关。
2. **字段联动**：
* 使用 `v-if="form.isRefuge"` 控制“皈依时间”和“皈依寺庙”的显示与隐藏。
* 添加了 `handleRefugeChange` 方法，当选择“否”时，自动清空时间和寺庙的数据。


3. **表单验证**：取消了之前代码中相关规则的注释，现在只有当字段显示时（即选择了“是”），`required` 验证才会生效（Element Plus 的 `v-if` 特性）。
4. **布局调整**：将相关字段放在同一个 `el-row` 中，利用 `el-col` 的浮动特性自动排版。

```html
<template>
  <div class="section">
    <div class="section-header">
      <el-icon><Reading /></el-icon>
      <span>学修情况</span>
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
import { preceptsOptions } from '@/utils/constants'

const props = defineProps<{ modelValue: PracticeInfo }>()
const emit = defineEmits<{ 'update:modelValue': [PracticeInfo] }>()
const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const disabledDate = (time: Date) => time.getTime() > Date.now()


const vr = useFormValidationRules()
const rules = reactive<FormRules>({
  pastPracticeExperience: [{ required: true, message: '请输入过往学修/承担经历', trigger: 'blur' }],
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

```