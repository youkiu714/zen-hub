<template>
  <div class="lodging-application-page">


    <div class="page-header">
      <h1 class="form-title">挂单信息申请</h1>
      <p class="form-desc">请填写完整的挂单申请信息，带 * 的为必填项</p>
    </div>

    <el-card class="form-container">

      <!-- 基本信息 -->
      <div class="section">
        <div class="section-header">
          <el-icon>
            <User />
          </el-icon>
          <span>基本信息</span>
        </div>

        <div class="photo-upload">
          <div class="avatar-wrapper" @mouseenter="isHovering = true" @mouseleave="isHovering = false">
            <img v-if="formData.basic.photoUrl" :src="formData.basic.photoUrl" class="avatar" />
            <div v-else class="avatar-placeholder" style="background-image: url('https://maas-log-prod.cn-wlcb.ufileos.com/anthropic/79a46281-857c-4761-92a4-56cffacb84b1/084d620dc54f2101e9d61fce4c7a297c.png?UCloudPublicKey=TOKEN_e15ba47a-d098-4fbd-9afc-a0dcf0e4e621&Expires=1762590395&Signature=ZKpndF/W9GrvqDx7e/w5tzOOfFM=');
                     background-size: cover;
                     background-position: center;
                     background-repeat: no-repeat;">
            </div>
            <div v-if="isHovering || isUploading" class="upload-overlay">
              <el-upload action="#" :show-file-list="false" :auto-upload="false" :on-change="handleAvatarChange"
                accept=".jpg,.jpeg,.png" :limit="1" :disabled="isUploading">
                <div class="camera-icon">
                  <el-icon v-if="!isUploading">
                    <Camera />
                  </el-icon>
                  <el-icon v-else class="is-loading">
                    <Loading />
                  </el-icon>
                </div>
              </el-upload>
            </div>
          </div>
          <div class="upload-tips">
            <p>点击上传个人照片</p>
            <p>支持 JPG、PNG 格式，大小不超过 2MB</p>
          </div>
        </div>

        <el-form label-position="top" ref="basicFormRef" :model="formData.basic" :rules="basicRules" label-width="120px"
          class="form-content">
          <!-- 姓名、性别、民族、电话 -->
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="姓名 *" prop="name">
                <el-input v-model="formData.basic.name" placeholder="请输入姓名" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="formData.basic.gender">
                  <el-radio :value="1">男</el-radio>
                  <el-radio :value="2">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="民族 *" prop="ethnic">
                <el-select v-model="formData.basic.ethnic" placeholder="请选择民族" clearable>
                  <el-option v-for="item in ethnicOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="电话号码 *" prop="mobile">
                <el-input v-model="formData.basic.mobile" placeholder="请输入手机号码" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 身份证 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="身份证号 *" prop="idCard">
                <el-input v-model="formData.basic.idCard" placeholder="请输入18位身份证号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 预留空间 -->
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="微信号" prop="weChat">
                <el-input v-model="formData.basic.weChat" placeholder="请输入微信号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="婚姻状况" prop="marital">
                <el-select v-model="formData.basic.marital" placeholder="请选择婚姻状况" clearable>
                  <el-option v-for="item in maritalOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 省市联动 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="常住地省市 *" prop="province">
                <el-cascader v-model="provinceCity" :options="provinceCityOptions"
                  :props="{ checkStrictly: true, emitPath: true }" placeholder="请选择省份/城市" clearable
                  @change="handleProvinceCityChange" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="详细地址 *" prop="address">
                <el-input v-model="formData.basic.address" placeholder="请输入详细地址，包括街道、门牌号等" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 新增字段：出生年月、年龄、所属部组 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="出生年月" prop="birthDate">
                <el-date-picker v-model="formData.basic.birthDate" type="date" placeholder="yyyy/mm/dd"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="年龄" prop="age">
                <el-input-number v-model="formData.basic.age" :min="1" :max="120" placeholder="请输入年龄"
                  controls-position="right" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="所属部组" prop="departmentCode">
                <el-select v-model="formData.basic.departmentCode" placeholder="请选择部组" clearable>
                  <el-option label="项目组" value="PROJECT" />
                  <el-option label="学修组" value="READING" />
                  <el-option label="编译组" value="COMPILATION" />
                  <el-option label="其他" value="OTHER" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 学历、院校、专业、技能、职业 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="最高学历" prop="education">
                <el-select v-model="formData.basic.education" placeholder="请选择学历" clearable>
                  <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="毕业院校" prop="school">
                <el-input v-model="formData.basic.school" placeholder="请输入毕业院校名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="专业" prop="major">
                <el-input v-model="formData.basic.major" placeholder="请输入所学专业" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="技能特长" prop="skills">
                <el-input v-model="formData.basic.skills" placeholder="请输入技能特长，多个技能用逗号分隔" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="职业" prop="occupation">
                <el-input v-model="formData.basic.occupation" placeholder="请输入职业" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 紧急联系人 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="紧急联系人1 *" prop="emergencyContacts.0.contactName">
                <el-input v-model="formData.basic.emergencyContacts[0].contactName" placeholder="请输入紧急联系人姓名"
                  clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话 *" prop="emergencyContacts.0.contactPhone">
                <el-input v-model="formData.basic.emergencyContacts[0].contactPhone" placeholder="请输入紧急联系人电话号码"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="紧急联系人2" prop="emergencyContacts.1.contactName">
                <el-input v-model="formData.basic.emergencyContacts[1].contactName" placeholder="请输入紧急联系人姓名"
                  clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话" prop="emergencyContacts.1.contactPhone">
                <el-input v-model="formData.basic.emergencyContacts[1].contactPhone" placeholder="请输入紧急联系人电话号码"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 健康信息 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="疾病史" prop="diseaseHistory">
                <el-select v-model="formData.basic.diseaseHistory" placeholder="无">
                  <el-option v-for="item in diseaseHistoryOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="服药史" prop="medicationHistory">
                <el-select v-model="formData.basic.medicationHistory" placeholder="无">
                  <el-option v-for="item in medicationHistoryOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="传染病史" prop="infectiousHistory">
                <el-select v-model="formData.basic.infectiousHistory" placeholder="无">
                  <el-option v-for="item in infectiousHistoryOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 学修情况 -->
      <div class="section">
        <div class="section-header">
          <el-icon>
            <Reading />
          </el-icon>
          <span>学修情况</span>
        </div>
        <el-form label-position="top" ref="practiceFormRef" :model="formData.practice" :rules="practiceRules"
          label-width="120px" class="form-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="皈依时间" prop="refugeTakenDate">
                <el-date-picker v-model="formData.practice.refugeTakenDate" type="date" placeholder="yyyy/mm/dd"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="皈依寺院" prop="refugeTemple">
                <el-input v-model="formData.practice.refugeTemple" placeholder="请输入皈依寺院名称" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学修年数" prop="yearsOfPractice">
                <el-input-number v-model="formData.practice.yearsOfPractice" :min="0" :max="100" placeholder="请输入学修年数"
                  controls-position="right" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 预留空间或保持为空 -->
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="寺院过往学修/承担经历 *" prop="pastPracticeExperience">
                <el-input v-model="formData.practice.pastPracticeExperience" type="textarea" :rows="4"
                  placeholder="请输入寺院过往学修/承担经历" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="现参加承担/学修" prop="currentPracticeExperience">
                <el-input v-model="formData.practice.currentPracticeExperience" type="textarea" :rows="4"
                  placeholder="请输入现参加承担/学修" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="来崇恩寺的次数及时间" prop="visitRecords">
                <el-input v-model="formData.practice.visitRecords" type="textarea" :rows="4" placeholder="请输入来崇恩寺的次数及时间"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="是否受戒 *" prop="hasTakenPrecepts">
                <el-radio-group v-model="formData.practice.hasTakenPrecepts">
                  <el-radio :value="null">无</el-radio>
                  <el-radio :value="5">居士五戒</el-radio>
                  <el-radio :value="8">八戒</el-radio>
                  <el-radio :value="10">菩萨戒</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 挂单信息 -->
      <div class="section">
        <div class="section-header">
          <el-icon>
            <House />
          </el-icon>
          <span>挂单信息</span>
        </div>
        <el-form label-position="top" ref="lodgingFormRef" :model="formData.lodging" :rules="lodgingRules"
          label-width="120px" class="form-content">
          <!-- 申请类型 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申请类型 *" prop="applicationType">
                <el-select v-model="formData.lodging.applicationType" placeholder="请选择申请类型" clearable>
                  <el-option label="短住" :value="1" />
                  <el-option label="直通车" :value="2" />
                  <el-option label="僧亲" :value="3" />
                  <el-option label="团队挂单" :value="4" />
                  <el-option label="特殊客人" :value="5" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 预留空间 -->
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申请短住开始时间 *" prop="checkinDate">
                <el-date-picker v-model="formData.lodging.checkinDate" type="date" placeholder="yyyy/mm/dd"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请短住结束时间 *" prop="checkoutDate">
                <el-date-picker v-model="formData.lodging.checkoutDate" type="date" placeholder="yyyy/mm/dd"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="短住的原因及期许 *" prop="specialRequest">
                <el-input v-model="formData.lodging.specialRequest" type="textarea" :rows="4" placeholder="请输入短住的原因及期许"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="短住原因及期许（新）" prop="shortStayReason">
                <el-input v-model="formData.lodging.shortStayReason" type="textarea" :rows="4" placeholder="请输入短住原因及期许"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="自我评价" prop="selfEvaluation">
                <el-input v-model="formData.lodging.selfEvaluation" type="textarea" :rows="4" placeholder="请输入自我评价"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 新增字段：来寺因缘、出发行程日期、离开行程日期、用斋选择 -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="出发行程日期" prop="departureDate">
                <el-date-picker v-model="formData.lodging.departureDate" type="date" placeholder="yyyy/mm/dd"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="离开行程日期" prop="returnDate">
                <el-date-picker v-model="formData.lodging.returnDate" type="date" placeholder="yyyy/mm/dd"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用斋选择" prop="mealPreference">
                <el-select v-model="formData.lodging.mealPreference" placeholder="请选择用斋" clearable>
                  <el-option label="无" :value="0" />
                  <el-option label="早斋" :value="1" />
                  <el-option label="午斋" :value="2" />
                  <el-option label="药石" :value="3" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <!-- 预留空间 -->
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="来寺因缘" prop="causeOfVisit">
                <el-input v-model="formData.lodging.causeOfVisit" type="textarea" :rows="4" placeholder="请输入来寺因缘"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="推荐人" prop="recommenderName">
                <el-input v-model="formData.lodging.recommenderName" placeholder="请输入推荐人姓名" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="推荐人联系方式" prop="recommenderPhone">
                <el-input v-model="formData.lodging.recommenderPhone" placeholder="请输入推荐人联系方式" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="推荐人评价" prop="recommenderComment">
                <el-input v-model="formData.lodging.recommenderComment" type="textarea" :rows="4" placeholder="请输入推荐人评价"
                  clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="agreement">
                <el-checkbox v-model="formData.lodging.agreement">
                  本人承诺所填写的信息真实有效，如有虚假信息愿意承担相应责任 *
                </el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 底部按钮 -->
      <div class="form-footer">
        <el-button type="primary" @click="handleSubmit">提交申请</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { applications } from '@/api/pendingOrder';
import { uploadAvatar } from '@/api/upload';
import {
  ref,
  reactive,
  watch
} from 'vue'
import {
  ElMessage,
  ElMessageBox,
  FormInstance,
  FormRules
} from 'element-plus'
import {
  Close,
  User,
  UserFilled,
  Reading,
  House,
  Camera,
  Loading
} from '@element-plus/icons-vue'
import type {
  ApplicationSubmitRequest,
  BasicInfo,
  PracticeInfo,
  LodgingInfo,
  ContactItem,
  ApiResponse
} from '@/types'

// ========== 模拟 request（实际项目中应 import { request } from '@/utils/request'）==========
// 为演示保留，将来替换为真实 request
// import { request } from '@/utils/request'
// const request = (config: any) => {
//   return new Promise<ApiResponse>((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: 0,
//         message: 'success',
//         data: 1001,
//         timestamp: Date.now()
//       })
//     }, 800)
//   })
// }

// ========== 表单引用 ==========
const basicFormRef = ref<FormInstance>()
const practiceFormRef = ref<FormInstance>()
const lodgingFormRef = ref<FormInstance>()

// ========== 表单数据 ==========
const formData = reactive<{
  basic: BasicInfo
  practice: PracticeInfo
  lodging: LodgingInfo & { agreement: boolean; selfEvaluation?: string }
}>({
  basic: {
    name: '',
    idCard: '232123234567876543',
    ethnic: '',
    gender: 1,
    mobile: '',
    weChat: '',
    marital: '',
    province: '',
    city: '',
    address: '',
    education: '',
    school: '',
    major: '',
    occupation: '',
    skills: '',
    photoUrl: '',
    diseaseHistory: '无',
    medicationHistory: '无',
    infectiousHistory: '无',
    emergencyContacts: [
      { contactName: '', contactPhone: '', sortNo: 1 },
      { contactName: '', contactPhone: '', sortNo: 2 }
    ],
    age: undefined,
    birthDate: '',
    departmentCode: ''
  },
  practice: {
    refugeTakenDate: '',
    pastPracticeExperience: '',
    currentPracticeExperience: '',
    visitRecords: '',
    hasTakenPrecepts: null, // 注意：用 null 表示"未选择"，true 表示任一戒律
    refugeTemple: '',
    yearsOfPractice: undefined
  },
  lodging: {
    applicationType: 1,
    checkinDate: '',
    checkoutDate: '',
    specialRequest: '',
    selfEvaluation: '',
    recommenderName: '',
    recommenderPhone: '',
    recommenderComment: '',
    agreement: false,
    causeOfVisit: '',
    departureDate: '',
    mealPreference: undefined,
    returnDate: '',
    shortStayReason: ''
  }
})

// ========== 省市联动 ==========
const provinceCity = ref<string[]>([])
const provinceCityOptions = [
  { value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] },
  { value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
  {
    value: '广东省',
    label: '广东省',
    children: [
      { value: '广州市', label: '广州市' },
      { value: '深圳市', label: '深圳市' },
      { value: '珠海市', label: '珠海市' }
      // 实际项目可引入完整省市区数据
    ]
  }
]

watch(provinceCity, (val) => {
  if (val && val.length === 2) {
    formData.basic.province = val[0]
    formData.basic.city = val[1]
  }
})

const handleProvinceCityChange = (val: string[]) => {
  if (!val || val.length === 0) {
    formData.basic.province = ''
    formData.basic.city = ''
  }
}

// ========== 头像上传 ==========
const isHovering = ref(false)
const isUploading = ref(false)
const handleAvatarChange = async (file: any) => {
  // 文件大小检查
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  // 文件格式检查
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('只支持 JPG、PNG 格式的图片!')
    return
  }

  try {
    isUploading.value = true

    // 调用上传 API
    const response = await uploadAvatar(file.raw)
    let path = response.url;
    const url = path.substring('/uploads'.length);
    
    formData.basic.photoUrl = 'http://49.232.241.94/' + url
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('上传失败，请稍后重试')
  } finally {
    isUploading.value = false
  }
}

// ========== 选项数据 ==========
const ethnicOptions = ['汉族', '满族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族']
const maritalOptions = ['未婚', '已婚', '离异', '丧偶']
const educationOptions = ['高中及以下', '大专', '本科', '硕士', '博士及以上']
const diseaseHistoryOptions = ['无', '高血压', '糖尿病', '心脏病', '其他疾病']
const medicationHistoryOptions = ['无', '长期服用', '间断服药']
const infectiousHistoryOptions = ['无', '结核病', '肺部', '其他传染病']

// ========== 表单验证规则 ==========
const basicRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  idCard: [{ required: true, message: '请输入18位身份证号', trigger: 'blur' }],
  ethnic: [{ required: true, message: '请选择民族', trigger: 'change' }],
  mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  age: [
    {
      validator: (rule, value, callback) => {
        if (value !== undefined && (value < 1 || value > 120)) {
          callback(new Error('年龄必须在1-120之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  departmentCode: [{ message: '请选择部组', trigger: 'change' }],
  'emergencyContacts.0.contactName': [
    { required: true, message: '请输入紧急联系人姓名', trigger: 'blur' }
  ],
  'emergencyContacts.0.contactPhone': [
    { required: true, message: '请输入紧急联系人电话号码', trigger: 'blur' }
  ]
})

const practiceRules = reactive<FormRules>({
  pastPracticeExperience: [
    { required: true, message: '请输入寺院过往学修/承担经历', trigger: 'blur' }
  ],
  hasTakenPrecepts: [
    { required: true, message: '请选择是否受戒', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value === null) {
          callback(new Error('请选择是否受戒'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  yearsOfPractice: [
    {
      validator: (rule, value, callback) => {
        if (value !== undefined && (value < 0 || value > 100)) {
          callback(new Error('学修年数必须在0-100之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const lodgingRules = reactive<FormRules>({
  applicationType: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  checkinDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  checkoutDate: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  specialRequest: [{ required: true, message: '请输入短住原因及期许', trigger: 'blur' }],
  mealPreference: [
    {
      validator: (rule, value, callback) => {
        if (value !== undefined && (value < 0 || value > 3)) {
          callback(new Error('请选择有效的用斋选项'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请勾选承诺'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

// ========== 交互方法 ==========
const handleClose = () => {
  ElMessageBox.confirm('确定要关闭页面吗？未保存的内容将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    // 实际项目中可能是 router.back() 或关闭弹窗
    console.log('关闭页面')
  })
}

const handleSubmit = async () => {
  // 表单验证
  const valid1 = await basicFormRef.value?.validate().catch(() => false)
  const valid2 = await practiceFormRef.value?.validate().catch(() => false)
  const valid3 = await lodgingFormRef.value?.validate().catch(() => false)

  if (!valid1 || !valid2 || !valid3) {
    ElMessage.error('请完善所有必填项')
    return
  }

  // 构造提交数据（注意：agreement 不在 LodgingInfo 中，需剔除）
  const { agreement, ...lodgingData } = formData.lodging

  const payload: ApplicationSubmitRequest = {
    basic: { ...formData.basic },
    practice: { ...formData.practice },
    lodging: { ...lodgingData }
  }

  // 提交 API（未来替换为真实接口）
  try {

    const res = await applications(payload);
    ElMessage.success(`申请提交成功！编号：${res}`)
    // const res = await request({
    //   url: 'http://49.232.241.94:8080/lodging/apply/applications',
    //   method: 'POST',
    //   data: payload
    // }) as ApiResponse<number>

    // if (res.code === 0) {
    //   ElMessage.success(`申请提交成功！编号：${res.data}`)
    //   // 可跳转或清空
    // } else {
    //   ElMessage.error(res.message || '提交失败')
    // }
  } catch (err) {
    ElMessage.error('网络错误，请稍后重试')
    console.error(err)
  }
}
</script>

<style scoped>
.lodging-application-page {
  position: relative;
  padding: 24px;
  background-color: #fdf6e3;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  /* padding: 30px 0; */
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;


  .form-title {
    font-size: 24px;
    font-weight: bold;
    color: #5a3e2b;
    text-align: center;
    margin-bottom: 8px;
  }

  .form-desc {
    text-align: center;
    color: #999;
    margin-bottom: 24px;
  }

}

.close-icon {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  z-index: 10;
}

.close-icon:hover {
  color: #333;
}

.form-container {
  /* max-width: 90%; */

  margin: 0 auto;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 32px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

.camera-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.camera-icon .el-icon {
  /* font-size: 48px; */
  color: white;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  /* padding: 20px; */
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 2rem;
  line-height: 2rem;
}

.camera-icon:hover .el-icon {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.camera-icon .el-icon.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.upload-tips {
  margin-left: 20px;
  margin-top: 10px;
  font-size: 12px;
  color: rgb(210 180 140 / var(--tw-text-opacity, 1));
  text-align: center;
}

.form-content {
  margin-bottom: 24px;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

:deep(.el-form-item__label) {
  color: #5a3e2b;
  font-weight: 500;
}

:deep(.el-form-item.is-required .el-form-item__label:before) {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.el-radio {
  margin-right: 20px;
}
</style>