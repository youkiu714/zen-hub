<template>
  <el-dialog v-model="visible" :title="`入住登记 - ${checkInForm.applicationId || ''}`" width="800px"
    :close-on-click-modal="false" :close-on-press-escape="false" @close="resetForm"
    class="check-in-dialog fixed-header-footer">
    <template #header>
      <div class="custom-header">
        入住登记 - {{ checkInForm.applicationId }}
      </div>
    </template>

    <el-form ref="formRef" :model="checkInForm" :rules="rules" label-width="100px" label-position="top"
      class="check-in-form">
      <div class="dialog-content-wrapper">
        <div class="check-in-section">
          <h3 class="section-title">
            <el-icon>
              <User />
            </el-icon>
            入住人信息
          </h3>
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">姓名</label>
                <div class="info-value font-bold">{{ checkInForm.name || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">身份证号</label>
                <div class="info-value">{{ checkInForm.idCard || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">申请类型</label>
                <div class="info-value">{{ checkInForm.applicationTypeName || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">联系电话</label>
                <div class="info-value">{{ checkInForm.mobile || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider border-style="solid" />

        <div class="check-in-section">
          <h3 class="section-title">
            <el-icon>
              <OfficeBuilding />
            </el-icon>
            房间及床位信息
          </h3>
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">分配房间</label>
                <div class="info-value">{{ checkInForm.roomNumber || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">分配床位</label>
                <div class="info-value">{{ checkInForm.bedNumber || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实际入住日期" prop="actualCheckinDate" required>
                <el-date-picker v-model="checkInForm.actualCheckinDate" type="date" placeholder="选择实际入住日期"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预计退房日期" prop="expectedCheckoutDate" required>
                <el-date-picker v-model="checkInForm.expectedCheckoutDate" type="date" placeholder="yyyy/mm/dd"
                  format="YYYY/MM/DD" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-divider border-style="solid" />

        <div class="check-in-section">
          <h3 class="section-title">
            <el-icon>
              <List />
            </el-icon>
            入住登记信息
          </h3>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="入住备注" prop="remark">
                <el-input v-model="checkInForm.remark" type="textarea" :rows="3" placeholder="请输入入住备注信息" maxlength="200"
                  show-word-limit resize="none" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="登记人" prop="registeredBy">
                <el-input v-model="checkInForm.registeredBy" readonly disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="登记时间" prop="registrationTime">
                <el-date-picker v-model="checkInForm.registrationTime" type="datetime" placeholder="选择登记时间"
                  format="YYYY/MM/DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="notice-box">
          <h4 class="notice-title">
            <el-icon class="icon-warning">
              <InfoFilled />
            </el-icon>
            入住须知
          </h4>
          <ul class="notice-list">
            <li>请核对入住人身份信息与身份证一致</li>
            <li>请告知入住人寺院作息时间和注意事项</li>
            <li>请提醒入住人保管好个人财物</li>
            <li>请引导入住人熟悉寺院环境和安全通道</li>
          </ul>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitting" class="btn-confirm">
          确认入住
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// ... (Script 保持不变) ...
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { FormInstance, FormRules } from 'element-plus'
import { User, OfficeBuilding, List, InfoFilled } from '@element-plus/icons-vue'
import { confirmCheckin, getCheckinDetail } from '@/api/checkin'
import type { CheckinConfirmRequest, CheckinDetailResponse, PendingCheckinItemVO } from '@/types/checkin'
import { useUserStore } from '@/store/modules/user'
import { createCheckInForm } from '@/views/Order/CheckInManagement/utils'

interface Props {
  modelValue: boolean
  applicantData?: PendingCheckinItemVO
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

const visible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const checkInForm = reactive(createCheckInForm())

const rules: FormRules = {
  actualCheckinDate: [{ required: true, message: '请选择实际入住日期', trigger: 'change' }],
  expectedCheckoutDate: [{ required: true, message: '请选择预计退房日期', trigger: 'change' }],
  registrationTime: [{ required: true, message: '请选择登记时间', trigger: 'change' }]
}

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal && props.applicantData) {
    loadCheckInData(props.applicantData)
  }
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const loadCheckInData = async (row: PendingCheckinItemVO) => {
  try {
    resetForm()

    if (row.applicationId) {
      const detailData: CheckinDetailResponse = await getCheckinDetail(row.applicationId)

      checkInForm.applicationId =
        detailData.applicationId?.toString() || row.applicationId?.toString() || ''
      checkInForm.name = detailData.name || row.name || ''
      checkInForm.idCard = detailData.idCardMasked || row.idCardMasked || ''
      checkInForm.mobile = detailData.mobile || row.mobile || ''
      checkInForm.applicationTypeName =
        detailData.applicationTypeName || row.applicationTypeName || ''
      checkInForm.roomNumber = detailData.roomNo || '待分配'
      checkInForm.bedNumber = detailData.bedNo || '待分配'
      checkInForm.bedStayId = detailData.bedStayId

      const now = new Date()
      checkInForm.actualCheckinDate = detailData.actualCheckinAt
        ? new Date(detailData.actualCheckinAt).toISOString().split('T')[0]
        : now.toISOString().split('T')[0]

      checkInForm.expectedCheckoutDate = detailData.expectedCheckoutAt
        ? new Date(detailData.expectedCheckoutAt).toISOString().split('T')[0]
        : new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      checkInForm.registrationTime = now.toISOString().replace('T', ' ').slice(0, 19)
      checkInForm.registeredBy = userStore.user.username || checkInForm.registeredBy

      ElMessage.success('获取入住详情成功')
    } else {
      fillDefaultData(row)
    }
  } catch (error) {
    console.error('获取入住详情失败:', error)
    ElMessage.warning('获取详情失败，使用基本信息')
    fillDefaultData(row)
  }
}

const fillDefaultData = (row: PendingCheckinItemVO) => {
  const now = new Date()
  Object.assign(checkInForm, {
    applicationId: row.applicationId?.toString() || '',
    name: row.name || '',
    idCard: row.idCardMasked || '',
    mobile: row.mobile || '',
    applicationTypeName: row.applicationTypeName || '',
    roomNumber: '待分配',
    bedNumber: '待分配',
    actualCheckinDate: now.toISOString().split('T')[0],
    expectedCheckoutDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    registrationTime: now.toISOString().replace('T', ' ').slice(0, 19),
    registeredBy: userStore.user.username || '客堂义工'
  })
}

const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (!checkInForm.bedStayId) {
      ElMessage.warning('缺少申请ID，无法完成入住确认')
      return
    }

    submitting.value = true

    const confirmRequest: CheckinConfirmRequest = {
      bedStayId: checkInForm.bedStayId,
      actualCheckinAt: checkInForm.actualCheckinDate
        ? `${checkInForm.actualCheckinDate} ${new Date().toTimeString().slice(0, 8)}`
        : undefined,
      expectedCheckoutAt: checkInForm.expectedCheckoutDate
        ? `${checkInForm.expectedCheckoutDate} ${new Date().toTimeString().slice(0, 8)}`
        : undefined,
      remark: checkInForm.remark
    }

    await confirmCheckin(confirmRequest)
    ElMessage.success('入住确认成功！')
    visible.value = false
    resetForm()
    emit('success')
  } catch (error) {
    console.error('入住确认失败:', error)
    ElMessage.error('入住确认失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(checkInForm, createCheckInForm())
}
</script>

<style scoped lang="scss">
/* =========================================
   1. Jobs Style 通用变量/重置
   ========================================= */
$jobs-primary-color: #007aff;
$jobs-text-color: #333333;
$jobs-light-text-color: #6a6a6a;
$jobs-border-color: #e0e0e0;
$jobs-background-color: #f7f7f7;

/* 定义 Header 和 Footer 的高度 */
$header-height: 52px;
$footer-height: 52px;

/* =========================================
   2. 弹窗样式 - FIXED HEADER/FOOTER + SCROLLABLE BODY
   ========================================= */
.check-in-dialog.fixed-header-footer {

  /* 限制整个对话框最大高度，防止超出视口 */
  :deep(.el-dialog) {
    max-height: 90vh; // 90% 视口高度，留出呼吸空间
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    width: 800px; // 与你设置的 width="800px" 一致
  }

  /* Header - 固定高度 */
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px 24px;
    border-bottom: 1px solid $jobs-border-color;
    flex-shrink: 0;
    height: $header-height;
    display: flex;
    align-items: center;

    .custom-header {
      font-size: 17px;
      font-weight: 600;
      color: $jobs-text-color;
      flex-grow: 1;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: #999999;

      &:hover {
        color: $jobs-primary-color;
      }
    }
  }

  /* Footer - 固定高度 */
  :deep(.el-dialog__footer) {
    padding: 12px 24px;
    border-top: 1px solid $jobs-border-color;
    background-color: #ffffff;
    flex-shrink: 0;
    height: $footer-height;
    display: flex;
    align-items: center;
  }


}



/* 表单容器 - 不再控制高度，由 body 滚动 */
.check-in-form {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 核心：让 body 区域可滚动且高度自适应 */
.check-in-dialog {
  :deep(.el-dialog__footer) {
    padding: 0;
    flex-grow: 1;
    min-height: 0;
    /* 计算可用高度：90vh - header - footer - dialog 内边距（估算） */
    display: flex;
    flex-direction: column;
  }
}

/* 内容区域增加内边距 */
.check-in-form .dialog-content-wrapper {
  padding: 24px 32px;
  flex-shrink: 0; // 防止被压缩
  max-height: calc(80vh - #{$header-height} - #{$footer-height} - 32px);
  /* 32px 是 Element Plus dialog 默认 vertical padding 估算 */
  overflow-y: auto;
}

/* =========================================
   3. 内容样式（保持不变）
   ========================================= */

/* 分区标题 */
.check-in-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $jobs-text-color;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.el-icon) {
      color: $jobs-primary-color;
    }
  }
}

/* 信息展示项 (只读信息) */
.info-item {
  margin-bottom: 16px;

  .info-label {
    display: block;
    font-size: 13px;
    color: #999999;
    margin-bottom: 2px;
  }

  .info-value {
    font-size: 15px;
    color: $jobs-text-color;
    min-height: 24px;
    line-height: 24px;

    &.font-bold {
      font-weight: 600;
      font-size: 16px;
    }
  }
}

/* 分割线 */
:deep(.el-divider) {
  margin: 16px 0 24px 0;
  border-top: 1px solid $jobs-border-color;
}

/* 入住须知 (Jobs-Style Info Box) */
.notice-box {
  background-color: #f0f7ff;
  border: 1px solid #cceeff;
  border-radius: 6px;
  padding: 16px;
  margin-top: 20px;

  .notice-title {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: $jobs-primary-color;
    display: flex;
    align-items: center;
    gap: 6px;

    .icon-warning {
      color: $jobs-primary-color;
      font-size: 16px;
    }
  }

  .notice-list {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 13px;
      color: $jobs-light-text-color;
      line-height: 22px;
      margin-bottom: 2px;
    }
  }
}

/* 弹窗底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-confirm.el-button--primary {
  padding-left: 24px;
  padding-right: 24px;
  min-width: 100px;
  font-weight: 500;
}

.btn-cancel {
  padding-left: 24px;
  padding-right: 24px;
  min-width: 100px;
  background-color: #f5f5f5;
  border-color: #cccccc;
  color: $jobs-text-color;

  &:hover {
    background-color: #e6e6e6;
    border-color: #cccccc;
    color: $jobs-text-color;
  }
}
</style>