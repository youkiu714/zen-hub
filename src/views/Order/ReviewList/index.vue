<!-- src/views/ReviewList.vue -->
<template>
  <div class="review-list-container">
    <!-- 标题区 -->
    <PageHeader title="挂单审核" />

    <ReviewStatusFilter v-model="filterStatus" @update:modelValue="statusChange" />

    <!-- 表格区 -->
    <div class="table-container">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-title">审核列表</div>
        <div class="filter-controls">
          <el-input v-model="searchKeyword" placeholder="可以输入申请人姓名或身份证号" clearable prefix-icon="Search"
            style="width: 300px" @keyup.enter="fetchData" @input="handleSearchChange" />
          <el-select v-model="selectedType" placeholder="全部申请类型" style="width: 150px" @change="fetchData" clearable>
            <el-option v-for="(item, index) in applicationTypeOptions" :key="item.value" :label="item.label"
              :value="Number(item.value)" />
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
        @row-dblclick="handleView" :fit="true" class="review-table" :loading="loading">
        <el-table-column label="挂单人" min-width="150" >
          <template #default="{ row }">
            <div class="applicant-info">
              <el-avatar :size="40" class="applicant-avatar">
                <el-icon>
                  <User />
                </el-icon>
              </el-avatar>
              <div class="applicant-details">
                <div class="applicant-name">{{ row.applicantName }}</div>
                <div class="applicant-id">{{ row.idCardMasked }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别/年龄" min-width="120">
          <template #default="{ row }">
            <div>{{ row.gender === 1 ? '男' : '女' }} / {{ row.age }}岁</div>
          </template>
        </el-table-column>
        <el-table-column prop="applicationType" label="挂单类型" min-width="90">
          <template #default="scope">
            <span class="dot" :class="getApplicationTypeClass(scope.row.applicationType)"></span>
            {{
              applicationTypeOptions.find((item) => item.value === scope.row.applicationType)?.label ??
              '其他'
            }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="applicationType" label="申请类型" :min-width="100">
          <template #default="scope">
            <el-tag :type="getApplicationTypeTagType(scope.row.applicationType)" size="small">
              {{ ApplicationTypeMap[scope.row.applicationType] || '-' }}
            </el-tag>
          </template>
        </el-table-column> -->
        <el-table-column label="申请起止日期" :min-width="200">
          <template #default="scope">
            {{ scope.row.checkinDate }} 至 {{ scope.row.checkoutDate }}
          </template>
        </el-table-column>
        <el-table-column prop="days" label="挂单天数" :min-width="100" />
        <el-table-column prop="reviewStatus" label="状态" :min-width="100">
          <template #default="scope">
            <el-tag :type="getReviewStatusTagType(scope.row.reviewStatus)" size="small">
              {{ ReviewStatusMap[scope.row.reviewStatus] || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 操作列设置为固定宽度 -->
        <el-table-column label="操作" fixed="right" align="center" :min-width="160">
          <template #default="scope">
            <el-button link @click="handleView(scope.row)">查看</el-button>
            <el-button link @click="handleWorkflow(scope.row)">流程</el-button>
            <el-button  v-if="canReview(scope.row.reviewStatus)" link @click="handleReview(scope.row)">审核</el-button>
            <el-button v-else-if="scope.row.reviewStatus === 40" link
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

    <!-- 查看详情 -->
    <ApplicationDetailDialog v-model="detailVisible" :application-id="currentAppId" @close="onDetailClosed" />

    <!-- 审核流程 -->
    <ReviewPage v-model="reviewVisible" :application-id="currentReviewId" @close="onReviewClosed" />

    <!-- 审核 -->
    <ReviewModal v-model="showReview" :application-id="currentAppId" :review-list-item="currentItem" :status="filterStatus" @submit-success="handleReviewSuccess" />

  </div>


</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, storeToRefs } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import ReviewModal from './components/ReviewModal.vue';
import { getReviews } from '@/api/review';
import type { ReviewListItemVO, ReviewListResponse } from '@/types/review';
import PageHeader from '@/components/PageHeader.vue'
import ReviewStatusFilter from './components/ReviewStatusFilter.vue'
import { ReviewStatus } from '@/types/review'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import ReviewPage from '@/components/ReviewPage.vue'

import {
  applicationTypeOptions,
} from '@/utils/constants'

import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()

// =============== 常量 ===============
const ReviewStatusMap = {
  10: '待审核',
  20: '待法师审核',
  30: '已通过',
  40: '已驳回',
} as const;

// 获取申请类型对应的样式类
const getApplicationTypeClass = (applicationType: number) => {
  const typeClassMap: Record<number, string> = {
    1: 'short-stay', // 短住 - #5F3DC4
    2: 'long-stay', // 常住 - #08979C
    3: 'direct-bus', // 直通车 - #D4B106
    4: 'special-guest' // 特殊客人 - #C41D7F
  }
  return typeClassMap[applicationType] || 'default'
}

const filterStatus = ref(ReviewStatus.WAITING_REVIEW)

// =============== 响应式状态 ===============
const loading = ref(false);
const reviewList = ref<ReviewListItemVO[]>([]);
const total = ref(0);
const currentPage = ref(1);
const searchKeyword = ref('');
const selectedType = ref<number | undefined>(undefined);
const selectedDateRange = ref('');

const currentItem = ref<ReviewListItemVO | null>(null);

const detailVisible = ref(false);
const currentAppId = ref(0)

const reviewVisible = ref(false);
const currentReviewId = ref(0)

const isViewOnly = ref(true);


// =============== 审核窗口 ===============
const showReview = ref(false)


// ====== 筛选状态 切换 ======
const statusChange = () => {
  currentPage.value = 1; // 切换 Tab 时重置页码
  fetchData(); // 重新加载数据
};

// =============== 方法 ===============
const handleSearchChange = () => {
  // 当搜索输入框内容变化时，如果内容为空则自动刷新数据
  if (!searchKeyword.value.trim()) {
    fetchData();
  }
};

// =============== 子窗口返回的方法 ===============
const handleReviewSuccess = () => {
  fetchData()
};

const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}

const onReviewClosed = () => {
  console.log('审核流程窗口已关闭')
}

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      keyword: searchKeyword.value || undefined,
      pageNo: currentPage.value,
      pageSize: 5,
      status: filterStatus.value,
      type: selectedType.value,
      ...getDateRangeParams(selectedDateRange.value),
    };
    const res = await getReviews(params);
    reviewList.value = res.records || []
    console.log(res);

    // if (res.code === 80) {
    //   reviewList.value = res.data || [];
    //   total.value = res.data?.length || 0; // 实际应为后端 total
    // } else {
    //   ElMessage.error(res.message || '加载失败');
    // }
  } catch (err) {
    ElMessage.error('网络错误');
  } finally {
    loading.value = false;
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

const canReview = (status?: number) => {
  // return status === 10  || status === 20 // 待审核或待法师审核
  return (status === 10 && ( userStore.roles == 'MASTER' || userStore.roles == 'VOLUNTEER' ))
      || (status === 20 &&  userStore.roles == 'MASTER' )
}

const getApplicationTypeTagType = (type?: number) => {
  if (type === 1) return 'success';
  if (type === 2) return 'info';
  if (type === 3) return 'warning';
  if (type === 4) return 'info';
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
  currentAppId.value = row.id;
  isViewOnly.value = true;
  detailVisible.value = true;
};

const handleWorkflow = (row: ReviewListItemVO) => {
  currentItem.value = row;
  console.log('审核流程:', row.id);
  currentReviewId.value = row.id;
  reviewVisible.value = true;
};

const handleReview = (row: ReviewListItemVO) => {
  currentItem.value = row;
  currentAppId.value = row.id
  isViewOnly.value = false;
  showReview.value = true
};

const handleReReview = (row: ReviewListItemVO) => {
  currentItem.value = row;
  currentAppId.value = row.id
  isViewOnly.value = false;
  showReview.value = true
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

.table-container {
  background-color: white;
  padding: 12px 10px;

  .header-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      font-size: 18px;
      color: #8b5e3c;
      font-weight: normal;
      margin: 0;
    }

    .search-box {
      display: flex;
      gap: 10px;
    }
  }
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

/* 隐藏 Webkit 浏览器的滚动条 */
.table-container::-webkit-scrollbar {
  display: none;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .applicant-avatar {
    flex-shrink: 0;
  }

  .applicant-details {
    .applicant-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .applicant-id {
      font-size: 12px;
      color: #999;
    }
  }
}


.review-table {
  max-height: calc(100vh - 380px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}

/* 隐藏表格的 Webkit 滚动条 */
.review-table::-webkit-scrollbar {
  display: none;
}


:deep(.el-table__header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.el-table__fixed-header-wrapper) {
  z-index: 11;
}

:deep(.el-table__fixed-right) {
  z-index: 12;
}

:deep(.el-table__fixed-left) {
  z-index: 12;
}

/* 隐藏表格内部各种滚动条 */
:deep(.el-table__body-wrapper) {
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  display: none;
}

/* 隐藏固定列的滚动条 */
:deep(.el-table__fixed) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.el-table__fixed::-webkit-scrollbar) {
  display: none;
}

/* 隐藏固定列内部的滚动条 */
:deep(.el-table__fixed .el-table__body-wrapper) {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.el-table__fixed .el-table__body-wrapper::-webkit-scrollbar) {
  display: none;
}


.review-list-container {
  padding: 20px;
  background-color: #fdf6e3;
  /* min-height: calc(100vh - 150px); */
  /* padding-bottom: 120px; */
  /* 为底部留空间 */
}



.review-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 0 16px;
  margin: 0 20px 30px;
  /* 保持与表格区30px的距离 */
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
</style>