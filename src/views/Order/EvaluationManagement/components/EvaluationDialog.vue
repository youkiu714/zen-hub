<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="800"
    :before-close="handleClose"
    class="evaluation-dialog"
  >
    <div class="dialog-content">
      <!-- 挂单人基本信息 -->
      <div class="profile-section">
        <h4 class="section-title">
          <el-icon><User /></el-icon>
          挂单人基本信息
        </h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ profile.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ profile.gender || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ profile.age || '-' }}</el-descriptions-item>
          <el-descriptions-item label="民族">{{ profile.nation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ maskPhone(profile.phone) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="挂单类型">
            <el-tag :type="getTypeTagType(profile.type)" size="small">
              {{ getTypeLabel(profile.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="入住日期">{{ profile.checkInDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="退房日期">{{ profile.checkOutDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入住天数">{{ profile.duration || '-' }}</el-descriptions-item>
          <el-descriptions-item label="挂单目的">{{ profile.purpose || '禅修' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 评价表单 -->
      <div v-if="showForm" class="evaluation-form">
        <h4 class="section-title">
          <el-icon><Star /></el-icon>
          在寺表现评价
        </h4>

        <el-form :model="form" label-width="140px" label-position="top">
          <!-- 评分项 -->
          <div class="rating-sections">
            <div
              v-for="(item, index) in ratingItems"
              :key="index"
              class="rating-item"
            >
              <label class="rating-label">{{ index + 1 }}. {{ item.label }}</label>
              <div class="rating-options">
                <div
                  v-for="option in item.options"
                  :key="option.value"
                  class="rating-option"
                  :class="{ active: form.ratings[index] === option.value }"
                  @click="setRating(index, option.value)"
                >
                  <span class="rating-emoji" :style="{ color: option.color, fontSize: '24px' }">
                    {{ option.icon }}
                  </span>
                  <span>{{ option.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 评价意见 -->
          <el-form-item label="评价意见与建议" required>
            <el-input
              v-model="form.comments"
              type="textarea"
              :rows="4"
              style="width: 80%" 
              placeholder="请输入对挂单人在寺表现的具体评价和建议"
            />
          </el-form-item>

          <!-- 综合评价 -->
          <el-form-item label="综合评价等级" required>
            <el-select
              v-model="form.overall"
              placeholder="请选择综合评价等级"
              style="width: 200px"
            >
              <el-option label="优秀" value="excellent" />
              <el-option label="良好" value="good" />
              <el-option label="一般" value="average" />
              <el-option label="较差" value="poor" />
              <el-option label="差" value="bad" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 已评价内容展示 -->
      <div v-else-if="showEvaluation" class="evaluation-content">
        <h4 class="section-title">
          <el-icon><Star /></el-icon>
          评价内容
        </h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="纪律遵守情况">
            <div class="rating-display">
              <span class="rating-emoji">{{ getRatingEmoji(viewEvaluationData.discipline) }}</span>
              <span class="rating-label">{{ getRatingLabel(viewEvaluationData.discipline) }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="礼仪规范情况">
            <div class="rating-display">
              <span class="rating-emoji">{{ getRatingEmoji(viewEvaluationData.etiquette) }}</span>
              <span class="rating-label">{{ getRatingLabel(viewEvaluationData.etiquette) }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="集体活动参与">
            <div class="rating-display">
              <span class="rating-emoji">{{ getRatingEmoji(viewEvaluationData.activity) }}</span>
              <span class="rating-label">{{ getRatingLabel(viewEvaluationData.activity) }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="环境维护与卫生">
            <div class="rating-display">
              <span class="rating-emoji">{{ getRatingEmoji(viewEvaluationData.environment) }}</span>
              <span class="rating-label">{{ getRatingLabel(viewEvaluationData.environment) }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="与人相处情况">
            <div class="rating-display">
              <span class="rating-emoji">{{ getRatingEmoji(viewEvaluationData.interaction) }}</span>
              <span class="rating-label">{{ getRatingLabel(viewEvaluationData.interaction) }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="评价意见">
            {{ viewEvaluationData.comments }}
          </el-descriptions-item>
          <el-descriptions-item label="综合评价等级">
            <el-tag :type="getOverallTagType(viewEvaluationData.overall)">
              {{ getOverallLabel(viewEvaluationData.overall) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div v-if="!showForm && !showEvaluation" class="view-actions">
          <el-button @click="handleClose">关闭</el-button>
          <el-button type="primary" @click="$emit('start-evaluation')">开始评价</el-button>
        </div>
        <div v-else-if="showForm" class="form-actions">
          <el-button @click="$emit('cancel-evaluation')">取消</el-button>
          <el-button type="primary" @click="$emit('submit-evaluation')" :loading="submitting">
            提交评价
          </el-button>
        </div>
        <div v-else class="evaluation-actions">
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>
      <div class="dialog-footer-bottom">
        <el-button type="primary" @click="$emit('download-profile')">
          <el-icon><Download /></el-icon>
          下载挂单记录
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Star, StarFilled, Menu, Message, Download } from '@element-plus/icons-vue'
// 使用 Element Plus 的表情图标替代 FontAwesome
const Frown = '👎' // 差
const Meh = '👎🏻' // 较差
const MehRollingEyes = '😑' // 一般
const Smile = '😊' // 良好
const GrinStars = '🤩' // 优秀
import type {
  EvaluationRecord as Profile,
  EvaluationForm,
  RatingOption,
  RatingItem,
  ViewEvaluationData,
} from '@/types/evaluation'

// Props
interface Props {
  visible: boolean
  title: string
  profile: Profile
  showForm: boolean
  showEvaluation: boolean
  form: EvaluationForm
  submitting: boolean
  viewEvaluationData: ViewEvaluationData
  ratingItems: RatingItem[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  profile: () => ({} as Profile),
  showForm: false,
  showEvaluation: false,
  form: () => ({
    ratings: [0, 0, 0, 0, 0],
    comments: '',
    overall: ''
  }),
  submitting: false,
  viewEvaluationData: () => ({
    discipline: 4,
    etiquette: 5,
    activity: 4,
    environment: 5,
    interaction: 4,
    comments: '',
    overall: 'good'
  }),
  ratingItems: () => []
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
  'start-evaluation': []
  'cancel-evaluation': []
  'submit-evaluation': []
  'download-profile': []
  'set-rating': [index: number, value: number]
}>()

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 方法
const handleClose = () => {
  emit('close')
}

const setRating = (index: number, value: number) => {
  emit('set-rating', index, value)
}

// 工具函数
const maskPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

const getTypeLabel = (type: string) => {
  const labels = {
    short: '短住',
    express: '直通车',
    monk: '僧亲',
    group: '团队挂单',
    special: '特殊客人'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    short: 'primary',
    express: 'success',
    monk: 'warning',
    group: 'info',
    special: 'danger'
  }
  return types[type] || 'info'
}

const getOverallLabel = (overall: string) => {
  const labels = {
    excellent: '优秀',
    good: '良好',
    average: '一般',
    poor: '较差',
    bad: '差'
  }
  return labels[overall] || overall
}

const getOverallTagType = (overall: string) => {
  const types = {
    excellent: 'success',
    good: 'primary',
    average: 'warning',
    poor: 'danger',
    bad: 'danger'
  }
  return types[overall] || 'info'
}

// 根据评分值获取对应的表情图标
const getRatingEmoji = (score: number): string => {
  switch (score) {
    case 1:
      return '👎' // 差
    case 2:
      return '😐' // 较差
    case 3:
      return '😑' // 一般
    case 4:
      return '😊' // 良好
    case 5:
      return '🤩' // 优秀
    default:
      return '😐' // 默认为较差
  }
}

// 根据评分值获取对应的标签文本
const getRatingLabel = (score: number): string => {
  switch (score) {
    case 1:
      return '差'
    case 2:
      return '较差'
    case 3:
      return '一般'
    case 4:
      return '良好'
    case 5:
      return '优秀'
    default:
      return '未评分'
  }
}
</script>

<style scoped lang="scss">
.evaluation-dialog {
  .dialog-content {
    max-height: 70vh;
    overflow-y: auto;
  }

  .profile-section {
    margin-bottom: 32px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #8b5a2b;
      margin-bottom: 16px;
    }
  }

  .evaluation-form {
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #8b5a2b;
      margin-bottom: 24px;
    }

    .rating-sections {
      margin-bottom: 32px;

      .rating-item {
        margin-bottom: 24px;

        .rating-label {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
        }

        .rating-options {
          display: flex;
          gap: 24px;

          .rating-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.3s;
            border: 2px solid transparent;

            &:hover {
              background: #f5f7fa;
              transform: translateY(-2px);
            }

            &.active {
              background: #e8f5e8;
              border: 2px solid #67c23a;
              transform: scale(1.05);
            }

            .rating-emoji {
              font-size: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s;
            }

            span:not(.rating-emoji) {
              font-size: 12px;
              color: #666;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .evaluation-content {
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #8b5a2b;
      margin-bottom: 16px;
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 8px;

      .rating-emoji {
        font-size: 20px;
        display: inline-block;
      }

      .rating-label {
        font-weight: 500;
        color: #333;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .view-actions,
  .form-actions,
  .evaluation-actions {
    display: flex;
    gap: 12px;
  }
}

.dialog-footer-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>