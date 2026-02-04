<template>
  <div class="lodging-application-page" id="lodging-application-page">
    <PageHeader title="直通车申请" />
    <div class="lodging-wrapper">
      <el-card class="form-container">
        <!-- 基本信息 -->
        <section id="basic-info" class="section">
          <BaseInfo v-model="formData.basic" ref="basicFormRef">
          </BaseInfo>
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
      <!-- <el-tabs v-model="activeTab" tab-position="right" style="height: 120px" class="tabs" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="basic-info"></el-tab-pane>
        <el-tab-pane label="学修情况" name="practice-info"></el-tab-pane>
        <el-tab-pane label="挂单信息" name="lodging-info"></el-tab-pane>
      </el-tabs> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import { ElMessage, FormInstance, ElMessageBox } from 'element-plus'
import throttle from 'lodash-es/throttle'
import type { BasicInfo, PracticeInfo, LodgingInfo, ApplicationSubmitRequest } from '@/types'
import PageHeader from '@/components/PageHeader.vue'
import BaseInfo from './components/BaseInfo.vue'
import LodgingInfoForm from './components/LodgingInfoForm.vue'
import { applications } from '@/api/pendingOrder'
import { useUserStore } from '@/store/modules/user'

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
const hasDraft = ref(false)

const getDraftCacheKey = () => {
  const userId = user.value?.userId || 'anonymous'
  return `orderApplication:draft:${userId}`
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

watch(
  () => user.value?.userId,
  () => syncHasDraft()
)
const basicFormRef = ref<FormInstance>()
const lodgingFormRef = ref<FormInstance>()
const activeTab = ref('basic-info')


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
  const valid3 = await lodgingFormRef.value?.validate().catch(() => false)

  if (!valid1 || !valid3) {
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
  const main = document.querySelector('.main') as HTMLElement | null
  scrollContainer.value = main

  if (main) {
    main.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  saveDraftToCache()

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
  /* margin-right: 115px; */
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
