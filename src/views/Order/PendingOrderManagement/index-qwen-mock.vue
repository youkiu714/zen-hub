<template>
  <div class="my-orders-page">
    <div class="page-header">
      <h1>我的挂单</h1>
      <p class="page-desc">查看和管理您的挂单申请状态，处理入住、续住、换床和退住等操作</p>
      <el-button type="primary" @click="handleNewOrder" class="new-order-btn">
        <el-icon><Plus /></el-icon>
        新挂单申请
      </el-button>
    </div>

    <!-- 状态筛选 -->
    <div class="status-filter">
      <el-button-group>
        <el-button
          v-for="filter in statusFilters"
          :key="filter.value"
          :type="activeStatus === filter.value ? 'primary' : 'default'"
          @click="changeStatus(filter.value)"
          :class="{ 'active-filter': activeStatus === filter.value }"
        >
          <el-icon v-if="filter.icon"><component :is="filter.icon" /></el-icon>
          {{ filter.label }}
        </el-button>
      </el-button-group>
    </div>

    <!-- 加载与错误状态 -->
    <el-empty v-if="loading && orders.length === 0" description="加载中..." />
    <el-alert v-else-if="error" type="error" :closable="false" show-icon>
      {{ error }}
    </el-alert>

    <!-- 订单列表 -->
    <div v-else class="orders-list">
      <div v-for="item in filteredOrders" :key="item.id" class="order-card">
        <div class="card-header">
          <div class="user-info">
            <span class="user-name">{{ item.parsedPerson?.name || '匿名' }}</span>
            <span class="user-id">{{ formatIdCard(item.parsedPerson?.idCard) }}</span>
            <el-tag
              :type="getTagType(item.status)"
              size="small"
              class="status-tag"
            >
              {{ getStatusText(item.status) }}
            </el-tag>
          </div>
          <div class="actions">
            <el-button type="info" plain size="small" @click="viewDetail(item)">
              <el-icon><View /></el-icon> 查看详情
            </el-button>
            <el-button
              v-if="item.status === OrderStatus.Applied"
              type="danger"
              plain
              size="small"
              @click="cancelOrder(item)"
            >
              <el-icon><Close /></el-icon> 取消申请
            </el-button>
            <el-button
              v-else-if="item.status === OrderStatus.Pending"
              type="warning"
              plain
              size="small"
              @click="editOrder(item)"
            >
              <el-icon><Edit /></el-icon> 修改信息
            </el-button>
            <el-button
              v-else-if="item.status === OrderStatus.CheckedIn"
              type="primary"
              plain
              size="small"
              @click="applyExtend(item)"
            >
              <el-icon><DocumentAdd /></el-icon> 申请续住
            </el-button>
            <el-button
              v-else-if="item.status === OrderStatus.CheckedIn"
              type="primary"
              plain
              size="small"
              @click="applyChangeBed(item)"
            >
              <el-icon><Switch /></el-icon> 换床申请
            </el-button>
            <el-button
              v-else-if="item.status === OrderStatus.CheckedIn"
              type="primary"
              plain
              size="small"
              @click="applyCheckout(item)"
            >
              <el-icon><Promotion /></el-icon> 申请退住
            </el-button>
            <el-button
              v-else-if="item.status === OrderStatus.CheckedOut"
              type="success"
              plain
              size="small"
              @click="rateOrder(item)"
            >
              <el-icon><StarFilled /></el-icon> 填写评价
            </el-button>
            <el-button
              v-else-if="item.status === OrderStatus.Rejected"
              type="primary"
              plain
              size="small"
              @click="reapplyOrder(item)"
            >
              <el-icon><Refresh /></el-icon> 重新申请
            </el-button>
          </div>
        </div>

        <div class="card-body">
          <div class="row">
            <div class="col">
              <div class="label">申请日期:</div>
              <div class="value">{{ formatDate(item.createdAt || item.checkinDate) }}</div>
            </div>
            <div class="col">
              <div class="label">预计入住日期:</div>
              <div class="value">{{ formatDate(item.checkinDate) }}</div>
            </div>
            <div class="col">
              <div class="label">预计退住日期:</div>
              <div class="value">{{ formatDate(item.checkoutDate) }}</div>
            </div>
            <div class="col">
              <div class="label">挂单目的:</div>
              <div class="value">{{ item.specialRequest || '禅修学习' }}</div>
            </div>
          </div>

          <div v-if="item.status === OrderStatus.Applied" class="progress-section">
            <div class="progress-label">申请进度</div>
            <el-progress
              :percentage="getProgressPercentage(item.reviewStatus)"
              :stroke-width="8"
              :color="getProgressColor(getProgressPercentage(item.reviewStatus))"
            />
            <div class="progress-steps">
              <span>已提交申请</span>
              <span>审核中</span>
              <span>审核完成</span>
            </div>
          </div>

          <div v-if="item.status === OrderStatus.Pending" class="bed-info">
            <div class="label">分配床位:</div>
            <div class="value">男众寮房 302室 05床</div>
          </div>

          <div v-if="item.status === OrderStatus.CheckedIn" class="checkin-notice">
            <el-alert
              title="入住已确认"
              type="success"
              description="请遵守寺院作息时间，保持寮房安静整洁，共同维护良好的修行环境。"
              show-icon
            />
          </div>

          <div v-if="item.status === OrderStatus.CheckedOut" class="checkout-notice">
            <el-alert
              title="物品遗落提醒"
              type="warning"
              description="您在退住时遗落了一本《金刚经》在寮房，请尽快联系客堂取回，联系电话：0571-87968665。"
              show-icon
            />
          </div>

          <div v-if="item.status === OrderStatus.Rejected" class="reject-notice">
            <el-alert
              title="审核不通过原因"
              type="error"
              description="您申请期间正值寺院夏季禅七法会，寮房床位已满，建议您选择其他时间段申请或关注寺院公告了解法会期间挂单政策。"
              show-icon
            />
          </div>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="total > pageSize"
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      class="pagination"
    />

    <!-- 查看详情 -->
    <ApplicationDetailDialog
      v-model="detailVisible"
      :application-id="currentAppId"
      @close="onDetailClosed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  View,
  Plus,
  Close,
  Edit,
  DocumentAdd,
  Switch,
  Promotion,
  StarFilled,
  Refresh,
} from '@element-plus/icons-vue';

// ✅ 导入 API 和类型
import { getLodgingApplications } from '@/api/pendingOrder';
import type { OrderItem } from '@/types/order';
import { OrderStatus, ReviewStatus } from '@/types/order';
import ApplicationDetailDialog from './components/ApplicationDetailDialog.vue'

const detailVisible = ref(false)
const currentAppId = ref(0)


const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}
// 状态筛选
const statusFilters = [
  { value: null, label: '全部状态', icon: 'Menu' },
  { value: OrderStatus.Applied, label: '申请中', icon: 'Document' },
  { value: OrderStatus.Pending, label: '待入住', icon: 'CircleCheck' },
  { value: OrderStatus.CheckedIn, label: '入住中', icon: 'House' },
  { value: OrderStatus.CheckedOut, label: '已退住', icon: 'ArrowRight' },
  { value: OrderStatus.Rejected, label: '未通过', icon: 'CircleClose' },
];

// 响应式数据
const activeStatus = ref<null | OrderStatus>(null);
const orders = ref<OrderItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);

// 安全解析 JSON
const parseSafe = (str: string | null): any => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    console.warn('JSON 解析失败:', str);
    return null;
  }
};

// 获取数据
const fetchOrders = async (page: number = 1) => {
  loading.value = true;
  error.value = null;
  try {
    // const res = await getLodgingApplications({
    //   pageNo: page,
    //   pageSize: pageSize.value,
    // });

    // if (res.code !== 0) {
    //   throw new Error(res.message || '接口返回错误');
    // }

    // const records = res.data.records.map((item) => ({
    //   ...item,
    //   parsedPerson: parseSafe(item.personSnapshot),
    //   parsedPractice: parseSafe(item.practiceSnapshot),
    // }));

    // orders.value = records;
    orders.value = [
            {
                "id": 2,
                "personId": 1,
                "applicationType": 0,
                "checkinDate": "2025-11-01",
                "checkoutDate": "2025-11-01",
                "specialRequest": "无",
                "recommenderName": "王",
                "recommenderPhone": "13548789658",
                "recommenderRelation": "上位",
                "recommenderComment": "值得推荐",
                "status": 10,
                "createdBy": null,
                "updatedBy": null,
                "isDeleted": 0,
                "createdAt": null,
                "updatedAt": null,
                "personSnapshot": "{\"city\": \"北京\", \"name\": \"乔\", \"major\": \"计算机\", \"ethnic\": \"汉\", \"gender\": 1, \"idCard\": \"211003198145784586\", \"mobile\": \"15910520755\", \"school\": \"沈阳建筑\", \"skills\": \"编程\", \"weChat\": \"joe_relax\", \"address\": \"海淀112312312312312312\", \"marital\": \"否\", \"photoUrl\": \"string\", \"province\": \"北京\", \"education\": \"本科\", \"occupation\": \"技术123123123\", \"diseaseHistory\": \"无\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"张三\", \"contactPhone\": \"13548578965\"}, {\"sortNo\": 1, \"contactName\": \"李四\", \"contactPhone\": \"17848578965\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无\"}",
                "practiceSnapshot": "{\"visitRecords\": \"三次\", \"refugeTakenDate\": \"2025-12-24\", \"yearsOfPractice\": 8, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"学修\", \"currentPracticeExperience\": \"背颂1231231231\"}",
                "reviewStatus": 10
            },
            {
                "id": 3,
                "personId": 1,
                "applicationType": 0,
                "checkinDate": "2025-11-01",
                "checkoutDate": "2025-11-01",
                "specialRequest": "无",
                "recommenderName": "王",
                "recommenderPhone": "13548789658",
                "recommenderRelation": "上位",
                "recommenderComment": "值得推荐",
                "status": 10,
                "createdBy": null,
                "updatedBy": null,
                "isDeleted": 0,
                "createdAt": null,
                "updatedAt": null,
                "personSnapshot": "{\"city\": \"北京\", \"name\": \"乔\", \"major\": \"计算机\", \"ethnic\": \"汉\", \"gender\": 1, \"idCard\": \"211003198145784586\", \"mobile\": \"15910520755\", \"school\": \"沈阳建筑\", \"skills\": \"编程\", \"weChat\": \"joe_relax\", \"address\": \"海淀112312312312312312\", \"marital\": \"否\", \"photoUrl\": \"string\", \"province\": \"北京\", \"education\": \"本科\", \"occupation\": \"技术123123123\", \"diseaseHistory\": \"无\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"张三\", \"contactPhone\": \"13548578965\"}, {\"sortNo\": 1, \"contactName\": \"李四\", \"contactPhone\": \"17848578965\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无\"}",
                "practiceSnapshot": "{\"visitRecords\": \"三次\", \"refugeTakenDate\": \"2025-12-24\", \"yearsOfPractice\": 8, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"学修\", \"currentPracticeExperience\": \"背颂1231231231\"}",
                "reviewStatus": 10
            },
            {
                "id": 4,
                "personId": 1,
                "applicationType": 0,
                "checkinDate": "2025-11-01",
                "checkoutDate": "2025-11-01",
                "specialRequest": "无",
                "recommenderName": "王",
                "recommenderPhone": "13548789658",
                "recommenderRelation": "上位",
                "recommenderComment": "值得推荐",
                "status": 10,
                "createdBy": null,
                "updatedBy": null,
                "isDeleted": 0,
                "createdAt": null,
                "updatedAt": null,
                "personSnapshot": "{\"city\": \"北京\", \"name\": \"乔\", \"major\": \"计算机\", \"ethnic\": \"汉\", \"gender\": 1, \"idCard\": \"211003198145784586\", \"mobile\": \"15910520755\", \"school\": \"沈阳建筑\", \"skills\": \"编程\", \"weChat\": \"joe_relax\", \"address\": \"海淀112312312312312312\", \"marital\": \"否\", \"photoUrl\": \"string\", \"province\": \"北京\", \"education\": \"本科\", \"occupation\": \"技术123123123\", \"diseaseHistory\": \"无\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"张三\", \"contactPhone\": \"13548578965\"}, {\"sortNo\": 1, \"contactName\": \"李四\", \"contactPhone\": \"17848578965\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无\"}",
                "practiceSnapshot": "{\"visitRecords\": \"三次\", \"refugeTakenDate\": \"2025-12-24\", \"yearsOfPractice\": 8, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"学修\", \"currentPracticeExperience\": \"背颂1231231231\"}",
                "reviewStatus": 10
            },
            {
                "id": 5,
                "personId": 1,
                "applicationType": 0,
                "checkinDate": "2025-11-01",
                "checkoutDate": "2025-11-01",
                "specialRequest": "无",
                "recommenderName": "王",
                "recommenderPhone": "13548789658",
                "recommenderRelation": "上位",
                "recommenderComment": "值得推荐",
                "status": 10,
                "createdBy": null,
                "updatedBy": null,
                "isDeleted": 0,
                "createdAt": null,
                "updatedAt": null,
                "personSnapshot": "{\"city\": \"北京\", \"name\": \"乔\", \"major\": \"计算机\", \"ethnic\": \"汉\", \"gender\": 1, \"idCard\": \"211003198145784586\", \"mobile\": \"15910520755\", \"school\": \"沈阳建筑\", \"skills\": \"编程\", \"weChat\": \"joe_relax\", \"address\": \"海淀112312312312312312\", \"marital\": \"否\", \"photoUrl\": \"string\", \"province\": \"北京\", \"education\": \"本科\", \"occupation\": \"技术123123123\", \"diseaseHistory\": \"无\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"张三\", \"contactPhone\": \"13548578965\"}, {\"sortNo\": 1, \"contactName\": \"李四\", \"contactPhone\": \"17848578965\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无\"}",
                "practiceSnapshot": "{\"visitRecords\": \"三次\", \"refugeTakenDate\": \"2025-12-24\", \"yearsOfPractice\": 8, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"学修\", \"currentPracticeExperience\": \"背颂1231231231\"}",
                "reviewStatus": 20
            },
            {
                "id": 1,
                "personId": 1,
                "applicationType": 0,
                "checkinDate": "2025-11-01",
                "checkoutDate": "2025-11-01",
                "specialRequest": "无",
                "recommenderName": "王",
                "recommenderPhone": "13548789658",
                "recommenderRelation": "上位",
                "recommenderComment": "值得推荐",
                "status": 20,
                "createdBy": null,
                "updatedBy": null,
                "isDeleted": 0,
                "createdAt": null,
                "updatedAt": "2025-11-02 01:15:07",
                "personSnapshot": null,
                "practiceSnapshot": null,
                "reviewStatus": 10
            }
        ]
    // total.value = res.data.total;
    total.value = 3
    currentPage.value = page;
  } catch (err: any) {
    error.value = err.message || '加载失败，请检查网络或稍后重试';
    console.error('获取挂单列表失败:', err);
  } finally {
    loading.value = false;
  }
};

// 计算属性：筛选订单
const filteredOrders = computed(() => {
  if (activeStatus.value === null) return orders.value;
  return orders.value.filter((item) => item.status === activeStatus.value);
});

// 分页切换
const handlePageChange = (page: number) => {
  fetchOrders(page);
};

// 初始化
onMounted(() => {
  fetchOrders(1);
});

// 工具函数
const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Applied: return '申请中';
    case OrderStatus.Pending: return '待入住';
    case OrderStatus.CheckedIn: return '入住中';
    case OrderStatus.CheckedOut: return '已退住';
    case OrderStatus.Rejected: return '未通过';
    default: return '未知状态';
  }
};

const getTagType = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Applied: return 'warning';
    case OrderStatus.Pending: return 'info';
    case OrderStatus.CheckedIn: return 'success';
    case OrderStatus.CheckedOut: return 'default';
    case OrderStatus.Rejected: return 'danger';
    default: return 'info';
  }
};

const getProgressPercentage = (reviewStatus: ReviewStatus) => {
  switch (reviewStatus) {
    case ReviewStatus.Pending: return 33;
    case ReviewStatus.Approved: return 66;
    case ReviewStatus.Rejected: return 100;
    default: return 0;
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage < 33) return '#e6a23c';
  if (percentage < 66) return '#409eff';
  return '#67c23a';
};

const formatIdCard = (idCard: string | undefined) => {
  return idCard ? idCard.slice(0, 3) + '************' + idCard.slice(-3) : '******';
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '未知';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const changeStatus = (status: null | OrderStatus) => {
  activeStatus.value = status;
};

// 操作占位
const handleNewOrder = () => ElMessage.info('跳转新挂单申请');
const viewDetail = (item: OrderItem) => {
  currentAppId.value = item.id
  detailVisible.value = true
  // ElMessage.info(`查看订单 ${item.id}`);
}

const cancelOrder = (item: OrderItem) => ElMessageBox.confirm(`确定取消订单 ${item.id}？`).then(() => ElMessage.success('已取消'));
const editOrder = (item: OrderItem) => ElMessage.info('修改信息');
const applyExtend = (item: OrderItem) => ElMessage.info('申请续住');
const applyChangeBed = (item: OrderItem) => ElMessage.info('申请换床');
const applyCheckout = (item: OrderItem) => ElMessage.info('申请退住');
const rateOrder = (item: OrderItem) => ElMessage.info('填写评价');
const reapplyOrder = (item: OrderItem) => ElMessage.info('重新申请');
</script>

<style scoped>
.my-orders-page {
  padding: 20px;
  background-color: #fdf6e3;
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h1 {
  color: #6b4e3d;
  font-size: 24px;
  font-weight: bold;
}
.page-header .page-desc {
  color: #6b4e3d;
  font-size: 14px;
  margin-top: 5px;
}
.new-order-btn {
  background-color: #8b5e3c;
  border-color: #8b5e3c;
  color: white;
}
.status-filter {
  margin-bottom: 20px;
  text-align: center;
}
.status-filter .el-button {
  margin: 0 5px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}
.status-filter .el-button.active-filter {
  background-color: #8b5e3c;
  color: white;
  border-color: #8b5e3c;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-name {
  font-weight: bold;
  font-size: 16px;
}
.user-id {
  color: #999;
  font-size: 14px;
}
.actions {
  display: flex;
  gap: 8px;
}
.card-body {
  padding-top: 15px;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}
.value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.progress-section, .bed-info, .checkin-notice, .checkout-notice, .reject-notice {
  margin-top: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
@media (max-width: 768px) {
  .row { grid-template-columns: 1fr; }
  .card-header { flex-direction: column; gap: 10px; }
  .actions { width: 100%; justify-content: space-around; }
}
</style>