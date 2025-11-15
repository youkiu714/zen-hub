<!-- views/ApplicationManagement.vue -->
<template>
  <div class="application-management">
    <div class="page-header">
      <h1>我的挂单</h1>
      <p>查看和管理您的挂单申请状态，处理入住、续住、换床和退住等操作</p>
      <el-button
        type="primary"
        size="large"
        @click="handleNewApplication"
        class="new-application-btn"
      >
        <el-icon><Plus /></el-icon> 新挂单申请
      </el-button>
    </div>

    <!-- 状态筛选器 -->
    <ApplicationStatusFilter
      v-model="filterStatus"
      @update:modelValue="loadApplications"
    />

    <!-- 应用列表 -->
    <div v-if="loading" class="loading-container">
      <!-- <el-spin size="large" /> -->
       <div v-loading="loading" element-loading-text="加载中。。。" class="pending-order-container">sssss</div>
    </div>

    <div v-else-if="applications.length === 0" class="empty-container">
      <el-empty description="暂无挂单记录" />
    </div>

    <div v-else class="applications-list">
      <ApplicationCard
        v-for="app in applications"
        :key="app.id"
        :application="app"
        @view-detail="handleViewDetail"
        @cancel-application="handleCancelApplication"
        @modify-info="handleModifyInfo"
        @apply-extend="handleApplyExtend"
        @apply-change-bed="handleApplyChangeBed"
        @apply-checkout="handleApplyCheckout"
        @rate="handleRate"
        @reapply="handleReapply"
      />
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper, total"
        @current-change="loadApplications"
      />
    </div>

    <!-- 查看详情 -->
    <ApplicationDetailDialog
      v-model="detailVisible"
      :application-id="currentAppId"
      @close="onDetailClosed"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ApplicationStatus } from '@/types/application';
import { getApplications } from '@/api/application';
import ApplicationStatusFilter from './components/ApplicationStatusFilter.vue';
import ApplicationCard from './components/ApplicationCard.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import ApplicationDetailDialog from './components/ApplicationDetailDialog.vue'
import type { OrderItem } from '@/types/order';

const router = useRouter();

// 状态
const loading = ref(false);
const applications = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const filterStatus = ref(ApplicationStatus.ALL);


const detailVisible = ref(false)
const currentAppId = ref(0)

// 加载数据
const loadApplications = async () => {
  loading.value = true;
  try {
    const response = await getApplications({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      status: filterStatus.value !== ApplicationStatus.ALL ? filterStatus.value : undefined,
    });
    console.log(response);
    console.log(response.records);
    
    if (response.records) {
      applications.value = response.records;
      total.value = response.total || 0;
    }
  } catch (error) {
    ElMessage.error('加载挂单列表失败');
    console.error('加载挂单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 页面初始化
onMounted(() => {
  loadApplications();
});

// 事件处理
const handleNewApplication = () => {
  router.push('/contact-application/pending-application');
};

const handleViewDetail = (id: number) => {
  // router.push(`/application/${id}/detail`);
  console.log(id);
  
  currentAppId.value = id
  detailVisible.value = true
};

const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}

const handleCancelApplication = (id: number) => {
  ElMessageBox.confirm('确定要取消此申请吗？', '取消申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    // TODO: 实现取消申请的API调用
    ElMessage.success('申请已取消');
    loadApplications(); // 重新加载数据
  });
};

const handleModifyInfo = (id: number) => {
  router.push(`/application/${id}/edit`);
};

const handleApplyExtend = (id: number) => {
  router.push(`/application/${id}/extend`);
};

const handleApplyChangeBed = (id: number) => {
  router.push(`/application/${id}/change-bed`);
};

const handleApplyCheckout = (id: number) => {
  router.push(`/application/${id}/checkout`);
};

const handleRate = (id: number) => {
  router.push(`/application/${id}/rate`);
};

const handleReapply = (id: number) => {
  router.push(`/application/${id}/reapply`);
};
</script>

<style scoped>
.application-management {
  padding: 20px;
  background-color: #fdf6e3;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.page-header h1 {
  font-size: 24px;
  color: #8B4513;
  margin: 0;
}

.page-header p {
  color: #666;
  font-size: 14px;
  margin: 8px 0 0 0;
}

.new-application-btn {
  background-color: #8B4513;
  border-color: #8B4513;
  color: white;
}

.new-application-btn:hover {
  background-color: #6b370f;
  border-color: #6b370f;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.applications-list {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>