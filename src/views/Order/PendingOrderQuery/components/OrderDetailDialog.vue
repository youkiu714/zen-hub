<template>
  <el-dialog
    v-model="visible"
    title="查看详细信息"
    width="900px"
    :close-on-click-modal="false"
    class="order-detail-dialog"
  >

    <div v-if="record" class="detail-content">
      <el-scrollbar max-height="60vh">
        <!-- 照片显示 -->
        <div class="photo-section">
          <div class="person-photo">
            <el-image
              v-if="record.photo"
              :src="record.photo"
              :preview-src-list="[record.photo]"
              fit="cover"
              class="photo-img"
            >
              <template #error>
                <div class="photo-placeholder">
                  <el-icon><User /></el-icon>
                  <span>暂无照片</span>
                </div>
              </template>
            </el-image>
            <div v-else class="photo-placeholder">
              <el-icon><User /></el-icon>
              <span>暂无照片</span>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="section">
          <h4 class="section-title">
            <el-icon><User /></el-icon>
            基本信息
          </h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ record.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ record.gender === 'male' ? '男' : '女' }}
            </el-descriptions-item>
            <el-descriptions-item label="身份证号码" :span="2">
              <span class="masked-text">{{ maskIdCard(record.idCard) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="民族">{{ record.nation }}</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ record.birthDate }}</el-descriptions-item>
            <el-descriptions-item label="电话号码">
              <span class="masked-text">{{ maskPhone(record.phone) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="微信号">{{ record.wechat || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="婚姻状况" :span="2">
              {{ record.maritalStatus || '暂无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 联系信息 -->
        <div class="section">
          <h4 class="section-title">
            <el-icon><Phone /></el-icon>
            联系信息
          </h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="常住地">
              {{ record.permanentProvince || '' }}{{ record.permanentCity || '' }}{{ record.permanentAddress || '' }}
            </el-descriptions-item>
            <el-descriptions-item label="常住地详细地址">{{ record.permanentAddress || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="紧急联系人1">
              {{ record.emergencyContact1 || '暂无' }} ·
              <span class="masked-text">{{ maskPhone(record.emergencyPhone1 || '') }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="紧急联系人2">
              {{ record.emergencyContact2 || '暂无' }} ·
              <span class="masked-text">{{ maskPhone(record.emergencyPhone2 || '') }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 教育背景 -->
        <div class="section">
          <h4 class="section-title">
            <el-icon><Reading /></el-icon>
            教育背景
          </h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="最高学历">{{ record.education || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="毕业院校">{{ record.university || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="专业" :span="2">{{ record.major || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="技能特长" :span="2">{{ record.skills || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="职业" :span="2">{{ record.profession || '暂无' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 健康状况 -->
        <div class="section">
          <h4 class="section-title">
            <el-icon><FirstAidKit /></el-icon>
            健康状况
          </h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="疾病史">{{ record.medicalHistory || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="服药史">{{ record.medicationHistory || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="传染病史">{{ record.infectiousHistory || '暂无' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 学修情况 -->
        <div class="section">
          <h4 class="section-title">
            <el-icon><Reading /></el-icon>
            学修情况
          </h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="学修情况">{{ record.studySituation || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="皈依时间">{{ record.convertDate || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="寺院过往学修/承担经历">{{ record.templeExperience || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="现参加承担/学修">{{ record.currentActivities || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="来崇恩寺的次数及时间">{{ record.visitHistory || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="是否受戒">{{ record.ordination || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="居士五戒">
              <el-tag :type="record.fivePrecepts === '是' ? 'success' : 'info'">
                {{ record.fivePrecepts || '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="八戒">
              <el-tag :type="record.eightPrecepts === '是' ? 'success' : 'info'">
                {{ record.eightPrecepts || '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="菩萨戒">
              <el-tag :type="record.bodhisattvaPrecepts === '是' ? 'success' : 'info'">
                {{ record.bodhisattvaPrecepts || '否' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 挂单信息 -->
        <div class="section">
          <h4 class="section-title">
            <el-icon><Document /></el-icon>
            挂单信息
          </h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请短住开始时间">{{ record.applyStartDate || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="申请短住结束时间">{{ record.applyEndDate || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="短住的原因及期许" :span="2">
              {{ record.stayReason || '暂无' }}
            </el-descriptions-item>
            <el-descriptions-item label="自我评价" :span="2">
              {{ record.selfEvaluation || '暂无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 推荐人信息 -->
        <div class="section">
          <h4 class="section-title">
            <el-icon><UserFilled /></el-icon>
            推荐人信息
          </h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="推荐人">{{ record.referee || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="推荐人联系方式">
              <span class="masked-text">{{ maskPhone(record.refereeContact || '') }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="推荐人评价">{{ record.refereeEvaluation || '暂无' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Phone, Reading, FirstAidKit, Document, UserFilled } from '@element-plus/icons-vue'
import type { PendingOrderRecord } from './types'

interface Props {
  modelValue: boolean
  record: PendingOrderRecord | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 数据脱敏函数
const maskIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.substring(0, 4) + '********' + idCard.substring(idCard.length - 4)
}

const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
}
</script>

<style scoped lang="scss">
.order-detail-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 16px 24px;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.detail-content {
  padding: 24px;

  .photo-section {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;

    .person-photo {
      width: 240px;
      height: 180px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e4e7ed;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: #fafafa;

      .photo-img {
        width: 100%;
        height: 100%;
      }

      .photo-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: #909399;
        gap: 8px;

        span {
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      padding-bottom: 8px;
      border-bottom: 2px solid #e4e7ed;

      .el-icon {
        color: #409eff;
        font-size: 18px;
      }
    }

    .el-descriptions {
      :deep(.el-descriptions__header) {
        margin-bottom: 16px;
      }

      :deep(.el-descriptions__item) {
        padding-bottom: 12px;
      }

      :deep(.el-descriptions__label) {
        font-weight: 500;
        color: #606266;
        background-color: #f8f9fa;
      }

      :deep(.el-descriptions__content) {
        color: #303133;
      }
    }
  }

  .masked-text {
    font-family: 'Courier New', monospace;
    color: #606266;
    font-weight: 500;
    background-color: #f5f7fa;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .el-scrollbar {
    :deep(.el-scrollbar__view) {
      padding-right: 8px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .order-detail-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 5vh auto;
    }
  }

  .detail-content {
    padding: 16px;

    .photo-section {
      margin-bottom: 24px;

      .person-photo {
        width: 200px;
        height: 150px;

        .photo-placeholder {
          font-size: 36px;
        }
      }
    }

    .section {
      margin-bottom: 24px;

      .section-title {
        font-size: 14px;
      }

      .el-descriptions {
        :deep(.el-descriptions__label),
        :deep(.el-descriptions__content) {
          padding: 8px 12px;
        }
      }
    }
  }
}
</style>