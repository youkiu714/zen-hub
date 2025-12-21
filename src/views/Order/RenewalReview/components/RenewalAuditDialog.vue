<template>
  <el-dialog v-model="visible" :show-close="false" width="1000px" destroy-on-close :close-on-click-modal="false"
    class="renewal-audit-dialog" top="5vh" append-to-body>
    <template #header="{ close }">
      <div class="custom-dialog-header">
        <div class="header-left">
          <span class="title-text">续单审核</span>
          <!-- <span class="sub-id">- XS20230615001</span> -->
        </div>
        <button class="close-btn" @click="close">
          <el-icon>
            <Close />
          </el-icon>
        </button>
      </div>
    </template>

    <div class="dialog-body scrollbar-hide">

      <!-- <div class="section-container">
        <h4 class="section-title">审核流程</h4>
        <div class="timeline-box">
          <el-steps direction="vertical" :active="events.length - 1" finish-status="success">
            <el-step v-for="(event, index) in events" :key="index">
              <template #title>
                <span class="step-title">{{ event.title }}</span>
              </template>
              <template #description>
                <div class="step-content">
                 
                  <div class="step-row">
                    操作人:
                    <span v-if="event.operator === 'null' || !event.operator">系统</span>
                    <span v-else>{{ getOperatorName(event.operator) }}</span>
                  </div>

                  <div v-if="event.comment" class="step-row">{{ event.comment }}</div>

                  <div v-if="event.timestamp" class="step-row time">{{ event.timestamp }}</div>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div>
      </div> -->

      <div class="grid-layout mb-8">
        <div class="info-card">
          <div class="card-header">
            <el-icon class="header-icon">
              <User />
            </el-icon>
            <span class="header-text">申请人基本信息</span>
          </div>
          <div class="fields-grid">
            <div class="field-item">
              <div class="field-label">姓名</div>
              <div class="field-value">{{ detail?.basic?.name }}</div>
            </div>
            <div class="field-item">
              <div class="field-label">性别</div>
              <div class="field-value">{{ detail?.basic?.gender == 1 ? '男' : '女' }}</div>
            </div>
            <div class="field-item">
              <div class="field-label">年龄</div>
              <div class="field-value">{{ detail?.basic?.age }}岁</div>
            </div>
            <div class="field-item">
              <div class="field-label">民族</div>
              <div class="field-value">{{ detail?.basic?.ethnic }}</div>
            </div>
            <div class="field-item">
              <div class="field-label">联系电话</div>
              <div class="field-value editable">{{ detail?.basic?.mobile }}</div>
            </div>
            <div class="field-item">
              <div class="field-label">微信号</div>
              <div class="field-value editable">{{ detail?.basic?.weChat }}</div>
            </div>
            <div class="field-item">
              <div class="field-label">证件类型</div>
              <div class="field-value">居民身份证</div>
            </div>
            <div class="field-item">
              <div class="field-label">证件号码</div>
              <div class="field-value">{{ detail?.basic?.idCard }}</div>
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="card-header">
            <el-icon class="header-icon">
              <Document />
            </el-icon>
            <span class="header-text">续单信息</span>
          </div>
          <div class="fields-grid">
            <div class="field-item">
              <div class="field-label">原挂单编号</div>
              <div class="field-value">GS20230615001</div>
            </div>
            <div class="field-item">
              <div class="field-label">原挂单日期</div>
              <div class="field-value">{{ props.orderData?.checkinDate }}</div>
            </div>
            <div class="field-item">
              <div class="field-label">续单申请日期</div>
              <div class="field-value">2023-07-10</div>
            </div>
            <div class="field-item">
              <div class="field-label">申请续住日期</div>
              <div class="field-value editable highlight">{{ props.orderData?.requestedCheckoutDate }}</div>
            </div>
            <div class="field-item">
              <div class="field-label">续住天数</div>
              <div class="field-value">{{ props.orderData?.stayDays }}天</div>
            </div>
            <div class="field-item">
              <div class="field-label">续住目的</div>
              <div class="field-value editable">{{ detail?.purpose }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card mb-8">
        <div class="card-header border-b">
          <el-icon class="header-icon text-warning">
            <StarFilled />
          </el-icon>
          <span class="header-text">在寺表现评价</span>
        </div>
        <div class="eval-body pt-4">
          <div class="rating-grid">
            <div class="rating-col">
              <div class="field-label mb-2">遵守寺规情况</div>
              <div class="rating-wrapper">
                <el-rate v-model="formData.scoreRules" allow-half size="large"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9F0A']" disabled />
                <span class="rating-badge" :class="getRatingClass(formData.scoreRules)">
                  {{ getRatingText(formData.scoreRules) }}
                </span>
              </div>
            </div>
            <div class="rating-col">
              <div class="field-label mb-2">参与共修情况</div>
              <div class="rating-wrapper">
                <el-rate v-model="formData.scorePractice" allow-half size="large"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9F0A']" disabled/>
                <span class="rating-badge" :class="getRatingClass(formData.scorePractice)">
                  {{ getRatingText(formData.scorePractice) }}
                </span>
              </div>
            </div>
            <div class="rating-col">
              <div class="field-label mb-2">日常行为表现</div>
              <div class="rating-wrapper">
                <el-rate v-model="formData.scoreBehavior" allow-half size="large"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9F0A']" disabled/>
                <span class="rating-badge" :class="getRatingClass(formData.scoreBehavior)">
                  {{ getRatingText(formData.scoreBehavior) }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="field-label mb-2 font-medium text-gray-700">
              详细表现描述 <span class="text-red-500">：</span>
            </div>
            <div >{{ formData.scoreRemark }}</div>
            <!-- <el-input v-model="formData.scoreRemark" type="textarea" :rows="5" class="simple-textarea"
              placeholder="请详细描述申请人在寺期间的表现，包括遵守寺规、参与共修、日常行为等方面，此为必填项" />
            <div class="text-xs text-gray-400 mt-2">请客观评价，此内容将作为法师审核的重要参考</div> -->
          </div>
        </div>
      </div>

      <div class="audit-section mt-10">
        <div class="audit-header-title">
          <el-icon class="mr-2">
            <Stamp />
          </el-icon> 客堂{{ userStore.roles == 'MASTER'?'法师':'义工' }}审核
        </div>

        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
          <div class="mb-6">
            <div class="field-label mb-2 font-medium text-gray-700">
              审核意见 <span class="text-red-500">*</span>
            </div>
            <el-input v-model="formData.comment" type="textarea" :rows="4" class="simple-textarea"
              placeholder="请输入审核意见，结合在寺表现评价给出是否同意续单的建议，此为必填项" />
          </div>

          <div class="mb-6" style="margin-top: 20px;">
            <div class="field-label mb-2 font-medium text-gray-700">审核结果</div>
            <el-radio-group v-model="formData.reviewResult" class="simple-radio-group">
              <el-radio label="approve">
                <span class="text-gray-700 font-normal">同意</span>
              </el-radio>
              <el-radio label="reject">
                <span class="text-gray-700 font-normal">拒绝</span>
              </el-radio>
            </el-radio-group>
          </div>

          <!-- <div v-if="formData.reviewResult === 'reject'" class="reject-box mb-6">
            <div class="field-label mb-2 font-medium text-red-700">驳回原因</div>
            <el-checkbox-group v-model="formData.rejectReasons" class="reject-checkbox-group">
              <el-checkbox label="在寺表现不佳" />
              <el-checkbox label="违反寺规" />
              <el-checkbox label="寺院床位紧张" />
              <el-checkbox label="其他原因" />
            </el-checkbox-group>
            <div v-if="formData.rejectReasons.includes('其他原因')" class="mt-3">
              <el-input v-model="formData.otherReason" placeholder="请说明其他驳回原因" />
            </div>
          </div> -->
        </el-form>
      </div>

    </div>

    <div class="dialog-footer-bar">
      <el-button type="primary" class="btn-submit" :loading="submitting" @click="handleSubmit">
        提交审核
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Document, StarFilled, Stamp, Download, Close } from '@element-plus/icons-vue'
import { reviewExtension, type ExtensionReviewParams } from '@/api/extensions'
import { getApplicationById, getVolunteerPerformanceById } from "@/api/application"
import type { ReviewListItemVO } from '@/types/review'
import type { ApplicationDetailVO } from '@/views/Order/PendingOrderManagement/components/types'
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()


const props = defineProps<{
  modelValue: boolean
  orderData: ReviewListItemVO | null
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const submitting = ref(false)
const currentUser = ref('客堂义工')
const events = ref([])

const detail = ref<ApplicationDetailVO>()
const formRef = ref<FormInstance>()

interface FormData {
  scoreRules: number
  scorePractice: number
  scoreBehavior: number
  scoreRemark: string
  reviewResult: string
  comment: string
  rejectReasons: string[],
  otherReason: ''
}

const formData = reactive<FormData>({
  scoreRules: 0,
  scorePractice: 0,
  scoreBehavior: 0,
  scoreRemark: '',
  reviewResult: 'approve',
  comment: '',
  rejectReasons: [] as string[],
  otherReason: ''
})

const getRatingText = (rating: number) => {
  if (rating >= 4.5) return '优秀'
  if (rating >= 3.5) return '良好'
  if (rating >= 2.5) return '一般'
  if (rating >= 1.5) return '较差'
  return '未评'
}

const getRatingClass = (rating: number) => {
  if (rating >= 4.5) return 'is-excellent'
  if (rating >= 3.5) return 'is-good'
  if (rating >= 2.5) return 'is-average'
  return 'is-poor'
}

const formRules: FormRules = {
  reviewResult: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  comment: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  if (val && props.orderData) {
    initData()
  } else {
    detail.value = undefined
    resetForms()
  }
})


const initData = async () => {
  if (!props.orderData) return
  loading.value = true
  try {
    Object.assign(formData, {
      scoreRules: 0,
      scorePractice: 0,
      scoreBehavior: 0,
      scoreRemark: '',
      reviewResult: 'approve',
      comment: '',
      rejectReasons: [],
      otherReason: ''
    })
    const res = await getApplicationById(props.orderData.applicationId)
    detail.value = res
    events.value = detail.value?.timeline.map((item: any, index: number) => {
      // 反转后，最后一个元素（原数组的第一个）是最新的
      // const isLatest = index === detail.value?.timeline.length - 1
      return {
        title: item.title,
        timestamp: item.time,
        description: "",
        operator: item.operator,
        comment: item.content,
        // icon: getStageIcon(isLatest),
        // type: getStageType(item.stage, item.result, isLatest),
        // color: getStageColor(item.stage, item.result, isLatest),
        // size: 'large',
        // status: getStageStatus(item.stage, item.result),
        // statusClass: getStageStatusClass(item.stage, item.result)
      }
    })

  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }


  try {
    const res = await getVolunteerPerformanceById(props.orderData.id)
    console.log(res);
    formData.scoreRules = res.scoreRules;
    formData.scorePractice = res.scorePractice;
    formData.scoreBehavior = res.scoreBehavior;
    formData.scoreRemark = res.scoreRemark;
    
    
    

  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }

  

  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const getOperatorName = (operatorId) => {
  if (operatorId === '2') return '客堂义工'
  if (operatorId === '3') return '客堂法师'
  if (operatorId === 'null' || !operatorId) return '系统'
  return `用户(${operatorId})`
}

const resetForms = () => {
  formData.scoreRules = 0
  formData.scorePractice = 0
  formData.scoreBehavior = 0
  formData.scoreRemark = ''
  formData.comment = ''
  formData.reviewResult = 'approve'
  formData.rejectReasons = []
  formData.otherReason = ''
}

const handleSubmit = async () => {
  if (formData.scoreRemark.trim() === '') {
    ElMessage.warning('请填写在寺表现描述')
    return
  }

  if (formData.reviewResult === 'reject' && formData.rejectReasons.length === 0) {
    ElMessage.warning('请选择驳回原因')
    return
  }

  if (formData.comment.trim() === '') {
    ElMessage.warning('请填写审核意见')
    return
  }

  submitting.value = true
  try {
    // 构造 comment
    let finalComment = formData.comment

    if (formData.reviewResult === 'reject') {
      const reasonList = [...formData.rejectReasons]
      if (formData.otherReason) {
        reasonList.push(`其他：${formData.otherReason}`)
      }

      if (reasonList.length > 0) {
        const reasonStr = reasonList.join('；')
        finalComment = `[驳回原因：${reasonStr}] ${finalComment}`
      }
    }

    // 构造参数
    const params: ExtensionReviewParams = {
      pass: formData.reviewResult === 'approve',
      comment: finalComment,
      scoreRules: formData.scoreRules,
      scorePractice: formData.scorePractice,
      scoreBehavior: formData.scoreBehavior,
      scoreRemark: formData.scoreRemark,
    }

    await reviewExtension(props.orderData.id, params)

    ElMessage.success('操作成功')
    visible.value = false
    emit('success')
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}


</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&family=Noto+Sans+SC:wght@400;500&display=swap');

$bg-primary: #ffffff;
$bg-secondary: #f5f5f7;
$text-primary: #1d1d1f;
$text-secondary: #86868b;
$accent-color: #0071e3;
$danger-color: #ff3b30;
$success-color: #34c759;
$border-radius-lg: 18px;
$border-radius-md: 12px;
$shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

/* --- 基础弹窗重置 --- */
.renewal-audit-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-bottom: 5vh;
  height: 500px;
}

.renewal-audit-dialog :deep(.el-dialog__header) {
  display: none;
  padding: 0 !important;
}

.renewal-audit-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.rating-grid :deep(.el-rate__icon) {
  font-size: 1.25rem;
}

/* 头部 */
.custom-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.title-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 600;
  color: #8B5A2B;
}

.sub-id {
  font-size: 16px;
  color: #9ca3af;
  margin-left: 12px;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
}

.dialog-body {
  padding: 0px 10px;
  max-height: 60vh;
  overflow-y: auto;
  font-family: 'Noto Sans SC', sans-serif;
  color: #1a1a1a;

  /* --- 新增代码开始 --- */

  /* 针对 Firefox：隐藏滚动条 */
  scrollbar-width: none;

  /* 针对 IE 10+：隐藏滚动条 */
  -ms-overflow-style: none;

  /* --- 新增代码结束 --- */
}

/* --- 新增代码：针对 Chrome, Safari, Edge --- */
.dialog-body::-webkit-scrollbar {
  display: none;
  /* 隐藏滚动条 */
  /* 或者使用 width: 0; */
}

/* --- 审核流程 --- */
.section-container {
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #8B5A2B;
  margin-bottom: 24px;
  padding-left: 12px;
  border-left: 4px solid #8B5A2B;
}

.timeline-box {
  padding-left: 12px;
}

.timeline-box :deep(.el-step__title) {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.step-content {
  margin-top: 4px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.step-row.time {
  font-size: 13px;
  color: #9ca3af;
}

.step-row.status-waiting {
  color: #f59e0b;
  font-style: italic;
}

/* --- Grid 信息 --- */
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.info-card {
  background-color: rgba(245, 245, 220, 0.5);
  border-radius: 12px;
  padding: 24px;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-icon {
  font-size: 20px;
  color: #8B5A2B;
  margin-right: 8px;
}

.header-text {
  font-size: 18px;
  font-weight: 500;
  color: #1f2937;
}

.text-warning {
  color: #FFC107 !important;
}

.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 16px;
}

.field-item {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 14px;
  color: rgb(55 65 81 / var(--tw-text-opacity, 1));
  margin-bottom: 4px;
  font-weight: 500;
}

.field-value {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  line-height: 1.5;
}

.editable {
  border-bottom: 1px dashed #8B5A2B;
  color: #8B5A2B;
  cursor: pointer;
  width: max-content;
}

.highlight {
  color: #8B5A2B;
  font-weight: 600;
}

/* --- 评价区域 --- */
.eval-body {
  padding: 0 4px;
}

.rating-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

/* 通用简洁文本域：灰色细边框 */
.simple-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  /* gray-300 */
  padding: 12px;
  font-size: 15px;
  box-shadow: none;
  /* 移除 Element 默认阴影 */
  background-color: #fff;
}

.simple-textarea :deep(.el-textarea__inner:focus) {
  border-color: #8B5A2B;
  box-shadow: 0 0 0 1px #8B5A2B;
  /* 聚焦时主色边框 */
}

/* --- 客堂义工审核区 (重点修正) --- */
.audit-section {
  background-color: #fff;
  border: 2px solid #FEF3C7;
  /* 黄色边框 */
  border-radius: 16px;
  padding: 32px;
  margin-top: 40px;
  /* 增加与上方的间距，避免紧挨 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.audit-header-title {
  font-size: 18px;
  font-weight: 500;
  color: #8B5A2B;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

/* 简洁单选框 (覆盖 Element 样式) */
.simple-radio-group {
  display: flex;
  gap: 32px;
}

.simple-radio-group :deep(.el-radio__inner) {
  width: 18px;
  height: 18px;
  border-color: #d1d5db;
}

.simple-radio-group :deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #8B5A2B;
  background: #8B5A2B;
}

.simple-radio-group :deep(.el-radio__label) {
  padding-left: 8px;
  font-size: 15px;
}

/* 驳回区域 */
.reject-box {
  margin-top: 24px;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  padding: 20px;
}

.reject-checkbox-group :deep(.el-checkbox__label) {
  color: #b91c1c;
}

.reject-checkbox-group :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #DC2626;
  border-color: #DC2626;
}

/* 底部操作区 (黄色盒子内) */
.audit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  /* 淡淡的分割线 */
  /* margin-bottom: 20px; */
}

/* 按钮 */
.btn-cancel {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 15px;
  background-color: #e5e7eb;
  border: none;
  color: #374151;
}

.btn-submit {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 15px;
  background-color: #8B5A2B;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-submit:hover {
  background-color: #704822;
}

/* 底部通栏 */
.dialog-footer-bar {
  background-color: #F9FAFB;
  border-top: 1px solid #e5e7eb;
  padding: 20px 32px;
  display: flex;
  justify-content: flex-end;
}

.btn-download {
  background-color: #8B5A2B;
  border-color: #8B5A2B;
  border-radius: 8px;
  padding: 12px 24px;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  // background: $bg-secondary;
  padding: 8px 1px;
  border-radius: 8px;
  width: 100%;

  :deep(.el-rate) {
    height: auto;
    --el-rate-icon-margin: 2px;
  }
}

.rating-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 40px;
  text-align: center;
  margin-left: 10px;

  &.is-excellent {
    background: rgba($success-color, 0.1);
    color: $success-color;
  }

  &.is-good {
    background: rgba(#0071e3, 0.1);
    color: #0071e3;
  }

  &.is-average {
    background: rgba(#ff9f0a, 0.1);
    color: #ff9f0a;
  }

  &.is-poor {
    background: rgba($text-secondary, 0.1);
    color: $text-secondary;
  }
}
</style>