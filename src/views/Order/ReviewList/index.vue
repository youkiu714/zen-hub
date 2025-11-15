<!-- src/views/ReviewList.vue -->
<template>
  <div class="review-list-page">
    <!-- 标题区 -->
    <div class="page-header">
      <h1>挂单审核</h1>
    </div>

    <!-- Tabs 区 -->
    <el-tabs v-model="activeTab" class="review-tabs">
      <el-tab-pane label="待审核" name="10" />
      <el-tab-pane label="待法师审核" name="20" />
      <el-tab-pane label="已通过" name="30" />
      <el-tab-pane label="已驳回" name="40" />
    </el-tabs>

    <!-- 表格区 -->
    <div class="table-container">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-title">审核列表</div>
        <div class="filter-controls">
          <el-input v-model="searchKeyword" placeholder="可以输入申请人姓名或身份证号" clearable prefix-icon="Search"
            style="width: 300px" @keyup.enter="fetchData" @input="handleSearchChange" />
          <el-select v-model="selectedType" placeholder="全部申请类型" style="width: 150px" @change="fetchData" clearable>
            <el-option label="全部申请类型" :value="undefined" />
            <el-option v-for="(label, value) in ApplicationTypeMap" :key="value" :label="label" :value="Number(value)" />
          </el-select>
          <el-select v-model="selectedDateRange" placeholder="全部日期" style="width: 150px" @change="fetchData" clearable>
            <el-option label="全部日期" value="" />
            <el-option label="今天" value="today" />
            <el-option label="本周" value="thisWeek" />
            <el-option label="本月" value="thisMonth" />
            <el-option label="本季度" value="thisQuarter" />
          </el-select>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="reviewList" :stripe="true" style="width: 100%" :row-class-name="tableRowClassName"
        @row-dblclick="handleView" :fit="true">
        <el-table-column prop="applicantName" label="申请人" :min-width="180">
          <template #default="scope">
            <div class="applicant-cell">
              <el-avatar size="small" :src="getAvatarUrl(scope.row)" />
              <span>{{ scope.row.applicantName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="idCardMasked" label="身份证号" :min-width="180" />
        <el-table-column prop="applicationType" label="申请类型" :min-width="120">
          <template #default="scope">
            <el-tag :type="getApplicationTypeTagType(scope.row.applicationType)" size="small">
              {{ ApplicationTypeMap[scope.row.applicationType] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请起止日期" :min-width="200">
          <template #default="scope">
            {{ scope.row.checkinDate }} 至 {{ scope.row.checkoutDate }}
          </template>
        </el-table-column>
        <el-table-column prop="days" label="挂单天数" :min-width="100" />
        <el-table-column prop="reviewStatus" label="状态" :min-width="120">
          <template #default="scope">
            <el-tag :type="getReviewStatusTagType(scope.row.reviewStatus)" size="small">
              {{ ReviewStatusMap[scope.row.reviewStatus] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 操作列设置为固定宽度 -->
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="scope">
            <el-button type="text" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="scope.row.reviewStatus === 10" type="text" @click="handleReview(scope.row)">审核</el-button>
            <el-button v-else-if="scope.row.reviewStatus === 40" type="text"
              @click="handleReReview(scope.row)">重新审核</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="currentPage" :page-size="5" :total="total"
          layout="prev, pager, next, jumper, total" @current-change="handlePageChange" />
      </div>
    </div>

    <!-- 弹窗 -->
    <ReviewDetailDialog v-model="dialogVisible" :current-item="currentItem" :is-view-only="isViewOnly"
      @close="dialogVisible = false" @review-submitted="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import ReviewDetailDialog from './ReviewDetailDialog.vue';
import { getReviews } from '@/api/review';
import type { ReviewListItemVO, ReviewListResponse } from '@/types/review';

// =============== 常量 ===============
const ApplicationTypeMap = {
  1: '短住',
  2: '直通车',
  3: '僧亲',
  4: '团队挂单',
  5: '特殊客人',
} as const;

const ReviewStatusMap = {
  10: '待审核',
  20: '待法师审核',
  30: '已通过',
  40: '已驳回',
} as const;

// =============== 响应式状态 ===============
const reviewList = ref<ReviewListItemVO[]>([]);
const total = ref(0);
const currentPage = ref(1);
const searchKeyword = ref('');
const selectedType = ref<number | undefined>(undefined);
const selectedDateRange = ref('');
const activeTab = ref('10');
const dialogVisible = ref(false);
const currentItem = ref<ReviewListItemVO | null>(null);
const isViewOnly = ref(true);

// =============== 计算 ===============
const statusFilter = computed(() => Number(activeTab.value));

// ====== 监听 Tab 切换 ======
watch(activeTab, () => {
  currentPage.value = 1; // 切换 Tab 时重置页码
  fetchData(); // 重新加载数据
});

// =============== 方法 ===============
const handleSearchChange = () => {
  // 当搜索输入框内容变化时，如果内容为空则自动刷新数据
  if (!searchKeyword.value.trim()) {
    fetchData();
  }
};

const fetchData = async () => {
  try {
    const params = {
      keyword: searchKeyword.value || undefined,
      pageNo: currentPage.value,
      pageSize: 10,
      status: statusFilter.value,
      type: selectedType.value,
      ...getDateRangeParams(selectedDateRange.value),
    };
    const res = await getReviews(params);
    reviewList.value = res
    console.log(res);

    // if (res.code === 80) {
    //   reviewList.value = res.data || [];
    //   total.value = res.data?.length || 0; // 实际应为后端 total
    // } else {
    //   ElMessage.error(res.message || '加载失败');
    // }
  } catch (err) {
    ElMessage.error('网络错误');
  }
};

const getDateRangeParams = (range: string) => {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  let startFrom: string | undefined, startTo: string | undefined;
  switch (range) {
    case 'today':
      startFrom = startTo = fmt(now);
      break;
    case 'thisWeek':
      const sun = new Date(now);
      sun.setDate(now.getDate() - now.getDay());
      startFrom = fmt(sun);
      startTo = fmt(now);
      break;
    case 'thisMonth':
      startFrom = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
      startTo = fmt(now);
      break;
    case 'thisQuarter':
      const q = Math.floor(now.getMonth() / 3);
      startFrom = fmt(new Date(now.getFullYear(), q * 3, 1));
      startTo = fmt(now);
      break;
  }
  return { startFrom, startTo };
};

const getAvatarUrl = (row: ReviewListItemVO) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(row.applicantName || '未知')}&background=random`;
};

const getApplicationTypeTagType = (type?: number) => {
  if (type === 1) return 'success';
  if (type === 2) return 'info';
  if (type === 3) return 'warning';
  if (type === 4) return 'primary';
  if (type === 5) return 'danger';
  return 'default';
};

const getReviewStatusTagType = (status?: number) => {
  if (status === 10) return 'warning';
  if (status === 20) return 'info';
  if (status === 30) return 'success';
  if (status === 40) return 'danger';
  return 'default';
};

const tableRowClassName = ({ row }: { row: ReviewListItemVO }) => {
  return row.reviewStatus === 40 ? 'danger-row' : '';
};

const handleView = (row: ReviewListItemVO) => {
  currentItem.value = row;
  isViewOnly.value = true;
  dialogVisible.value = true;
};

const handleReview = (row: ReviewListItemVO) => {
  currentItem.value = row;
  isViewOnly.value = false;
  dialogVisible.value = true;
};

const handleReReview = (row: ReviewListItemVO) => {
  currentItem.value = row;
  isViewOnly.value = false;
  dialogVisible.value = true;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.review-list-page {
  padding: 20px;
  background-color: #FFF8E7;
  min-height: calc(100vh - 150px);
  /* padding-bottom: 120px; */
  /* 为底部留空间 */
}

.page-header {
  text-align: center;
  padding: 30px 0;
  margin-left: 20px;
}

.page-header h1 {
  color: #8B4513;
  font-size: 28px;
  margin: 0;
}

.review-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 0 16px;
  margin: 0 20px 30px;
  /* 保持与表格区30px的距离 */
}

.table-container {
  background: white;
  margin: 0 20px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-title {
  font-size: 18px;
  font-weight: bold;
  color: #8B4513;
  margin-right: 20px;
  white-space: nowrap;
}

.filter-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  gap: 10px;
}

.applicant-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table .danger-row) {
  background-color: #fef0f0;
}

:deep(.el-table__body tr:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

/* 底部信息区 */
.footer {
  background-color: #3E2723;
  color: white;
  padding: 30px 20px 20px;
  margin-top: 40px;
  position: relative;
}

.footer .container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section h4 {
  color: #FFD700;
  margin-bottom: 10px;
}

.footer-section p {
  margin: 5px 0;
  font-size: 14px;
}

.footer-copyright {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #ccc;
}

/* ====== 精确修复 Tabs 样式 (终极版) ====== */
:deep(.el-tabs__header) {
  background-color: #fff;
  /* 原型图是纯白 */
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0 16px;
  margin: 0;
}

/* 移除 Element Plus 默认的下划线（关键步骤） */
:deep(.el-tabs__nav-wrap::after) {
  display: none;
  /* 彻底隐藏默认下划线 */
}

/* 为每个 Tab 项添加自己的下划线，只有选中时才显示 */
:deep(.el-tabs__item) {
  color: #333;
  /* 未选中文字颜色 */
  font-size: 16px;
  font-weight: 500;
  padding: 12px 20px;
  border: none;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  position: relative;
  /* 为下划线定位 */
  margin-right: 0;
  flex: 1;
  /* 平摊宽度 */
  text-align: center;
  height: 58px;
}

/* 确保导航容器是 flex 布局 */
:deep(.el-tabs__nav) {
  display: flex;
  width: 100%;
  border: none;
}

/* 确保导航项容器也是 flex 布局 */
:deep(.el-tabs__nav-scroll) {
  display: flex;
}

/* 选中项的样式 */
:deep(.el-tabs__item.is-active) {
  color: #8B4513;
  /* 选中文字颜色 */
  background-color: #fff;

  /* 保持白色背景 */
  /* 使用伪元素自定义下划线 */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    /* 贴近底部 */
    width: 100%;
    height: 3px;
    /* 加粗到3px */
    background-color: #8B4513;
    /* 深棕色 */
    border-radius: 3px 3px 0 0;
    /* 圆角 */
  }
}

/* 鼠标悬停样式 */
:deep(.el-tabs__item:hover) {
  color: #8B4513;
}

:deep(.el-tabs__active-bar) {
  color: rgb(139 90 43 / var(--tw-border-opacity, 1));
}

</style>