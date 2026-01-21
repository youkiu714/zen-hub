<template>
  <div class="section">
    <div class="section-header">
      <div class="section-header__left">
        <el-icon>
          <User />
        </el-icon>
        <span>基本信息</span>
      </div>
      <div class="section-header__right">
        <slot name="headerRight" />
      </div>
    </div>
    <!-- 头像上传 -->
    <div class="photo-upload">
      <div class="avatar-wrapper" @mouseenter="isHovering = true" @mouseleave="isHovering = false"
        v-loading="isUploading">
        <img :src="form.photoUrl" class="avatar" />
        <div v-if="isHovering" class="upload-overlay">
          <el-upload action="#" :show-file-list="false" :auto-upload="false" :on-change="handleAvatarChange"
            accept=".jpg,.jpeg,.png" :limit="1" :disabled="isUploading">
            <div class="camera-icon">
              <el-icon v-if="isHovering">
                <Camera />
              </el-icon>
            </div>
          </el-upload>
        </div>
      </div>
      <div class="upload-tips">
        <p>点击上传个人照片</p>
        <p>支持 JPG、PNG 、JPEG格式，大小不超过 10MB</p>
      </div>
    </div>

    <el-form ref="formRef" class="form-content" label-position="top" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="姓名" prop="name" required>
            <el-input v-model="form.name" placeholder="请输入姓名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="form.idCard" placeholder="请输入18位身份证号" clearable max="18" @change="handleIdCardChange" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别" prop="gender" required>
            <el-select v-model="form.gender" placeholder="请选择性别" clearable>
              <el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="年龄" prop="age">
            <el-input v-model="form.age" placeholder="请输入年龄" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="出生年月" prop="birthDate">
            <el-date-picker v-model="form.birthDate" type="date" placeholder="yyyy/mm/dd" format="YYYY/MM/DD"
              value-format="YYYY-MM-DD" :disabled-date="disabledBirthDate" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="民族" prop="ethnic">
            <el-select v-model="form.ethnic" placeholder="请选择民族" clearable>
              <el-option v-for="item in ethnicOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="电话号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码" clearable max="11" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="微信号" prop="weChat">
            <el-input v-model="form.weChat" placeholder="请输入微信号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="婚姻状况" prop="marital">
            <el-select v-model="form.marital" placeholder="请选择婚姻状况" clearable>
              <el-option v-for="item in maritalOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 省市联动 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="常住地省市" prop="provinceCity">
            <el-cascader v-model="provinceCity" :options="provinceAndCityData as CascaderOption[]"
              :props="{ checkStrictly: true, emitPath: true, showAllLevels: false }" placeholder="请选择省份/城市" clearable
              @change="handleProvinceCityChange" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入详细地址，包括街道、门牌号等" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最高学历" prop="education">
            <el-select v-model="form.education" placeholder="请选择学历" clearable>
              <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="毕业院校" prop="school">
            <el-autocomplete v-model="form.school" :fetch-suggestions="querySearchNone" placeholder="请输入毕业院校名称"
              clearable style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="专业" prop="major">
            <el-input v-model="form.major" placeholder="请输入所学专业" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职业" prop="occupation">
            <el-autocomplete v-model="form.occupation" :fetch-suggestions="querySearchNone" placeholder="请输入职业，或选择'无'"
              clearable style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="技能特长" prop="skills">
            <el-input v-model="form.skills" placeholder="请输入技能特长，多个技能用逗号分隔" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 紧急联系人 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="紧急联系人1" prop="emergencyContacts.0.contactName">
            <el-input v-model="form.emergencyContacts[0].contactName" placeholder="请输入紧急联系人姓名" clearable
              maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="emergencyContacts.0.contactPhone">
            <el-input v-model="form.emergencyContacts[0].contactPhone" placeholder="请输入紧急联系人电话号码" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="紧急联系人2" prop="emergencyContacts.1.contactName">
            <el-input v-model="form.emergencyContacts[1].contactName" placeholder="请输入紧急联系人姓名" clearable
              maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="emergencyContacts.1.contactPhone">
            <el-input v-model="form.emergencyContacts[1].contactPhone" placeholder="请输入紧急联系人电话号码" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="疾病史" prop="diseaseHistory">
            <el-autocomplete v-model="form.diseaseHistory" :fetch-suggestions="querySearchNone" placeholder="重视业果，请诚实回答"
              clearable style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="服药史" prop="medicationHistory">
            <el-autocomplete v-model="form.medicationHistory" :fetch-suggestions="querySearchNone"
              placeholder="重视业果，请诚实回答" clearable style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="传染病史" prop="infectiousHistory">
            <el-autocomplete v-model="form.infectiousHistory" :fetch-suggestions="querySearchNone"
              placeholder="重视业果，请诚实回答" clearable style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { User, Camera } from '@element-plus/icons-vue'
import { provinceAndCityData } from 'element-china-area-data'
import { uploadAvatar } from '@/api/upload'
import { useFormValidationRules } from '@/views/Order/OrderApplication/CheckHook'
import avatarImg from '@/assets/avatar.png'
import { disabledBirthDate } from '@/utils/format-date'

import type { BasicInfo } from '@/types'
import type { CascaderOption, CascaderValue } from 'element-plus'

// 定义一个通用的建议列表
const noneSuggestion = [{ value: '无' }]

// 定义 fetch-suggestions 回调函数
const querySearchNone = (queryString: string, cb: (arg: any) => void) => {
  // 如果用户没有输入，或者是输入了 '无' 的相关部分（其实这里简单点直接返回 '无' 也可以）
  // 这里的逻辑是：无论用户输入什么，只要下拉框弹出，就始终提供 '无' 这个选项供点击
  // 当然，您也可以根据 queryString 做过滤，但对于由 "无" 组成的列表，直接返回即可
  cb(noneSuggestion)
}

/** 双向绑定：v-model */
const props = defineProps<{ modelValue: BasicInfo }>()
const emit = defineEmits<{ 'update:modelValue': [BasicInfo] }>()
const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

/** 省市联动 */
const provinceCity = ref<string[]>()
watch(provinceCity, (val) => {
  if (val && val.length === 2) {
    form.value.province = val[0]
    form.value.city = val[1]
  }
})

const handleProvinceCityChange = (val: CascaderValue | null | undefined) => {
  console.log('val:', val)
  if (!val || (Array.isArray(val) && val.length === 0)) {
    form.value.provinceCity = val as string[]
  } else if (Array.isArray(val)) {
    form.value.provinceCity = val as string[]
  }
}

/** 选项 */
const ethnicOptions = ['汉族', '满族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族']
const maritalOptions = ['未婚', '已婚', '离异', '丧偶']
const educationOptions = ['高中及以下', '大专', '本科', '硕士', '博士及以上']
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

/** 校验规则 */
const validateContactName1 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入紧急联系人姓名'))
  } else if (value === form.value.name) {
    callback(new Error('紧急联系人不能是本人'))
  } else if (value === form.value.emergencyContacts[1].contactName) {
    callback(new Error('两个紧急联系人姓名不能重复'))
  } else {
    callback()
  }
}
const validateContactName2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入紧急联系人姓名'))
  } else if (value === form.value.name) {
    callback(new Error('紧急联系人不能是本人'))
  } else if (value === form.value.emergencyContacts[0].contactName) {
    callback(new Error('两个紧急联系人姓名不能重复'))
  } else {
    callback()
  }
}
// 校验联系人1的电话
const validatePhone1 = (rule, value, callback) => {
  if (value === '') {
    callback() // 电话为空时可能由required规则处理，或者允许为空，视需求而定
  } else if (value === form.value.emergencyContacts[1].contactPhone) {
    callback(new Error('两个紧急联系人电话不能一致'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

// 校验联系人2的电话
const validatePhone2 = (rule, value, callback) => {
  if (value === '') {
    callback()
  } else if (value === form.value.emergencyContacts[0].contactPhone) {
    callback(new Error('两个紧急联系人电话不能一致'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

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
  birthDate: [{ required: true, message: '请选择出生年月', trigger: 'change' }],
  idCard: vr.idCard,
  ethnic: [{ required: true, message: '请选择民族', trigger: 'change' }],
  mobile: vr.mobile,
  // weChat: [
  //   { required: true, message: '请填写微信号', trigger: 'blur' },
  //   { min: 1, max: 50, message: '微信号长度应在1-50个字符之间', trigger: 'blur' }
  // ],
  marital: [{ required: true, message: '请选择婚姻状况', trigger: 'change' }],
  provinceCity: [{ required: true, message: '请选择省份', trigger: 'change' }],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 3, max: 200, message: '详细地址长度应在3-200个字符之间', trigger: 'blur' }
  ],
  // education: [{ required: true, message: '请选择最高学历', trigger: 'change' }],
  // school: [{ required: true, message: '请输入毕业院校', trigger: 'blur' }],
  // major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  // occupation: [{ required: true, message: '请输入职业', trigger: 'blur' }],
  // skills: [{ required: true, max: 500, message: '技能特长描述不能超过500个字符', trigger: 'blur' }],
  'emergencyContacts.0.contactName': [
    { required: true, validator: validateContactName1, trigger: 'blur' }
  ],
  // 紧急联系人电话校验
  'emergencyContacts.0.contactPhone': [
    { validator: validatePhone1, trigger: 'blur', required: true }
  ],
  // 'emergencyContacts.1.contactName': [
  //   { required: true, validator: validateContactName2, trigger: 'blur' }
  // ],
  // 'emergencyContacts.1.contactPhone': [
  //   { validator: validatePhone2, trigger: 'blur', required: true }
  // ],
  diseaseHistory: [
    { required: true, max: 200, message: '疾病史描述不能超过200个字符', trigger: 'blur' }
  ],
  medicationHistory: [
    { required: true, max: 200, message: '服药史描述不能超过200个字符', trigger: 'blur' }
  ],
  infectiousHistory: [
    { required: true, max: 200, message: '传染病史描述不能超过200个字符', trigger: 'blur' }
  ]
})

/** 头像上传 */
const isHovering = ref(false)
const isUploading = ref(false)

const handleAvatarChange = async (file: any) => {
  const isLt2M = file.raw.size / 1024 / 1024 < 10
  if (!isLt2M) return ElMessage.error('图片大小不能超过 10MB!')
  const allowed = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowed.includes(file.raw.type)) return ElMessage.error('只支持 JPG、PNG 格式的图片!')

  try {
    isUploading.value = true
    const res = await uploadAvatar(file.raw)

    console.log('res:', res)

    const url = String(res.url).substring('/uploads'.length)

    form.value.photoUrl = 'http://49.232.241.94/' + url
  } catch (e) {
    ElMessage.error('上传失败，请稍后重试')
  } finally {
    isUploading.value = false
  }
}

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

  // 4. 赋值给表单的出生日期 (格式: YYYY-MM-DD)
  form.value.birthDate = `${year}-${month}-${day}`

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
}

.section-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header__right {
  margin-left: auto;
}

.upload-tips p {
  color: #8b4513;
  font-weight: 500;
  font-size: 12px;
}

.section-header .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.photo-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  flex-direction: column;
}

.avatar-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .upload-overlay {
  opacity: 1;
}

.camera-icon .el-icon {
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  font-size: 2rem;
  line-height: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.camera-icon .el-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}

.upload-tips {
  margin-top: 10px;
  font-size: 12px;
  color: #d2b48c;
  text-align: center;
}
</style>
