<template>
  <el-card class="application-card" shadow="hover">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="applicant-info">
        <span class="name">{{ application.applicantName }}</span>
        <span class="id-card">{{ application.idCardMasked || '****' }}</span>
        <el-tag v-if="application.status !== undefined" :type="getStatusTag(application.status).type" size="small"
          class="status-tag">
          {{ getStatusTag(application.status).label }}
        </el-tag>
      </div>
      <div class="action-buttons">
        <el-button type="primary" round size="small" @click="viewDetail(application.id)">
          <el-icon>
            <View />
          </el-icon> 查看详情
        </el-button>
        <el-button v-if="canCancelApplication" type="danger" round size="small"
          @click="$emit('cancel-application', application.id)">
          <el-icon>
            <Close />
          </el-icon> 取消申请
        </el-button>
        <el-button v-else-if="canModifyInfo" type="warning" round size="small"
          @click="$emit('modify-info', application.id)">
          <el-icon>
            <EditPen />
          </el-icon> 修改信息
        </el-button>
        <el-button v-else-if="canApplyExtend" type="primary" round size="small"
          @click="$emit('apply-extend', application.id)">
          <el-icon>
            <Promotion />
          </el-icon> 申请续住
        </el-button>
        <el-button v-else-if="canApplyChangeBed" type="info" round size="small"
          @click="$emit('apply-change-bed', application.id)">
          <el-icon>
            <RefreshRight />
          </el-icon> 换床申请
        </el-button>
        <el-button v-else-if="canApplyCheckout" type="danger" round size="small"
          @click="$emit('apply-checkout', application.id)">
          <el-icon>
            <SwitchButton />
          </el-icon> 申请退住
        </el-button>
        <el-button v-else-if="canRate" type="success" round size="small" @click="$emit('rate', application.id)">
          <el-icon>
            <Star />
          </el-icon> 填写评价
        </el-button>
        <el-button v-else-if="canReapply" type="warning" round size="small" @click="$emit('reapply', application.id)">
          <el-icon>
            <Refresh />
          </el-icon> 重新申请
        </el-button>
      </div>
    </div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <div class="info-row">
        <div class="info-item">
          <span class="label">申请日期:</span>
          <span class="value">{{ formatDate(application.createdAt || application.updatedAt) }}</span>
        </div>
        <div class="info-item">
          <span class="label">预计入住日期:</span>
          <span class="value">{{ application.checkinDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">挂单目的:</span>
          <span class="value">{{ purpose }}</span>
        </div>
      </div>

      <div v-if="isPending" class="info-row">
        <div class="info-item">
          <span class="label">入住日期:</span>
          <span class="value">{{ application.checkinDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">退住日期:</span>
          <span class="value">{{ application.checkoutDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">分配床位:</span>
          <span class="value">{{ bedInfo }}</span>
        </div>
      </div>

      <div v-if="isCheckedIn" class="info-row">
        <div class="info-item">
          <span class="label">入住日期:</span>
          <span class="value">{{ application.checkinDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前退住日期:</span>
          <span class="value">{{ application.checkoutDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前床位:</span>
          <span class="value">{{ bedInfo }}</span>
        </div>
      </div>

      <div v-if="isCheckedOut" class="info-row">
        <div class="info-item">
          <span class="label">入住日期:</span>
          <span class="value">{{ application.checkinDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">退住日期:</span>
          <span class="value">{{ application.checkoutDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">挂单时长:</span>
          <span class="value">{{ application.days }}天</span>
        </div>
      </div>

      <div v-if="isRejected" class="info-row">
        <div class="info-item">
          <span class="label">申请入住日期:</span>
          <span class="value">{{ application.checkinDate }}</span>
        </div>
        <div class="info-item">
          <span class="label">申请退住日期:</span>
          <span class="value">{{ application.checkoutDate }}</span>
        </div>
      </div>
    </div>
  </el-card>

  
</template>

<script setup lang="ts">
import { computed , ref} from 'vue';
import { ApplicationStatus } from '@/types/application';
import { ElMessage } from 'element-plus';
import { View, Close, EditPen, Promotion, RefreshRight, SwitchButton, Star, Refresh, InfoFilled, CircleCheck, Warning } from '@element-plus/icons-vue';


const props = defineProps<{
  application: any;
}>();

const emit = defineEmits([
  'view-detail',
  'cancel-application',
  'modify-info',
  'apply-extend',
  'apply-change-bed',
  'apply-checkout',
  'rate',
  'reapply',
]);


// const viewDetail = (item: OrderItem) => {
//   currentAppId.value = item.id
//   detailVisible.value = true
//   // ElMessage.info(`查看订单 ${item.id}`);
// }

const viewDetail = (applicationId: number) => {
  console.log(applicationId)
  emit('view-detail', applicationId)
}
// 获取状态标签
const getStatusTag = (status: number) => {
  const statusMap: Record<number, { label: string; type: 'success' | 'info' | 'warning' | 'danger' | 'primary' }> = {
    [ApplicationStatus.ALL]: { label: '全部状态', type: '' },
    [ApplicationStatus.APPLIED]: { label: '申请中', type: 'warning' },
    [ApplicationStatus.PENDING]: { label: '待入住', type: 'info' },
    [ApplicationStatus.CHECKED_IN]: { label: '入住中', type: 'success' },
    [ApplicationStatus.CHECKED_OUT]: { label: '已退住', type: 'default' },
    [ApplicationStatus.REJECTED]: { label: '未通过', type: 'danger' },
  };
  return statusMap[status] || { label: '未知状态', type: 'default' };
};

const isPending = computed(() => props.application.status === ApplicationStatus.PENDING);
const isCheckedIn = computed(() => props.application.status === ApplicationStatus.CHECKED_IN);
const isCheckedOut = computed(() => props.application.status === ApplicationStatus.CHECKED_OUT);
const isRejected = computed(() => props.application.status === ApplicationStatus.REJECTED);

// 获取挂单目的
const purpose = computed(() => {
  const app = props.application;
  if (!app) return '';
  if (app.applicationType === 0) return '禅修学习';
  if (app.applicationType === 1) return '参访交流';
  return '其他';
});

// 获取床位信息
const bedInfo = computed(() => {
  const app = props.application;
  if (app.bedInfo) return app.bedInfo;
  return '男众寮房 302室 05床'; // 默认值
});

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};


// 判断是否可以取消申请
const canCancelApplication = (app: any) => {
  return app.status === ApplicationStatus.APPLIED && app.reviewStatus === 10;
};

// 判断是否可以修改信息
const canModifyInfo = (app: any) => {
  return app.status === ApplicationStatus.PENDING;
};

// 判断是否可以申请续住
const canApplyExtend = (app: any) => {
  return app.status === ApplicationStatus.CHECKED_IN;
};

// 判断是否可以换床申请
const canApplyChangeBed = (app: any) => {
  return app.status === ApplicationStatus.CHECKED_IN;
};

// 判断是否可以申请退住
const canApplyCheckout = (app: any) => {
  return app.status === ApplicationStatus.CHECKED_IN;
};

// 判断是否可以填写评价
const canRate = (app: any) => {
  return app.status === ApplicationStatus.CHECKED_OUT;
};

// 判断是否可以重新申请
const canReapply = (app: any) => {
  return app.status === ApplicationStatus.REJECTED;
};
</script>

<style scoped>
.application-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.id-card {
  color: #666;
  font-size: 14px;
}

.status-tag {
  margin-left: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 15px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.info-item {
  flex: 1 1 30%;
  min-width: 200px;
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  color: #666;
  width: 100px;
  display: inline-block;
}

.value {
  color: #333;
}

.progress-container {
  margin-top: 15px;
}

.progress-label {
  font-weight: bold;
  margin-bottom: 8px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.progress-steps .active {
  color: #333;
  font-weight: bold;
}
.tip-box {
  margin-top: 15px;
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.tip-box .el-icon {
  font-size: 16px;
}



</style>