<template>
  <div class="order-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的挂单</h1>
      <p>查看和管理您的挂单申请状态，处理入住、缺住、换床和退住等操作</p>
    </div>

    <!-- 状态筛选 -->
    <div class="status-filter">
      <el-radio-group v-model="activeStatus" @change="handleStatusChange">
        <el-radio-button label="all">全部状态</el-radio-button>
        <el-radio-button label="10">申请中</el-radio-button>
        <el-radio-button label="20">待入住</el-radio-button>
        <el-radio-button label="30">入住中</el-radio-button>
        <el-radio-button label="40">已退住</el-radio-button>
        <el-radio-button label="50">未通过</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 挂单列表 -->
    <div class="order-list" v-loading="loading">
      <div 
        v-for="order in filteredOrders" 
        :key="order.id" 
        class="order-card"
      >
        <!-- 申请人信息 -->
        <div class="applicant-info">
          <div class="name-id">
            <span class="name">{{ getPersonName(order) }}</span>
            <span class="id-card">{{ formatIdCard(getIdCard(order)) }}</span>
            <el-tag 
              :type="getStatusType(order.status)" 
              size="small"
              class="status-tag"
            >
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
          <div class="application-date">
            申请日期: {{ formatDate(order.createdAt) }}
          </div>
        </div>

        <!-- 入住信息 -->
        <div class="stay-info">
          <div class="date-info">
            <div class="date-item">
              <span class="label">预计入住日期</span>
              <span class="value">{{ formatDate(order.checkinDate) }}</span>
            </div>
            <div class="date-item">
              <span class="label">预计退住日期</span>
              <span class="value">{{ formatDate(order.checkoutDate) }}</span>
            </div>
          </div>
          
          <!-- 挂单目的 -->
          <div class="purpose" v-if="order.specialRequest">
            <span class="label">挂单目的</span>
            <span class="value">{{ order.specialRequest }}</span>
          </div>
          
          <!-- 分配床位 -->
          <div class="bed-assignment" v-if="order.status >= 30">
            <span class="label">分配床位</span>
            <span class="value">男众资质 302室 05床</span>
          </div>
        </div>

        <!-- 申请进度 -->
        <div class="application-progress" v-if="order.status === 10">
          <div class="progress-steps">
            <div 
              class="step" 
              :class="{ active: order.reviewStatus >= 10 }"
            >
              <div class="step-icon">1</div>
              <div class="step-text">已提交申请</div>
            </div>
            <div 
              class="step" 
              :class="{ active: order.reviewStatus >= 20 }"
            >
              <div class="step-icon">2</div>
              <div class="step-text">审核中</div>
            </div>
            <div 
              class="step" 
              :class="{ active: order.reviewStatus >= 30 }"
            >
              <div class="step-icon">3</div>
              <div class="step-text">审核完成</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons" v-if="order.status === 30">
          <el-button type="primary" size="small" @click="handleViewDetail(order)">
            查看详情
          </el-button>
          <el-button size="small" @click="handleAbsence(order)">
            申请缺住
          </el-button>
          <el-button size="small" @click="handleChangeBed(order)">
            换床申请
          </el-button>
          <el-button size="small" @click="handleCheckout(order)">
            申请退住
          </el-button>
        </div>

        <!-- 提示信息 -->
        <div class="tips" v-if="order.status === 20">
          <p>请在入住日当天携带有效证件到客房办理入住手续，建议上午9:00-11:00或下午14:00-16:00之间办理。</p>
        </div>

        <!-- 审核不通过原因 -->
        <div class="rejection-reason" v-if="order.status === 50">
          <p class="reason-title">审核不通过原因</p>
          <p class="reason-content">
            您申请期间正在审批服务卡上签名，要求在住日期，建议您选择其他时间段申请或关注专属公告了解本会期间挂单流程。
          </p>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredOrders.length === 0 && !loading">
        <el-empty description="暂无挂单记录" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="filteredOrders.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { OrderItem } from '../types'
import { getOrderList } from '@/api/pendingOrder'

// 响应式数据
const loading = ref(false)
const orders = ref<OrderItem[]>([])
const activeStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算属性 - 根据状态筛选订单
const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value
  }
  
  const status = parseInt(activeStatus.value)
  return orders.value.filter(order => order.status === status)
})

// 生命周期
onMounted(() => {
  fetchOrderList()
})

// 获取挂单列表
const fetchOrderList = async () => {
  try {
    loading.value = true
    const response = await getOrderList({
      current: currentPage.value,
      size: pageSize.value
    })
    console.log(response);
    
    orders.value = response.records
    total.value = response.total
    
  } catch (error) {
    console.error('获取挂单列表失败:', error)
    ElMessage.error('获取挂单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取申请人姓名
const getPersonName = (order: OrderItem) => {
  if (order.personSnapshot) {
    try {
      const person = JSON.parse(order.personSnapshot)
      return person.name || '未知'
    } catch (e) {
      console.error('解析personSnapshot失败:', e)
    }
  }
  return '未知'
}

// 获取身份证号
const getIdCard = (order: OrderItem) => {
  if (order.personSnapshot) {
    try {
      const person = JSON.parse(order.personSnapshot)
      return person.idCard || ''
    } catch (e) {
      console.error('解析personSnapshot失败:', e)
    }
  }
  return ''
}

// 格式化身份证号（显示前1位和后4位）
const formatIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 5) return idCard
  return `${idCard.substring(0, 1)}${'*'.repeat(idCard.length - 5)}${idCard.substring(idCard.length - 4)}`
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    10: '申请中',
    20: '待入住',
    30: '入住中',
    40: '已退住',
    50: '未通过'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态标签类型
const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    10: 'warning',
    20: 'primary',
    30: 'success',
    40: 'info',
    50: 'danger'
  }
  return typeMap[status] || 'info'
}

// 格式化日期
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  } catch (e) {
    return dateStr
  }
}

// 事件处理
const handleStatusChange = (status: string) => {
  currentPage.value = 1
  fetchOrderList()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrderList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchOrderList()
}

const handleViewDetail = (order: OrderItem) => {
  // 查看详情逻辑
  console.log('查看详情:', order)
  ElMessage.info('查看详情功能开发中')
}

const handleAbsence = (order: OrderItem) => {
  // 申请缺住逻辑
  console.log('申请缺住:', order)
  ElMessage.info('申请缺住功能开发中')
}

const handleChangeBed = (order: OrderItem) => {
  // 换床申请逻辑
  console.log('换床申请:', order)
  ElMessage.info('换床申请功能开发中')
}

const handleCheckout = (order: OrderItem) => {
  // 申请退住逻辑
  ElMessageBox.confirm(
    '确定要申请退住吗？',
    '申请退住',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    console.log('申请退住:', order)
    ElMessage.success('退住申请已提交')
  }).catch(() => {
    // 取消操作
  })
}
</script>

<style scoped lang="scss">
.order-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #303133;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #606266;
  }
}

.status-filter {
  margin-bottom: 20px;
  
  :deep(.el-radio-group) {
    width: 100%;
  }
  
  :deep(.el-radio-button) {
    flex: 1;
    
    .el-radio-button__inner {
      width: 100%;
    }
  }
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.applicant-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  
  .name-id {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
    
    .id-card {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .application-date {
    font-size: 14px;
    color: #909399;
  }
}

.stay-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  
  .date-info {
    display: flex;
    gap: 24px;
    
    .date-item {
      display: flex;
      flex-direction: column;
      
      .label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .value {
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }
    }
  }
  
  .purpose,
  .bed-assignment {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .label {
      font-size: 14px;
      color: #909399;
      white-space: nowrap;
    }
    
    .value {
      font-size: 14px;
      color: #303133;
    }
  }
}

.application-progress {
  margin: 20px 0;
  
  .progress-steps {
    display: flex;
    justify-content: space-between;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 15px;
      left: 10%;
      right: 10%;
      height: 2px;
      background-color: #e4e7ed;
      z-index: 1;
    }
    
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
      
      &.active {
        .step-icon {
          background-color: #409eff;
          color: #fff;
        }
        
        .step-text {
          color: #409eff;
        }
      }
      
      .step-icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #e4e7ed;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .step-text {
        font-size: 12px;
        color: #909399;
        white-space: nowrap;
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.tips {
  margin-top: 16px;
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  
  p {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
  }
}

.rejection-reason {
  margin-top: 16px;
  padding: 12px;
  background-color: #fef0f0;
  border-radius: 4px;
  border-left: 4px solid #f56c6c;
  
  .reason-title {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #f56c6c;
  }
  
  .reason-content {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

@media (max-width: 768px) {
  .order-management {
    padding: 12px;
  }
  
  .applicant-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .date-info {
    flex-direction: column;
    gap: 12px !important;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>