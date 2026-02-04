<template>
  <div class="lodging-application-page" id="lodging-application-page">
    <PageHeader title="挂单申请" />
    <div class="lodging-wrapper">
      <el-card class="form-container">
        <!-- 基本信息 -->
        <div class="docx-upload">
          <el-upload
            v-model:file-list="docxFileList"
            drag
            :auto-upload="false"
            :limit="1"
            accept=".docx"
            :before-upload="handleDocxBeforeUpload"
            :on-exceed="handleDocxExceed"
            :on-change="handleDocxChange"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              请上传docx文件,<a class="template-download" :href="templateDocx" download @click.stop>点击下载模版</a>
            </div>
          </el-upload>
        </div>
        <section id="basic-info" class="section">
          <BaseInfo v-model="formData.basic" ref="basicFormRef">
            <!-- <template #headerRight>
              <el-button v-if="hasDraft" size="small" type="primary" @click="applyCachedDraft">
                使用缓存数据
              </el-button>
            </template> -->
          </BaseInfo>
        </section>
        <!-- 学修情况 -->
        <section id="practice-info">
          <PracticeInfoForm v-model="formData.practice" ref="practiceFormRef" />
        </section>

        <!-- 挂单信息 -->
        <section id="lodging-info">
          <LodgingInfoForm v-model="formData.lodging" ref="lodgingFormRef" />
        </section>
        <!-- 底部按钮 -->
        <div class="form-footer">
          <el-button type="primary" @click="handleSubmit">提交申请</el-button>
        </div>
      </el-card>
      <el-tabs v-model="activeTab" tab-position="right" style="height: 120px" class="tabs" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="basic-info"></el-tab-pane>
        <el-tab-pane label="学修情况" name="practice-info"></el-tab-pane>
        <el-tab-pane label="挂单信息" name="lodging-info"></el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import { ElMessage, FormInstance, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadRawFile, UploadUserFile } from 'element-plus'
import throttle from 'lodash-es/throttle'
import type { BasicInfo, PracticeInfo, LodgingInfo, ApplicationSubmitRequest } from '@/types'
import PageHeader from '@/components/PageHeader.vue'
import BaseInfo from '@/views/Order/OrderApplication/components/BaseInfo.vue'
import PracticeInfoForm from '@/views/Order/OrderApplication/components/PracticeInfoForm.vue'
import LodgingInfoForm from '@/views/Order/OrderApplication/components/LodgingInfoForm.vue'
import { applications } from '@/api/pendingOrder'
import { useUserStore } from '@/store/modules/user'
import avatarImg from '@/assets/avatar.png'
import { analyzeDocx } from '@/utils/analyze-docx'
import { uploadAvatar } from '@/api/upload'
import templateDocx from '@/docx/崇恩寺短住义工申请表.docx'

const userStore = useUserStore()
const user = computed(() => userStore.user)

type OrderApplicationDraft = {
  version: 1
  savedAt: number
  data: {
    basic: BasicInfo
    practice: PracticeInfo
    lodging: LodgingInfo & { agreement?: boolean }
  }
}

const DRAFT_VERSION = 1
const AUTO_SAVE_MS = 5000
const hasDraft = ref(false)
let autoSaveTimer: number | undefined

const getDraftCacheKey = () => {
  const userId = user.value?.userId || 'anonymous'
  return `orderApplication:draft:${userId}`
}

const isDefaultAvatar = (photoUrl?: string) => {
  if (!photoUrl) return true
  return photoUrl === avatarImg
}

const shouldCacheDraft = (draft: OrderApplicationDraft['data']) => {
  const ignoreKeys = new Set([
    'applicationType',
    'departmentCode',
    'gender',
    'age',
    'birthDate',
  ])

  const hasMeaningfulValue = (value: unknown, key?: string): boolean => {
    if (key && ignoreKeys.has(key)) return false

    if (typeof value === 'string') {
      if (key === 'photoUrl') return !isDefaultAvatar(value)
      return value.trim().length > 0
    }

    if (typeof value === 'number') return value !== 0
    if (typeof value === 'boolean') return value === true
    if (value == null) return false

    if (Array.isArray(value)) {
      return value.some((item) => hasMeaningfulValue(item))
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).some(([k, v]) =>
        hasMeaningfulValue(v, k)
      )
    }

    return false
  }

  return hasMeaningfulValue(draft)
}

const saveDraftToCache = () => {
  const key = getDraftCacheKey()

  const data = JSON.parse(
    JSON.stringify({
      basic: formData.basic,
      practice: formData.practice,
      lodging: formData.lodging
    })
  ) as OrderApplicationDraft['data']

  if (!shouldCacheDraft(data)) return

  const draft: OrderApplicationDraft = {
    version: DRAFT_VERSION,
    savedAt: Date.now(),
    data
  }

  try {
    localStorage.setItem(key, JSON.stringify(draft))
    hasDraft.value = true
  } catch {
    // ignore quota/security errors
  }
}

const loadDraftFromCache = (): OrderApplicationDraft | null => {
  const key = getDraftCacheKey()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as OrderApplicationDraft
    if (parsed?.version !== DRAFT_VERSION) return null
    if (!parsed?.data?.basic || !parsed?.data?.practice || !parsed?.data?.lodging) return null

    return parsed
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

const syncHasDraft = () => {
  hasDraft.value = Boolean(loadDraftFromCache())
}

const applyCachedDraft = async () => {
  const draft = loadDraftFromCache()
  if (!draft) {
    hasDraft.value = false
    ElMessage.warning('未找到可用的缓存数据')
    return
  }

  const photoUrl =
    draft.data.basic.photoUrl && draft.data.basic.photoUrl !== ''
      ? draft.data.basic.photoUrl
      : avatarImg
  Object.assign(formData.basic, draft.data.basic, {
    photoUrl,
    departmentCode: user.value?.department
  })
  Object.assign(formData.practice, draft.data.practice)
  Object.assign(formData.lodging, draft.data.lodging, { departmentCode: user.value?.department })

  await nextTick()
  basicFormRef.value?.formRef?.clearValidate?.()
  practiceFormRef.value?.formRef?.clearValidate?.()
  lodgingFormRef.value?.formRef?.clearValidate?.()
  ElMessage.success('已使用缓存数据')
}

watch(
  () => user.value?.userId,
  () => syncHasDraft()
)
const basicFormRef = ref<FormInstance>()
const practiceFormRef = ref<FormInstance>()
const lodgingFormRef = ref<FormInstance>()
const docxFileList = ref<UploadUserFile[]>([])

const activeTab = ref('basic-info')

const normalizeDocxDate = (value: string) => {
  const trimmed = value.trim()
  const cleaned = trimmed.replace(/\s+/g, '')
  const fullMatch = cleaned.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)
  if (fullMatch) {
    const year = fullMatch[1]
    const month = fullMatch[2].padStart(2, '0')
    const day = fullMatch[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const partialMatch = cleaned.match(/(\d{4})\D+(\d{1,2})/)
  if (partialMatch) {
    const year = partialMatch[1]
    const month = partialMatch[2].padStart(2, '0')
    return `${year}-${month}-01`
  }

  const yearMatch = cleaned.match(/(\d{4})/)
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`
  }

  return trimmed
}

const uploadDocxAvatar = async (file: File) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return
  }

  const allowed = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowed.includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG 格式的图片!')
    return
  }

  try {
    const res = await uploadAvatar(file)
    // const url = String(res.url).substring('/uploads'.length)
    const url = res.url
    console.log(url)
    // formData.basic.photoUrl = `http://49.232.241.94/${url}`
    formData.basic.photoUrl = url
  } catch (error) {
    ElMessage.error('上传失败，请稍后重试')
  }
}

const applyDocxData = async (data: Record<string, string | string[] | File>) => {
  const setIf = (setter: (value: string) => void, value?: string) => {
    if (value && value.trim()) setter(value.trim())
  }
  const toList = (value?: string | string[]) => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }

  setIf((value) => (formData.basic.name = value), data['姓名'])
  setIf((value) => (formData.basic.ethnic = value), data['民族'])
  setIf((value) => (formData.basic.mobile = value), data['电话号码'])
  setIf((value) => (formData.basic.weChat = value), data['微信号'])
  setIf((value) => (formData.basic.idCard = value), data['身份证号'])
  setIf((value) => (formData.basic.marital = value), data['婚姻状况'])
  setIf((value) => (formData.basic.address = value), data['常住详细地址'] || data['详细地址'])
  setIf((value) => (formData.basic.education = value), data['最高学历'])
  setIf((value) => (formData.basic.school = value), data['毕业院校'])
  setIf((value) => (formData.basic.major = value), data['专业'])
  setIf((value) => (formData.basic.occupation = value), data['职业'])
  setIf((value) => (formData.basic.diseaseHistory = value), data['疾病史（请如实填写）'])
  setIf((value) => (formData.basic.medicationHistory = value), data['服药史（请如实填写）'])
  setIf((value) => (formData.basic.infectiousHistory = value), data['传染病史（请如实填写）'])
  const contactNames = toList(data['紧急联系人'])
  const contactPhones = toList(data['联系方式'])

  setIf(
    (value) => (formData.basic.emergencyContacts[0].contactName = value),
    contactNames[0]
  )
  setIf(
    (value) => (formData.basic.emergencyContacts[0].contactPhone = value),
    contactPhones[0]
  )
  setIf(
    (value) => (formData.basic.emergencyContacts[1].contactName = value),
    contactNames[1]
  )
  setIf(
    (value) => (formData.basic.emergencyContacts[1].contactPhone = value),
    contactPhones[1]
  )

  setIf((value) => (formData.practice.pastPracticeExperience = value), data['过往学修、承担经历'])
  setIf((value) => (formData.lodging.departmentCode = value), data['现承担部组'])
  setIf((value) => (formData.practice.visitRecords = value), data['来崇恩寺的次数及时间'])

  setIf((value) => (formData.lodging.checkinDate = normalizeDocxDate(value)), data['申请短住开始时间'])
  setIf((value) => (formData.lodging.checkoutDate = normalizeDocxDate(value)), data['申请短住结束时间'])
  setIf((value) => (formData.lodging.shortStayReason = value), data['短住的原因及期许'])
  setIf((value) => (formData.lodging.recommenderName = value), data['推荐人'])
  setIf((value) => (formData.lodging.recommenderComment = value), data['推荐人评价'])

  setIf((value) => {
    const normalized = value.trim()
    if (normalized === '男') formData.basic.gender = '1'
    else if (normalized === '女') formData.basic.gender = '2'
    else formData.basic.gender = normalized as any
  }, data['性别'])

  setIf((value) => (formData.basic.birthDate = normalizeDocxDate(value)), data['出生年月'])

  const location = data['常住省市'] || data['省市'] || data['常住地']
  if (location && !formData.basic.provinceCity) {
    formData.basic.provinceCity = location
  }

  const avatar = data['头像']
  if (avatar instanceof File) {
    await uploadDocxAvatar(avatar)
  } else if (typeof avatar === 'string' && avatar.trim()) {
    formData.basic.photoUrl = avatar
  }
}

const handleDocxChange = async (file: UploadFile) => {
  const rawFile = file.raw
  if (!rawFile) return
  const isDocx =
    rawFile.name.toLowerCase().endsWith('.docx') ||
    rawFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!isDocx) return

  try {
    const data = await analyzeDocx(rawFile)
    await applyDocxData(data)
    ElMessage.success('已解析并填充表单')
  } catch (error) {
    ElMessage.error('解析失败，请确认文件格式是否正确')
  }
}

const handleDocxBeforeUpload = (rawFile: UploadRawFile) => {
  const name = rawFile.name.toLowerCase()
  const isDocx =
    name.endsWith('.docx') ||
    rawFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!isDocx) {
    ElMessage.error('仅支持上传 .docx 文件')
  }
  return isDocx
}

const handleDocxExceed = () => {
  ElMessage.warning('最多只能上传 1 个文件')
}

// 监听滚动事件，更新当前激活的Tab
const handleScroll = () => {
  const container = scrollContainer.value
  if (!container) return

  const containerRect = container.getBoundingClientRect()

  const sections = [
    { id: 'basic-info', element: document.getElementById('basic-info') },
    { id: 'practice-info', element: document.getElementById('practice-info') },
    { id: 'lodging-info', element: document.getElementById('lodging-info') }
  ]

  let currentSection = 'basic-info'
  let minDistance = Infinity

  for (const section of sections) {
    if (section.element) {
      const rect = section.element.getBoundingClientRect()

      // 元素相对滚动容器顶部的距离
      const distanceFromTop = Math.abs(rect.top - containerRect.top)

      // 判断是否在容器可视范围内
      if (rect.bottom >= containerRect.top && rect.top <= containerRect.bottom) {
        if (distanceFromTop < minDistance) {
          minDistance = distanceFromTop
          currentSection = section.id
        }
      }
    }
  }

  activeTab.value = currentSection
}

const formData = reactive<{
  basic: BasicInfo
  practice: PracticeInfo 
  lodging: LodgingInfo & { agreement: boolean }
}>({
  basic: {
    name: '',
    idCard: '',
    ethnic: '',
    gender: '1',
    mobile: '',
    weChat: '',
    marital: '',
    provinceCity: '',
    city: '',
    address: '',
    education: '',
    school: '',
    major: '',
    occupation: '',
    skills: '',
    photoUrl: '',
    diseaseHistory: '',
    medicationHistory: '',
    infectiousHistory: '',
    emergencyContacts: [
      { contactName: '', contactPhone: '', sortNo: 1 },
      { contactName: '', contactPhone: '', sortNo: 2 }
    ],
    age: undefined,
    birthDate: '',
    departmentCode: user.value?.department
  },
  practice: {
    pastPracticeExperience: '',
    visitRecords: '',
  },
  lodging: {
    applicationType: 1,
    checkinDate: '',
    checkoutDate: '',
    specialRequest: '',
    recommenderName: '',
    recommenderComment: '',
    agreement: false,
    departureDate: '',
    returnDate: '',
    shortStayReason: '',
    departmentCode: user.value?.department
  }
})

const parseIdCardAge = (idCard: string) => {
  if (!/^\d{17}[\dXx]$/.test(idCard)) return null

  const birthStr = idCard.slice(6, 14)
  const year = birthStr.slice(0, 4)
  const month = birthStr.slice(4, 6)
  const day = birthStr.slice(6, 8)
  const birthDateObj = new Date(`${year}-${month}-${day}`)

  if (Number.isNaN(birthDateObj.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDateObj.getFullYear()
  const monthDiff = today.getMonth() - birthDateObj.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--
  }

  if (age < 0) return null

  return {
    age,
    birthDate: `${year}-${month}-${day}`
  }
}

watch(
  () => formData.basic.idCard,
  (idCard) => {
    const parsed = parseIdCardAge(idCard)
    if (!parsed) return
    formData.basic.age = parsed.age
    formData.basic.birthDate = parsed.birthDate
  }
)

watch(
  () => user.value?.department,
  (dept) => {
    formData.basic.departmentCode = dept
    formData.lodging.departmentCode = dept
  },
  { immediate: true }
)

const handleTabClick = (tab: any) => {
  const targetId = tab.props.name
  activeTab.value = targetId // ← 必须手动更新

  const target = document.getElementById(targetId)
  if (!target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const resetFormData = () => {
  basicFormRef.value?.formRef?.resetFields()
  practiceFormRef.value?.formRef?.resetFields()
  lodgingFormRef.value?.formRef?.resetFields()
}

const scrollContainer = ref<HTMLElement | null>(null)

// 提交成功后滚动到顶部
const scrollToTop = () => {
  const container = scrollContainer.value

  if (container) {
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const _handleSubmit = async () => {
  const valid1 = await basicFormRef.value?.validate().catch(() => false)
  const valid2 = await practiceFormRef.value?.validate().catch(() => false)
  const valid3 = await lodgingFormRef.value?.validate().catch(() => false)

  if (!valid1 || !valid2 || !valid3) {
    ElMessage.error('请完善所有必填项')
    return
  }

  try {

    await ElMessageBox.confirm(
      '提交后将无法修改，是否确认提交挂单申请？', 
      '提交确认', 
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const { agreement, ...lodgingData } = formData.lodging
    const payload: ApplicationSubmitRequest = {
      basic: { ...formData.basic },
      practice: { ...formData.practice },
      lodging: { ...lodgingData }
    }

    await applications(payload)

    ElMessage.success(`申请提交成功`)
    resetFormData()
    scrollToTop()
    
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err)
      ElMessage.error(typeof err === 'string' ? err : '提交失败，请稍后重试')
    }
  }
}

const handleSubmit = throttle(_handleSubmit, 1000, {
  leading: true,
  trailing: false
})

onMounted(() => {
  syncHasDraft()
  autoSaveTimer = window.setInterval(saveDraftToCache, AUTO_SAVE_MS)

  const main = document.querySelector('.main') as HTMLElement | null
  scrollContainer.value = main

  if (main) {
    main.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  saveDraftToCache()
  if (autoSaveTimer) {
    window.clearInterval(autoSaveTimer)
  }

  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll as any)
  }
})
</script>

<style scoped>
.lodging-application-page {
  position: relative;
  padding: 24px;
  min-height: 100vh;

  :deep(.el-cascader) {
    width: 100%;
  }

  :deep(.el-date-editor) {
    width: 100%;
  }
}

.lodging-wrapper {
  display: flex;
}

.tabs {
  position: fixed;
  right: 24px;
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
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-right: 115px;
  flex: 1;
}

.photo-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  flex-direction: column;
}

.docx-upload {
  width: 100%;
  margin-bottom: 16px;
}

.docx-upload :deep(.el-upload) {
  width: 100%;
}

.docx-upload :deep(.el-upload .el-button) {
  width: 100%;
}

.template-download {
  color: var(--el-color-primary);
  text-decoration: none;
  cursor: pointer;
}

.template-download:hover {
  color: var(--el-color-primary-light-3);
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
