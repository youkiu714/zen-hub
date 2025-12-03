<template>
  <div class="pending-records">
    <!-- 页面标题 -->
    <PageHeader title="挂单记录查询" />

    <!-- 搜索和筛选区域 -->
    <div class="table-container">
      <div class="filter-bar">

        <el-input v-model="queryForm.keyword" placeholder="请输入姓名/手机号" clearable style="width: 200px"
          @input="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-select v-model="queryForm.departmentCode" placeholder="全部部组" clearable style="width: 120px"
          @change="handleSearch">
          <el-option label="全部部组" value="" />
          <el-option v-for="dept in departmentOptions" :key="dept.value" :label="dept.label" :value="dept.value" />
        </el-select>

        <el-date-picker v-model="queryForm.startDate" type="date" placeholder="开始日期" clearable style="width: 150px"
          @change="handleSearch" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />

        <el-date-picker v-model="queryForm.endDate" type="date" placeholder="结束日期" clearable style="width: 150px"
          @change="handleSearch" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />

        <el-button type="primary" @click="handleFilter">
          <el-icon>
            <Filter />
          </el-icon>
          筛选
        </el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" @sort-change="handleSortChange">
        <!-- <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <span class="name-text">{{ row.name }}</span>
          </template>
        </el-table-column> -->

        <el-table-column label="挂单人" min-width="150">
          <template #default="{ row }">
            <div class="applicant-info">
              <el-avatar :size="40" class="applicant-avatar">
                <el-icon>
                  <User />
                </el-icon>
              </el-avatar>
              <div class="applicant-details">
                <div class="applicant-name">{{ row.name }}</div>
                <div class="applicant-id">{{ row.idCardMasked }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="性别/年龄" min-width="100">
          <template #default="{ row }">
            <div>{{ row.gender === 1 ? '男' : '女' }} / {{ row.age }}岁</div>
          </template>
        </el-table-column>

        <el-table-column prop="departmentName" label="部组" width="120">
          <template #default="{ row }">
            {{ row.departmentName || getDepartmentName(row.departmentCode) }}
          </template>
        </el-table-column>
        <el-table-column prop="mobileMasked" label="手机号" width="120">
          <template #default="{ row }">
            {{ maskPhone(row.mobileMasked) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkinDate" label="入住日期" width="120" />
        <el-table-column prop="checkoutDate" label="退住日期" width="120" />
        <el-table-column prop="stayDays" label="天数" width="80" />
        <el-table-column prop="bedChangeCount" label="换床次数" width="100" />
        <el-table-column prop="extensionCount" label="续单次数" width="100" />
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 7" class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <ApplicationDetailDialog v-model="detailVisible" :application-id="currentAppId" @close="onDetailClosed" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Filter, Download } from '@element-plus/icons-vue'
import {
  getPendingRecords,
  exportPendingRecords,
  type PendingRecordsQuery,
  type LodgingRecordVO,
} from '@/api/pending-records'
import PageHeader from '@/components/PageHeader.vue'
import { departmentOptions } from '@/utils/constants'

// 查询表单数据
const queryForm = reactive({
  departmentCode: '',
  keyword: '',
  startDate: '',
  endDate: ''
})

// 表格数据
const tableData = ref<LodgingRecordVO[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗状态
const historyVisible = ref(false)
const currentRow = ref<LodgingRecordVO | null>(null)

const detailVisible = ref(false);
const currentAppId = ref(0)

// 获取挂单记录列表
const fetchPendingRecords = async () => {
  try {
    loading.value = true
    const params: PendingRecordsQuery = {
      pageNo: currentPage.value,
      pageSize: pageSize.value
    }

    if (queryForm.keyword) {
      params.keyword = queryForm.keyword
    }

    if (queryForm.departmentCode) {
      params.departmentCode = queryForm.departmentCode
    }

    if (queryForm.startDate) {
      params.startDate = queryForm.startDate
    }

    if (queryForm.endDate) {
      params.endDate = queryForm.endDate
    }

    const response = await getPendingRecords(params)
    console.log('挂单记录查询响应:', response)

    if (response && response.records) {
      tableData.value = response.records || []
      total.value = response.total || 0
    } else {
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取挂单记录失败:', error)
    ElMessage.error('获取挂单记录失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchPendingRecords()
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
  fetchPendingRecords()
}

// 查看详情
const handleView = (row: LodgingRecordVO) => {
  currentAppId.value = row.applicationId || row.personId || 0;
  detailVisible.value = true;
};

const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchPendingRecords()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchPendingRecords()
}

// 排序处理
const handleSortChange = ({ prop, order }: any) => {
  // 这里可以添加排序逻辑
  console.log('排序:', prop, order)
}


const handleCloseHistory = () => {
  historyVisible.value = false
  currentRow.value = null
}

// 工具函数
const maskIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.slice(0, 3) + '********' + idCard.slice(-4)
}

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

// 根据部组编码获取部组名称
const getDepartmentName = (departmentCode?: string) => {
  if (!departmentCode) return '-'
  const dept = departmentOptions.find(item => item.value === departmentCode)
  return dept ? dept.label : departmentCode
}

// 获取状态标签类型
const getStatusType = (status?: number): string => {
  switch (status) {
    case 10: // 申请中
      return 'warning'
    case 20: // 待入住
      return 'info'
    case 30: // 入住中
      return 'success'
    case 40: // 已退住
      return 'info'
    case 70: // 未通过
      return 'danger'
    case 90: // 已取消
      return 'info'
    default:
      return 'info'
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchPendingRecords()
})
</script>

<style scoped lang="scss">
.table-container {
  background-color: white;
  padding: 12px 10px;
  border-radius: 12px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pending-records {
  padding: 20px;

  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .name-text {
      color: #8B5A2B;
      font-weight: 500;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;

      .pagination-info {
        color: #666;
        font-size: 14px;
      }
    }
  }

  .history-content {
    text-align: center;
    padding: 40px 20px;
    color: #666;
    font-size: 16px;
  }
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
</style>