<template>
  <div class="order-application">
    <!-- 页面头部 -->
    <PageHeader title="挂单申请" description="请填写以下信息进行挂单申请" />

    <!-- 申请表单 -->
    <div class="form-container">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" label-width="180px"
        class="application-form">

        <!-- 基本信息 -->
        <el-divider content-position="left">
          <div class="section-title">
            <el-icon class="title-icon">
              <User />
            </el-icon>
            <span>基本信息</span>
          </div>
        </el-divider>

        <!-- 照片上传 -->
        <el-row :gutter="20">
          <el-col :span="12" :offset="9">
            <el-form-item label="" prop="photo">
              <div class="photo-upload-container">
                <el-upload class="photo-uploader" action="#" :show-file-list="false" :before-upload="beforePhotoUpload"
                  :http-request="handlePhotoUpload">
                  <img v-if="formData.photo" :src="formData.photo" class="photo-preview" />
                  <div v-else class="photo-upload-placeholder">
                    <el-icon class="photo-uploader-icon">
                      <Plus />
                    </el-icon>
                  </div>
                </el-upload>
                <div class="photo-upload-instructions">
                  <div class="upload-text">点击上传个人照片</div>
                  <div class="upload-tips">支持JPG、PNG格式，大小不超过2MB</div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="formData.idCard" placeholder="请输入18位身份证号" maxlength="18" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-select v-model="formData.nation" placeholder="请选择民族" style="width: 100%">
                <el-option v-for="nation in nationOptions" :key="nation.value" :label="nation.label"
                  :value="nation.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话号码" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信号">
              <el-input v-model="formData.wechat" placeholder="请输入微信号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="婚姻状况">
              <el-select v-model="formData.maritalStatus" placeholder="请选择婚姻状况" style="width: 100%">
                <el-option label="未婚" value="未婚" />
                <el-option label="已婚" value="已婚" />
                <el-option label="离异" value="离异" />
                <el-option label="丧偶" value="丧偶" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 常住地省市 -->
        <!-- <el-divider content-position="left">常住地省市</el-divider> -->

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="常住地省市" prop="permanentProvince">
              <el-select v-model="formData.permanentProvince" placeholder="请选择省份" style="width: 100%"
                @change="handleProvinceChange">
                <el-option v-for="province in provinceOptions" :key="province.value" :label="province.label"
                  :value="province.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="选择城市" prop="permanentCity">
              <el-select v-model="formData.permanentCity" placeholder="请选择城市" style="width: 100%"
                :disabled="!formData.permanentProvince">
                <el-option v-for="city in cityOptions" :key="city.value" :label="city.label" :value="city.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="常住地详细地址" prop="permanentAddress">
          <el-input v-model="formData.permanentAddress" placeholder="请输入详细地址，包括街道、门牌号等" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最高学历">
              <el-select v-model="formData.education" placeholder="请选择学历" style="width: 100%">
                <el-option label="高中及以下" value="高中及以下" />
                <el-option label="大专" value="大专" />
                <el-option label="本科" value="本科" />
                <el-option label="硕士" value="硕士" />
                <el-option label="博士及以上" value="博士及以上" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="毕业院校">
              <el-input v-model="formData.university" placeholder="请输入毕业院校名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="专业">
              <el-input v-model="formData.major" placeholder="请输入所学专业" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="技能特长">
          <el-input v-model="formData.skills" placeholder="请输入技能特长，多个技能用逗号分隔" />
        </el-form-item>
        <el-form-item label="职业">
          <el-input v-model="formData.profession" placeholder="请输入职业" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人1">
              <el-input v-model="formData.emergencyContact1" placeholder="请输入紧急联系人信息" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系人1电话号码" prop="emergencyPhone1">
              <el-input v-model="formData.emergencyPhone1" placeholder="请输入紧急联系人电话号码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人2">
              <el-input v-model="formData.emergencyContact2" placeholder="请输入紧急联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系人2电话号码">
              <el-input v-model="formData.emergencyPhone2" placeholder="请输入紧急联系人电话号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="疾病史">
              <el-select v-model="formData.medicalHistory" placeholder="请选择疾病史" style="width: 100%">
                <el-option label="无" value="无" />
                <el-option label="高血压" value="高血压" />
                <el-option label="糖尿病" value="糖尿病" />
                <el-option label="心脏病" value="心脏病" />
                <el-option label="其他疾病" value="其他疾病" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="服药史">
              <el-select v-model="formData.medicationHistory" placeholder="请选择服药史" style="width: 100%">
                <el-option label="无" value="无" />
                <el-option label="长期服用" value="长期服用" />
                <el-option label="间断服药" value="间断服药" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="传染病史">
              <el-select v-model="formData.infectiousHistory" placeholder="请选择传染病史" style="width: 100%">
                <el-option label="无" value="无" />
                <el-option label="结核病" value="结核病" />
                <el-option label="肺部" value="肺部" />
                <el-option label="其他传染病" value="其他传染病" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 教育信息 -->
        <el-divider content-position="left">
          <div class="section-title">
            <el-icon class="title-icon">
              <Reading />
            </el-icon>
            <span>学修情况</span>
          </div>
        </el-divider>
        <el-form-item label="皈依时间">
          <el-date-picker v-model="formData.convertDate" type="date" placeholder="请选择皈依时间" style="width: 100%"
            format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>

        <el-form-item label="寺院过往学修/承担经历" prop="templeExperience">
          <el-input v-model="formData.templeExperience" type="textarea" :rows="3" placeholder="请详细描述在寺院的学修经历或承担的工作" />
        </el-form-item>

        <el-form-item label="现参加承担/学修">
          <el-input v-model="formData.currentActivities" type="textarea" :rows="3" placeholder="请描述目前参加的承担工作或学修活动" />
        </el-form-item>

        <el-form-item label="来崇恩寺的次数及时间">
          <el-input v-model="formData.visitHistory" type="textarea" :rows="3" placeholder="请记录来崇恩寺的次数和具体时间" />
        </el-form-item>

        <el-form-item label="是否受戒" prop="ordination">
          <el-radio-group v-model="formData.ordination">
            <el-radio value="无">无</el-radio>
            <el-radio value="居士五戒">居士五戒</el-radio>
            <el-radio value="八戒">八戒</el-radio>
            <el-radio value="菩萨戒">菩萨戒</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 挂单信息 -->
        <el-divider content-position="left">
          <div class="section-title">
            <el-icon class="title-icon">
              <Document />
            </el-icon>
            <span>挂单信息</span>
          </div>
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请短住开始时间" prop="applyStartDate">
              <el-date-picker v-model="formData.applyStartDate" type="date" placeholder="请选择申请短住开始时间"
                style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请短住结束时间" prop="applyEndDate">
              <el-date-picker v-model="formData.applyEndDate" type="date" placeholder="请选择申请短住结束时间" style="width: 100%"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="短住的原因及期许" prop="stayReason">
          <el-input v-model="formData.stayReason" type="textarea" :rows="3" placeholder="请详细说明申请短住的原因和期望达成的目标" />
        </el-form-item>

        <el-form-item label="自我评价">
          <el-input v-model="formData.selfEvaluation" type="textarea" :rows="3" placeholder="请输入自我评价" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="推荐人">
              <el-input v-model="formData.referee" placeholder="请输入推荐人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="推荐人联系方式">
              <el-input v-model="formData.refereeContact" placeholder="请输入推荐人联系方式" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="推荐人评价">
          <el-input v-model="formData.refereeEvaluation" type="textarea" :rows="3" placeholder="请输入推荐人评价" />
        </el-form-item>



        <el-form-item prop="agreement">
          <el-checkbox v-model="formData.agreement">
            本人承诺所填写的信息真实有效，如有虚假信息愿意承担相应责任
          </el-checkbox>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            提交申请
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, User, HomeFilled, Reading, Phone, ChatDotSquare, UserFilled, Document, FirstAidKit } from '@element-plus/icons-vue'
import PageHeader from '../PendingOrderQuery/components/PageHeader.vue'

// 表单数据
const formData = reactive({
  photo: '',
  name: '',
  idCard: '',
  nation: '',
  phone: '',
  wechat: '',
  maritalStatus: '',
  permanentProvince: '',
  permanentCity: '',
  permanentAddress: '',
  education: '',
  university: '',
  major: '',
  skills: '',
  profession: '',
  convertDate: '',
  templeExperience: '',
  currentActivities: '',
  visitHistory: '',
  ordination: '',
  applyStartDate: '',
  applyEndDate: '',
  stayReason: '',
  emergencyContact1: '',
  emergencyPhone1: '',
  emergencyContact2: '',
  emergencyPhone2: '',
  medicalHistory: '无',
  medicationHistory: '无',
  infectiousHistory: '无',
  selfEvaluation: '',
  referee: '',
  refereeContact: '',
  refereeEvaluation: '',
  agreement: false
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的18位身份证号', trigger: 'blur' }
  ],
  nation: [
    { required: true, message: '请选择民族', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  permanentProvince: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  permanentCity: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  permanentAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  templeExperience: [
    { required: true, message: '请输入寺院过往学修/承担经历', trigger: 'blur' }
  ],
  ordination: [
    { required: true, message: '请选择是否受戒', trigger: 'change' }
  ],
  applyStartDate: [
    { required: true, message: '请选择申请短住开始时间', trigger: 'change' }
  ],
  applyEndDate: [
    { required: true, message: '请选择申请短住结束时间', trigger: 'change' }
  ],
  stayReason: [
    { required: true, message: '请输入短住的原因及期许', trigger: 'blur' }
  ],
  emergencyPhone1: [
    { required: true, message: '请输入紧急联系人电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  agreement: [
    { required: true, message: '请同意承诺条款', trigger: 'change' }
  ]
})

// 民族选项
const nationOptions = [
  { label: '汉族', value: '汉族' },
  { label: '壮族', value: '壮族' },
  { label: '回族', value: '回族' },
  { label: '满族', value: '满族' },
  { label: '维吾尔族', value: '维吾尔族' },
  { label: '苗族', value: '苗族' },
  { label: '彝族', value: '彝族' },
  { label: '土家族', value: '土家族' },
  { label: '藏族', value: '藏族' },
  { label: '蒙古族', value: '蒙古族' },
  { label: '侗族', value: '侗族' },
  { label: '布依族', value: '布依族' },
  { label: '瑶族', value: '瑶族' },
  { label: '白族', value: '白族' },
  { label: '朝鲜族', value: '朝鲜族' },
  { label: '哈尼族', value: '哈尼族' },
  { label: '黎族', value: '黎族' },
  { label: '哈萨克族', value: '哈萨克族' },
  { label: '傣族', value: '傣族' },
  { label: '畲族', value: '畲族' },
  { label: '傈僳族', value: '傈僳族' },
  { label: '东乡族', value: '东乡族' },
  { label: '高山族', value: '高山族' },
  { label: '拉祜族', value: '拉祜族' },
  { label: '水族', value: '水族' },
  { label: '佤族', value: '佤族' },
  { label: '纳西族', value: '纳西族' },
  { label: '羌族', value: '羌族' },
  { label: '土族', value: '土族' },
  { label: '仫佬族', value: '仫佬族' },
  { label: '锡伯族', value: '锡伯族' },
  { label: '柯尔克孜族', value: '柯尔克孜族' },
  { label: '达斡尔族', value: '达斡尔族' },
  { label: '景颇族', value: '景颇族' },
  { label: '毛南族', value: '毛南族' },
  { label: '撒拉族', value: '撒拉族' },
  { label: '布朗族', value: '布朗族' },
  { label: '塔吉克族', value: '塔吉克族' },
  { label: '阿昌族', value: '阿昌族' },
  { label: '普米族', value: '普米族' },
  { label: '鄂温克族', value: '鄂温克族' },
  { label: '怒族', value: '怒族' },
  { label: '京族', value: '京族' },
  { label: '基诺族', value: '基诺族' },
  { label: '德昂族', value: '德昂族' },
  { label: '保安族', value: '保安族' },
  { label: '俄罗斯族', value: '俄罗斯族' },
  { label: '裕固族', value: '裕固族' },
  { label: '乌孜别克族', value: '乌孜别克族' },
  { label: '门巴族', value: '门巴族' },
  { label: '鄂伦春族', value: '鄂伦春族' },
  { label: '独龙族', value: '独龙族' },
  { label: '塔塔尔族', value: '塔塔尔族' },
  { label: '赫哲族', value: '赫哲族' },
  { label: '珞巴族', value: '珞巴族' }
]

// 省份选项
const provinceOptions = [
  { label: '北京市', value: '北京市' },
  { label: '天津市', value: '天津市' },
  { label: '河北省', value: '河北省' },
  { label: '山西省', value: '山西省' },
  { label: '内蒙古自治区', value: '内蒙古自治区' },
  { label: '辽宁省', value: '辽宁省' },
  { label: '吉林省', value: '吉林省' },
  { label: '黑龙江省', value: '黑龙江省' },
  { label: '上海市', value: '上海市' },
  { label: '江苏省', value: '江苏省' },
  { label: '浙江省', value: '浙江省' },
  { label: '安徽省', value: '安徽省' },
  { label: '福建省', value: '福建省' },
  { label: '江西省', value: '江西省' },
  { label: '山东省', value: '山东省' },
  { label: '河南省', value: '河南省' },
  { label: '湖北省', value: '湖北省' },
  { label: '湖南省', value: '湖南省' },
  { label: '广东省', value: '广东省' },
  { label: '广西壮族自治区', value: '广西壮族自治区' },
  { label: '海南省', value: '海南省' },
  { label: '重庆市', value: '重庆市' },
  { label: '四川省', value: '四川省' },
  { label: '贵州省', value: '贵州省' },
  { label: '云南省', value: '云南省' },
  { label: '西藏自治区', value: '西藏自治区' },
  { label: '陕西省', value: '陕西省' },
  { label: '甘肃省', value: '甘肃省' },
  { label: '青海省', value: '青海省' },
  { label: '宁夏回族自治区', value: '宁夏回族自治区' },
  { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区' },
  { label: '台湾省', value: '台湾省' },
  { label: '香港特别行政区', value: '香港特别行政区' },
  { label: '澳门特别行政区', value: '澳门特别行政区' }
]

// 城市数据（简化版本，实际项目中应该从API获取）
const cityData: Record<string, Array<{ label: string; value: string }>> = {
  '北京市': [
    { label: '东城区', value: '东城区' },
    { label: '西城区', value: '西城区' },
    { label: '朝阳区', value: '朝阳区' },
    { label: '丰台区', value: '丰台区' },
    { label: '石景山区', value: '石景山区' },
    { label: '海淀区', value: '海淀区' },
    { label: '门头沟区', value: '门头沟区' },
    { label: '房山区', value: '房山区' },
    { label: '通州区', value: '通州区' },
    { label: '顺义区', value: '顺义区' },
    { label: '昌平区', value: '昌平区' },
    { label: '大兴区', value: '大兴区' },
    { label: '怀柔区', value: '怀柔区' },
    { label: '平谷区', value: '平谷区' },
    { label: '密云区', value: '密云区' },
    { label: '延庆区', value: '延庆区' }
  ],
  '上海市': [
    { label: '黄浦区', value: '黄浦区' },
    { label: '徐汇区', value: '徐汇区' },
    { label: '长宁区', value: '长宁区' },
    { label: '静安区', value: '静安区' },
    { label: '普陀区', value: '普陀区' },
    { label: '虹口区', value: '虹口区' },
    { label: '杨浦区', value: '杨浦区' },
    { label: '闵行区', value: '闵行区' },
    { label: '宝山区', value: '宝山区' },
    { label: '嘉定区', value: '嘉定区' },
    { label: '浦东新区', value: '浦东新区' },
    { label: '金山区', value: '金山区' },
    { label: '松江区', value: '松江区' },
    { label: '青浦区', value: '青浦区' },
    { label: '奉贤区', value: '奉贤区' },
    { label: '崇明区', value: '崇明区' }
  ],
  '广东省': [
    { label: '广州市', value: '广州市' },
    { label: '深圳市', value: '深圳市' },
    { label: '珠海市', value: '珠海市' },
    { label: '汕头市', value: '汕头市' },
    { label: '佛山市', value: '佛山市' },
    { label: '韶关市', value: '韶关市' },
    { label: '湛江市', value: '湛江市' },
    { label: '肇庆市', value: '肇庆市' },
    { label: '江门市', value: '江门市' },
    { label: '茂名市', value: '茂名市' },
    { label: '惠州市', value: '惠州市' },
    { label: '梅州市', value: '梅州市' },
    { label: '汕尾市', value: '汕尾市' },
    { label: '河源市', value: '河源市' },
    { label: '阳江市', value: '阳江市' },
    { label: '清远市', value: '清远市' },
    { label: '东莞市', value: '东莞市' },
    { label: '中山市', value: '中山市' },
    { label: '潮州市', value: '潮州市' },
    { label: '揭阳市', value: '揭阳市' },
    { label: '云浮市', value: '云浮市' }
  ]
  // 其他省份的城市数据可以继续添加
}

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const cityOptions = ref<Array<{ label: string; value: string }>>([])

// 省份变化处理
const handleProvinceChange = (province: string) => {
  formData.permanentCity = ''
  cityOptions.value = cityData[province] || []
}

// 照片上传前检查
const beforePhotoUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('照片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('照片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理照片上传
const handlePhotoUpload = (options: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.photo = e.target?.result as string
  }
  reader.readAsDataURL(options.file)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('申请提交成功！')
    handleReset()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  formData.photo = ''
  cityOptions.value = []
}
</script>

<style scoped lang="scss">
.order-application {
  padding: 24px;
  background: #f5f5f5;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.application-form {
  max-width: 900px;
  margin: 0 auto;
}

.photo-uploader {
  .photo-preview {
    width: 160px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  :deep(.el-upload) {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    background: #fafafa;

    &:hover {
      border-color: #409eff;
      background: #f0f9ff;
    }
  }

  .photo-upload-placeholder {
    width: 160px;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .photo-uploader-icon {
    font-size: 32px;
    color: #409eff;
  }
}

.photo-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.photo-upload-instructions {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.upload-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
}

.upload-tips {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.el-divider {
  margin: 32px 0 24px 0;

  .el-divider__text {
    font-weight: 500;
    color: #409eff;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;

  .title-icon {
    font-size: 20px;
    color: #409eff;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}


// 响应式设计
@media (max-width: 768px) {
  .order-application {
    padding: 16px;
  }

  .form-container {
    padding: 16px;
  }

  .application-form {
    max-width: 100%;
  }

  :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 0;
  }
}
</style>