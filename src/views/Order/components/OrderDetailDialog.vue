<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="申请详情"
    width="900px"
    :close-on-click-modal="false"
    class="order-detail-dialog"
  >

    <div v-if="record" class="detail-content">
      <!-- 第一部分：审核流程 -->
      <div class="review-process-section">
        <h4 class="section-title">审核流程</h4>
        <div class="process-timeline">
          <div class="timeline-item">
            <div class="timeline-dot completed">
              <el-icon><Check /></el-icon>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">申请提交</span>
                <span class="timeline-time">2024-10-28 10:30</span>
              </div>
              <div class="timeline-description">申请人提交挂单申请，等待审核</div>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-dot completed">
              <el-icon><Check /></el-icon>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">客堂审核</span>
                <span class="timeline-time">2024-10-28 11:15</span>
              </div>
              <div class="timeline-description">申请已通过客堂审核，等待法师审核</div>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-dot current">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">法师审核</span>
                <span class="timeline-time">-</span>
              </div>
              <div class="timeline-description">正在等待法师审核</div>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-dot pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">完成</span>
                <span class="timeline-time">-</span>
              </div>
              <div class="timeline-description">审核完成</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二部分：申请人基本信息和挂单信息（左右布局） -->
      <div class="info-layout-section">
        <div class="info-left">
          <h4 class="section-title">申请人基本信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="申请人">
              <div class="info-item">
                <span class="label-text">{{ record.applicant }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              <div class="info-item">
                <span class="label-text">{{ record.phone }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">
              <div class="info-item">
                <span class="label-text id-card">{{ maskIdCard(record.idCard) }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="info-right">
          <h4 class="section-title">挂单信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="申请类型">
              <div class="info-item">
                <el-tag :type="getApplicationTypeTag(record.applicationType) as any">
                  {{ getApplicationTypeText(record.applicationType) }}
                </el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="挂单天数">
              <div class="info-item">
                <span class="stay-days">{{ record.stayDays }}天</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="申请起止日期">
              <div class="info-item">
                <span class="label-text date-info">{{ formatDateRange(record.startDate, record.endDate) }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="申请原因">
              <div class="info-item">
                <span class="label-text reason-text">{{ record.reason || '暂无申请原因' }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              <div class="info-item">
                <span class="label-text remark-text">{{ record.remark || '暂无备注信息' }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 第三部分：审核区域（开始时隐藏） -->
      <div v-if="showApprovalSection" class="approval-section">
        <h4 class="section-title">审核区域</h4>
        <div class="approval-content">
          <div class="approval-form">
            <!-- 审批意见 -->
            <div class="form-item">
              <label class="form-label">审批意见</label>
              <el-input
                v-model="approvalComment"
                type="textarea"
                :rows="4"
                placeholder="请输入审批意见"
                class="comment-textarea"
              />
            </div>

            <!-- 审批结果 -->
            <div class="form-item">
              <label class="form-label">审批结果</label>
              <el-radio-group v-model="approvalResult" class="approval-radio-group">
                <el-radio value="approve" class="approval-radio">
                  信息完整，提交给客堂法师审核
                </el-radio>
                <el-radio value="reject" class="approval-radio">
                  信息不完整，退回申请人
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>

      <!-- 开始审核按钮 -->
      <div v-if="!showApprovalSection" class="start-review-section">
        <el-button size="large" @click="$emit('update:modelValue', false)">
          关闭
        </el-button>
        <el-button type="primary" size="large" @click="startReview">
          开始审核
        </el-button>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">下载申请材料</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check, Clock } from '@element-plus/icons-vue'
import type { OrderApplication } from '../types'
import { useOrderUtils } from '../composables/useOrderUtils'

interface Props {
  modelValue: boolean
  record: OrderApplication | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 审核区域相关的响应式数据
const showApprovalSection = ref(false)
const approvalComment = ref('')
const approvalResult = ref('approve')

const {
  getApplicationTypeTag,
  getApplicationTypeText,
  getStatusTag,
  getStatusText,
  maskIdCard,
  formatDateRange
} = useOrderUtils()

// 开始审核方法
const startReview = () => {
  showApprovalSection.value = true
}
</script>

<style scoped lang="scss">
:deep(.order-detail-dialog) {
  .el-dialog {
    border-radius: 12px;
    overflow: hidden;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    margin-top: 7.5vh !important;
  }

  .el-dialog__header {
    padding: 12px 24px;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
    flex-shrink: 0;
  }

  .el-dialog__body {
    padding: 0;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: calc(85vh - 80px); /* 减去header和footer的高度 */
  }

  .el-dialog__footer {
    padding: 12px 24px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
    flex-shrink: 0;
  }
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  // max-height: 100%;
  max-height: calc(100vh - 200px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}

.review-process-section {
  padding: 20px 24px;
  border-bottom: 8px solid #f8f9fa;

  .process-timeline {
    .timeline-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 24px;
      position: relative;

      &:last-child {
        margin-bottom: 0;
      }

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 19px;
        top: 44px;
        width: 2px;
        height: calc(100% + 8px);
        background: #e5e7eb;
        z-index: 1;
      }

      .timeline-dot {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
        flex-shrink: 0;

        &.completed {
          background: #10b981;
          color: #fff;
          border: 2px solid #10b981;
        }

        &.current {
          background: #3b82f6;
          color: #fff;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          animation: pulse 2s infinite;
        }

        &.pending {
          background: #f3f4f6;
          color: #9ca3af;
          border: 2px solid #e5e7eb;
        }

        .el-icon {
          font-size: 18px;
        }
      }

      .timeline-content {
        flex: 1;
        margin-left: 16px;
        padding-top: 4px;

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .timeline-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }

          .timeline-time {
            font-size: 14px;
            color: #6b7280;
          }
        }

        .timeline-description {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
        }
      }
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }
}

// 左右布局的信息区域
.info-layout-section {
  display: flex;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 8px solid #f8f9fa;

  .info-left,
  .info-right {
    flex: 1;
    min-width: 0;
  }

  .section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: #3b82f6;
      border-radius: 2px;
    }
  }

  .el-descriptions {
    :deep(.el-descriptions__header) {
      margin-bottom: 12px;
    }

    :deep(.el-descriptions__body) {
      .el-descriptions__table {
        .el-descriptions__cell {
          padding: 12px 16px;
          vertical-align: top;

          .el-descriptions__label {
            font-weight: 500;
            color: #6b7280;
            width: 100px;
          }

          .el-descriptions__content {
            .info-item {
              .label-text {
                font-size: 14px;
                color: #374151;
                line-height: 1.5;

                &.id-card {
                  font-family: 'Courier New', monospace;
                  font-weight: 500;
                }

                &.date-info {
                  color: #059669;
                  font-weight: 500;
                }

                &.reason-text,
                &.remark-text {
                  line-height: 1.6;
                }
              }

              .stay-days {
                font-size: 16px;
                font-weight: 600;
                color: #3b82f6;
              }

              .el-tag {
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}

// 审核区域
.approval-section {
  padding: 20px 24px;
  border-bottom: 8px solid #f8f9fa;

  .section-title {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: #3b82f6;
      border-radius: 2px;
    }
  }

  .approval-content {
    .approval-form {
      .form-item {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .comment-textarea {
          :deep(.el-textarea__inner) {
            border-radius: 6px;
            border: 1px solid #d1d5db;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
          }
        }

        .approval-radio-group {
          .approval-radio {
            display: block;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            :deep(.el-radio__label) {
              font-size: 14px;
              color: #374151;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
}

// 开始审核按钮区域
.start-review-section {
  padding: 24px;
  text-align: center;
  border-bottom: 8px solid #f8f9fa;

  .el-button {
    padding: 12px 32px;
    font-size: 16px;
    font-weight: 500;
    margin: 0 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  :deep(.order-detail-dialog) {
    .el-dialog {
      width: 95% !important;
      margin: 3vh auto !important;
      max-height: 80vh;
    }

    .el-dialog__header {
      padding: 10px 16px;
    }

    .el-dialog__footer {
      padding: 10px 16px;
    }

    .el-dialog__body {
      max-height: calc(80vh - 60px); /* 移动端进一步调整 */
    }
  }

  .review-process-section {
    padding: 16px;

    .process-timeline {
      .timeline-item {
        margin-bottom: 20px;

        .timeline-dot {
          width: 36px;
          height: 36px;

          .el-icon {
            font-size: 16px;
          }
        }

        .timeline-content {
          margin-left: 12px;

          .timeline-header {
            .timeline-title {
              font-size: 15px;
            }

            .timeline-time {
              font-size: 13px;
            }
          }

          .timeline-description {
            font-size: 13px;
          }
        }
      }
    }
  }

  .info-layout-section {
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .section-title {
      font-size: 15px;
      margin-bottom: 12px;
    }

    .el-descriptions {
      :deep(.el-descriptions__body) {
        .el-descriptions__table {
          .el-descriptions__cell {
            .el-descriptions__label {
              width: 90px;
              font-size: 13px;
            }

            .el-descriptions__content {
              .info-item .label-text {
                font-size: 13px;
              }
            }
          }
        }
      }
    }
  }

  .approval-section {
    padding: 16px;

    .section-title {
      font-size: 15px;
      margin-bottom: 16px;
    }

    .approval-content {
      .approval-form {
        .form-item {
          margin-bottom: 20px;

          .form-label {
            font-size: 13px;
          }

          .comment-textarea {
            :deep(.el-textarea__inner) {
              font-size: 13px;
            }
          }

          .approval-radio-group {
            .approval-radio {
              margin-bottom: 10px;

              :deep(.el-radio__label) {
                font-size: 13px;
              }
            }
          }
        }
      }
    }
  }

  .start-review-section {
    padding: 16px;

    .el-button {
      padding: 8px 20px;
      font-size: 14px;
      margin: 0 4px;
    }
  }
}
</style>