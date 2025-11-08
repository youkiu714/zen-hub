<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    width="900px"
    :close-on-click-modal="false"
    :top="'5vh'"
    class="renewal-detail-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">续单申请详情</h3>
      </div>
    </template>

    <div class="dialog-content">
      <div class="scroll-container">
        <!-- 审核流程 -->
        <div class="section">
          <h4 class="section-title">审核流程</h4>
          <div class="process-flow-vertical">
            <div class="process-item-v completed">
              <div class="process-dot-v"></div>
              <div class="process-content-v">
                <div class="process-label-v">申请提交</div>
                <div class="process-time-v">2024-11-03 10:30</div>
              </div>
            </div>
            <div class="process-line-v"></div>
            <div class="process-item-v completed">
              <div class="process-dot-v"></div>
              <div class="process-content-v">
                <div class="process-label-v">客堂审核</div>
                <div class="process-time-v">2024-11-03 14:20</div>
              </div>
            </div>
            <div class="process-line-v"></div>
            <div class="process-item-v" :class="{ completed: orderData?.status === 'approved' }">
              <div class="process-dot-v"></div>
              <div class="process-content-v">
                <div class="process-label-v">法师审核</div>
                <div class="process-time-v">{{ orderData?.status === 'approved' ? '2024-11-03 16:00' : '待审核' }}</div>
              </div>
            </div>
            <div class="process-line-v"></div>
            <div class="process-item-v" :class="{ completed: orderData?.status === 'approved' }">
              <div class="process-dot-v"></div>
              <div class="process-content-v">
                <div class="process-label-v">完成</div>
                <div class="process-time-v">{{ orderData?.status === 'approved' ? '2024-11-03 16:15' : '待完成' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 申请人基本信息 和 续单信息 左右布局 -->
        <div class="section-row">
          <!-- 申请人基本信息 -->
          <div class="section left-section">
            <h4 class="section-title">申请人基本信息</h4>
            <div class="info-content">
              <div class="info-item">
                <label>姓名：</label>
                <span>{{ orderData?.applicant }}</span>
              </div>
              <div class="info-item">
                <label>身份证号：</label>
                <span>{{ formatIdCard(orderData?.idCard) }}</span>
              </div>
              <div class="info-item">
                <label>联系电话：</label>
                <span>{{ orderData?.phone }}</span>
              </div>
              <div class="info-item">
                <label>申请类型：</label>
                <span>{{ getApplicationTypeLabel(orderData?.applicationType) }}</span>
              </div>
              <div class="info-item">
                <label>常住地址：</label>
                <span>北京市朝阳区某某街道某某小区1号楼2单元302室</span>
              </div>
              <div class="info-item">
                <label>紧急联系人：</label>
                <span>张三 (13800138000)</span>
              </div>
            </div>
          </div>

          <!-- 续单信息 -->
          <div class="section right-section">
            <h4 class="section-title">续单信息</h4>
            <div class="info-content">
              <div class="info-item">
                <label>原挂单日期：</label>
                <span>{{ formatDateRange(orderData?.originalStartDate, orderData?.originalEndDate) }}</span>
              </div>
              <div class="info-item">
                <label>续单日期：</label>
                <span>{{ formatDateRange(orderData?.renewalStartDate, orderData?.renewalEndDate) }}</span>
              </div>
              <div class="info-item">
                <label>续住天数：</label>
                <span>{{ orderData?.renewalDays }}天</span>
              </div>
              <div class="info-item">
                <label>申请日期：</label>
                <span>{{ orderData?.renewalStartDate }}</span>
              </div>
              <div class="info-item">
                <label>申请状态：</label>
                <span>{{ getStatusLabel(orderData?.status) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 在寺表现评价 -->
        <div class="section">
          <h4 class="section-title">在寺表现评价</h4>
          <div class="evaluation-content">
            <div class="evaluation-item">
              <div class="evaluation-label">纪律遵守：</div>
              <div class="evaluation-rating">
                <el-rate
                  v-model="evaluationData.discipline"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
            </div>
            <div class="evaluation-item">
              <div class="evaluation-label">学修态度：</div>
              <div class="evaluation-rating">
                <el-rate
                  v-model="evaluationData.study"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
            </div>
            <div class="evaluation-item">
              <div class="evaluation-label">参与活动：</div>
              <div class="evaluation-rating">
                <el-rate
                  v-model="evaluationData.participation"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
            </div>
            <div class="evaluation-item">
              <div class="evaluation-label">综合评价：</div>
              <div class="evaluation-text">
                {{ orderData?.remark || '该申请人在寺期间表现良好，遵守寺规，积极参与各项活动，学修态度认真，与师兄们相处融洽。' }}
              </div>
            </div>
            <div class="evaluation-item">
              <div class="evaluation-label">详细表现描述：</div>
              <div class="evaluation-textarea">
                <el-input
                  v-model="detailedDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入详细表现描述..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleDownload">
          <el-icon><Download /></el-icon>
          下载申请材料
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import type { OrderApplication } from '../../types'

interface Props {
  modelValue: boolean
  orderData: OrderApplication | null
}

const props = defineProps<Props>()

// 评价数据
const evaluationData = reactive({
  discipline: 4.5,
  study: 4.0,
  participation: 5.0
})

// 详细表现描述
const detailedDescription = ref('该申请人在寺期间表现优秀，严格遵守寺院各项规章制度，积极参与早晚课诵，学修态度端正。在寺院期间，主动承担各项力所能及的工作，与其他修行人员和睦相处，展现了良好的修行者风貌。特别在禅修课程中表现突出，得到法师们的一致好评。')

// 工具方法
const formatIdCard = (idCard?: string) => {
  if (!idCard || idCard.length < 10) return idCard || '-'
  return `${idCard.slice(0, 6)}****${idCard.slice(-4)}`
}

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return '-'
  return `${startDate} 至 ${endDate}`
}

const getApplicationTypeLabel = (type?: string) => {
  const typeMap = {
    'short_stay': '短住',
    'express': '直通车',
    'monk_family': '僧亲',
    'team': '团队挂单',
    'special': '特殊客人'
  }
  return typeMap?.[type as keyof typeof typeMap] || type || '-'
}

const getApplicationTypeTag = (type?: string) => {
  const tagMap = {
    'short_stay': '',
    'express': 'success',
    'monk_family': 'warning',
    'team': 'info',
    'special': 'danger'
  }
  return tagMap?.[type as keyof typeof tagMap] || ''
}

const getStatusLabel = (status?: string) => {
  const statusMap = {
    'pending_review': '待审核',
    'pending_monk': '待法师审核',
    'approved': '已通过',
    'rejected': '已驳回'
  }
  return statusMap?.[status as keyof typeof statusMap] || status || '-'
}


// 下载申请材料
const handleDownload = () => {
  if (!props.orderData) return

  // 模拟下载操作
  ElMessage.success('正在准备申请材料...')

  setTimeout(() => {
    // 模拟生成下载链接
    const downloadData = {
      applicant: props.orderData?.applicant,
      id: props.orderData?.id,
      applicationType: getApplicationTypeLabel(props.orderData?.applicationType),
      renewalDate: formatDateRange(props.orderData?.renewalStartDate, props.orderData?.renewalEndDate),
      renewalDays: props.orderData?.renewalDays
    }

    const dataStr = JSON.stringify(downloadData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `续单申请_${props.orderData?.applicant}_${props.orderData?.id}.json`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('申请材料下载完成！')
  }, 1000)
}
</script>

<style scoped lang="scss">
.renewal-detail-dialog {
  .dialog-header {
    text-align: center;
    padding: 0;

    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.dialog-content {
  max-height: calc(85vh - 120px);
  overflow: hidden;
  padding: 0;
}

.scroll-container {
  max-height: calc(85vh - 120px);
  overflow-y: auto;
  padding: 0 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    border-left: 3px solid #409eff;
    padding-left: 8px;
  }
}

.section-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .section {
    flex: 1;
    margin-bottom: 0;
  }
}

// 审核流程样式 - 竖直方向
.process-flow-vertical {
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 20px;

  .process-item-v {
    display: flex;
    align-items: flex-start;
    position: relative;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .process-dot-v {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #dcdfe6;
      margin-right: 12px;
      margin-top: 4px;
      flex-shrink: 0;
      transition: all 0.3s;

      .completed & {
        background: #409eff;
      }
    }

    .process-content-v {
      flex: 1;

      .process-label-v {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
        margin-bottom: 4px;
        transition: all 0.3s;

        .completed & {
          color: #303133;
        }
      }

      .process-time-v {
        font-size: 12px;
        color: #909399;
        transition: all 0.3s;

        .completed & {
          color: #409eff;
        }
      }
    }

    &.completed {
      .process-label-v {
        color: #303133;
      }

      .process-time-v {
        color: #409eff;
      }
    }
  }

  .process-line-v {
    width: 2px;
    height: 24px;
    background: #dcdfe6;
    margin-left: 5px;
    margin-bottom: 16px;
    transition: all 0.3s;

    .completed + & {
      background: #409eff;
    }
  }
}

// 左右布局的section样式
.left-section,
.right-section {
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 16px;

  .info-content {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        min-width: 80px;
        font-size: 13px;
        color: #606266;
        font-weight: 500;
        flex-shrink: 0;
      }

      span {
        flex: 1;
        font-size: 13px;
        color: #303133;
      }
    }
  }
}

// 评价样式
.evaluation-content {
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 16px;

  .evaluation-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
      align-items: flex-start;
    }

    .evaluation-label {
      min-width: 80px;
      font-size: 13px;
      color: #606266;
      font-weight: 500;
      flex-shrink: 0;
    }

    .evaluation-rating {
      flex: 1;

      :deep(.el-rate) {
        height: auto;
      }

      :deep(.el-rate__text) {
        font-size: 12px;
        margin-left: 8px;
      }
    }

    .evaluation-text {
      flex: 1;
      font-size: 13px;
      color: #303133;
      line-height: 1.5;
    }

    .evaluation-textarea {
      flex: 1;

      :deep(.el-textarea) {
        .el-textarea__inner {
          background: #fff;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          font-size: 13px;
          color: #303133;
          line-height: 1.5;
          resize: none;

          &:focus {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }

          &:hover {
            border-color: #c0c4cc;
          }

          &::placeholder {
            color: #c0c4cc;
          }
        }
      }
    }
  }
}

.dialog-footer {
  text-align: center;
  padding: 16px 0 0 0;
  border-top: 1px solid #f0f0f0;

  .el-button {
    min-width: 140px;
    height: 36px;
    font-size: 14px;

    .el-icon {
      margin-right: 6px;
    }
  }
}

// 对话框样式调整
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  margin-top: 5vh !important;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-right: 0;
  flex-shrink: 0;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px 24px;
  flex-shrink: 0;
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
}

// 响应式设计
@media (max-width: 768px) {
  .renewal-detail-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      max-height: 90vh;
      margin: 5vh auto !important;
    }
  }

  .section-row {
    flex-direction: column;
    gap: 12px;
  }

  .process-flow-vertical {
    padding: 16px 12px;

    .process-item-v {
      margin-bottom: 12px;

      .process-dot-v {
        width: 10px;
        height: 10px;
        margin-right: 10px;
      }

      .process-content-v {
        .process-label-v {
          font-size: 13px;
        }

        .process-time-v {
          font-size: 11px;
        }
      }
    }

    .process-line-v {
      height: 20px;
      margin-left: 4px;
      margin-bottom: 12px;
    }
  }

  .left-section,
  .right-section {
    padding: 12px;

    .info-content .info-item {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 6px;

      label {
        min-width: auto;
        margin-bottom: 2px;
      }
    }
  }

  .evaluation-content {
    padding: 12px;

    .evaluation-item {
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 8px;

      .evaluation-label {
        min-width: auto;
        margin-bottom: 4px;
      }
    }
  }

  .dialog-content,
  .scroll-container {
    max-height: calc(90vh - 140px);
  }
}
</style>