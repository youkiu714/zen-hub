<template>
  <div class="lodging-application-page" id="lodging-application-page">
    <PageHeader title="挂单申请" />
    <div class="lodging-wrapper">
      <el-card class="form-container">
        <!-- 基本信息 -->
        <section id="basic-info" class="section">
          <BaseInfo v-model="formData.basic" ref="basicFormRef" />
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
      <el-tabs
        v-model="activeTab"
        tab-position="right"
        style="height: 120px"
        class="tabs"
        @tab-click="handleTabClick"
      >
        <el-tab-pane label="基本信息" name="basic-info"></el-tab-pane>
        <el-tab-pane label="学修情况" name="practice-info"></el-tab-pane>
        <el-tab-pane label="挂单信息" name="lodging-info"></el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import throttle from 'lodash-es/throttle'
import type { BasicInfo, PracticeInfo, LodgingInfo, ApplicationSubmitRequest } from '@/types'
import PageHeader from '@/components/PageHeader.vue'
import BaseInfo from '@/views/Order/OrderApplication/components/BaseInfo.vue'
import PracticeInfoForm from '@/views/Order/OrderApplication/components/PracticeInfoForm.vue'
import LodgingInfoForm from '@/views/Order/OrderApplication/components/LodgingInfoForm.vue'
import { applications } from '@/api/pendingOrder'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const user = computed(() => userStore.user)

console.log(user);
console.log(user.value.department);
const basicFormRef = ref<FormInstance>()
const practiceFormRef = ref<FormInstance>()
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
  lodging: LodgingInfo & { agreement: boolean; selfEvaluation?: string }
}>({
  basic: {
    name: '',
    idCard: '',
    ethnic: '',
    gender: "1",
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
    departmentCode: user.value.department
  },
  practice: {
    refugeTakenDate: '',
    refugeTemple: '',
    pastPracticeExperience: '',
    currentPracticeExperience: '',
    visitRecords: '',
    hasTakenPrecepts: 0
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
    shortStayReason: '',
    departmentCode: user.value.department
  }
})

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

  const { selfEvaluation, agreement, ...lodgingData } = formData.lodging

  const payload: ApplicationSubmitRequest = {
    basic: { ...formData.basic },
    practice: { ...formData.practice },
    lodging: { ...lodgingData }
  }
  try {
    await applications(payload)

    ElMessage.success(`申请提交成功`)
    resetFormData()
    scrollToTop()
  } catch (err) {
    ElMessage.error(err)
  }
}

const handleSubmit = throttle(_handleSubmit, 1000, {
  leading: true,  
  trailing: false 
})

onMounted(() => {
  const main = document.querySelector('.main') as HTMLElement | null
  scrollContainer.value = main

  if (main) {
    main.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
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
