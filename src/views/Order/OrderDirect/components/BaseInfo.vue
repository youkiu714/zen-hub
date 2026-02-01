<template>
  <div class="section">
    <div class="section-header">
      <div class="section-header__left">
        <span>基本信息</span>
      </div>
    </div>

    <el-form ref="formRef" class="form-content" label-position="top" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name" required>
            <el-input v-model="form.name" placeholder="请输入姓名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="form.idCard" placeholder="请输入18位身份证号" clearable max="18" @change="handleIdCardChange" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender" required>
            <el-select v-model="form.gender" placeholder="请选择性别" clearable>
              <el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄" prop="age">
            <el-input v-model="form.age" placeholder="请输入年龄" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="出生年月" prop="birthDate">
            <el-date-picker v-model="form.birthDate" type="date" placeholder="yyyy/mm/dd" format="YYYY/MM/DD"
              value-format="YYYY-MM-DD" :disabled-date="disabledBirthDate" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="电话号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码" clearable max="11" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { FormInstance, FormRules } from 'element-plus'
import { useFormValidationRules } from '@/views/Order/OrderApplication/CheckHook'
import avatarImg from '@/assets/avatar.png'
import { disabledBirthDate } from '@/utils/format-date'


/** 双向绑定：v-model */
const props = defineProps<{ modelValue: BasicInfo }>()
const emit = defineEmits<{ 'update:modelValue': [BasicInfo] }>()
const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

/** 选项 */
const genderOptions = [
  {
    label: '男',
    value: '1'
  },
  {
    label: '女',
    value: '2'
  }
]

const vr = useFormValidationRules()

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '姓名不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应在2-20个字符之间', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [
    { required: true, message: '请输入年龄', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入年龄'))
        } else if (!/^\d+$/.test(value)) {
          callback(new Error('年龄必须是数字'))
        } else if (parseInt(value) < 7 || parseInt(value) > 75) {
          callback(new Error('年龄必须在7-75之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  idCard: vr.idCard,
  mobile: vr.mobile,
})


/**
 * 处理证件号变更事件
 * 提取生日并计算年龄
 */
const handleIdCardChange = (val: string) => {
  // 1. 基础校验：必须是18位
  if (!val || val.length !== 18) {
    return
  }

  // 2. 提取出生年月日字符串
  const birthStr = val.substring(6, 14)
  const year = birthStr.substring(0, 4)
  const month = birthStr.substring(4, 6)
  const day = birthStr.substring(6, 8)

  // 3. 校验日期合法性 (防止例如 20201332 这种非法日期)
  const birthDateObj = new Date(`${year}-${month}-${day}`)
  if (isNaN(birthDateObj.getTime())) {
    return // 日期格式不正确
  }

  // 5. 计算周岁年龄
  const today = new Date()
  let age = today.getFullYear() - birthDateObj.getFullYear()

  // 还要比较月份和日期，如果还没过生日，年龄减 1
  const m = today.getMonth() - birthDateObj.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--
  }

  form.value.age = age

  // 获取第17位字符 (索引是16)
  const genderChar = val.substring(16, 17)
  const genderNum = parseInt(genderChar)

  if (!isNaN(genderNum)) {
    form.value.gender = genderNum % 2 === 1 ? '1' : '2'
  }
}

const formRef = ref<FormInstance>()
const validate = () => formRef.value?.validate()
// 控制弹窗显示
const showPersonSelector = ref(false) // 控制弹窗显示

onMounted(() => {
  if (form.value.photoUrl === '') {
    form.value.photoUrl = avatarImg
  }
})

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
  justify-content: space-between;
}

.section-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header__right {
  margin-left: auto;
}

.section-header .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

@keyframes rotating {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}


</style>
