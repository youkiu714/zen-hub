<template>
  <div class="pending-records">
    <!-- 页面标题 -->
    <PageHeader title="挂单记录查询" />

    <!-- 搜索和筛选区域 -->
    <div class="table-container">
      <div class="filter-bar">

        <el-input v-model="queryForm.keyword" placeholder="请输入姓名/身份证/手机号" clearable style="width: 240px"
          @input="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-select v-model="queryForm.gender" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
          <el-option label="全部" :value="undefined" />
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>

        <el-select v-model="queryForm.visitRange" placeholder="全部" clearable style="width: 150px"
          @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="1-5次" value="1-5" />
          <el-option label="6-10次" value="6-10" />
          <el-option label="10次以上" value="10+" />
        </el-select>

        <el-button type="primary" @click="handleFilter">
          <el-icon>
            <Filter />
          </el-icon>
          筛选
        </el-button>
        <el-button @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出
        </el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" @sort-change="handleSortChange">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <span class="name-text">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号码" width="180">
          <template #default="{ row }">
            {{ maskIdCard(row.idCard) }}
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="电话号码" width="150">
          <template #default="{ row }">
            {{ maskPhone(row.mobile) }}
          </template>
        </el-table-column>
        <el-table-column prop="birthDate" label="出生日期" width="120" />
        <el-table-column prop="ethnic" label="民族" width="100" />
        <el-table-column prop="totalCount" label="挂单总次数" width="120" sortable="custom" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              查看
            </el-button>
            <el-button type="success" link @click="handleViewHistory(row)">
              历史记录
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

    <!-- 历史记录弹窗 -->
    <el-dialog v-model="historyVisible" title="挂单历史记录" width="800px" :before-close="handleCloseHistory">
      <div v-if="currentRow" class="history-content">
        <p>{{ currentRow.name }} 的历史记录功能正在开发中...</p>
        <p>挂单总次数: {{ currentRow.totalCount }}</p>
      </div>
      <template #footer>
        <el-button @click="historyVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Filter, Download } from '@element-plus/icons-vue'
import {
  getPendingRecords,
  exportPendingRecords,
  type PendingRecordsQuery,
  type GuestRecordVO
} from '@/api/pending-records'
import PageHeader from '@/components/PageHeader.vue'
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'

// 查询表单数据
const queryForm = reactive({
  keyword: '',
  gender: undefined as number | undefined,
  visitRange: ''
})

// 表格数据
const tableData = ref<GuestRecordVO[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗状态
const historyVisible = ref(false)
const currentRow = ref<GuestRecordVO | null>(null)

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

    if (queryForm.gender !== undefined) {
      params.gender = queryForm.gender
    }

    if (queryForm.visitRange) {
      params.visitRange = queryForm.visitRange
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

// 导出处理
const handleExport = async () => {
  try {
    const params: PendingRecordsQuery = {}

    if (queryForm.keyword) {
      params.keyword = queryForm.keyword
    }

    if (queryForm.gender !== undefined) {
      params.gender = queryForm.gender
    }

    if (queryForm.visitRange) {
      params.visitRange = queryForm.visitRange
    }

    const response = await exportPendingRecords(params)

    // 创建下载链接
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `挂单记录_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 查看详情
const handleView = (row: GuestRecordVO) => {
  currentAppId.value = row.personId;
  detailVisible.value = true;
};

const onDetailClosed = () => {
  console.log('详情窗口已关闭')
}

// 查看历史记录
const handleViewHistory = async (row: GuestRecordVO) => {
  try {
    currentRow.value = row
    ElMessage.info('历史记录功能开发中')
    // TODO: 实现历史记录查询接口
    // currentHistory.value = await getPendingHistory(row.personId)
    // historyVisible.value = true
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败')
  }
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

  .detail-content {
    :deep(.el-descriptions) {
      .el-descriptions__body {
        .el-descriptions__table {
          .el-descriptions__cell {
            &.is-bordered-label {
              background-color: #f8f9fa;
            }
          }
        }
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
</style>