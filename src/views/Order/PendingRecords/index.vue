<template>
  <div class="pending-records">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">挂单记录查询</h2>
      <p class="page-description">展示所有挂单人的基本信息，包括个人资料和挂单记录统计</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :model="queryForm" inline>
        <el-form-item label="姓名搜索">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入挂单人姓名"
            clearable
            style="width: 200px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="性别筛选">
          <el-select
            v-model="queryForm.gender"
            placeholder="全部"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
          </el-select>
        </el-form-item>
        <el-form-item label="挂单次数筛选">
          <el-select
            v-model="queryForm.pendingCountRange"
            placeholder="全部"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="1-5次" value="1-5" />
            <el-option label="6-10次" value="6-10" />
            <el-option label="10次以上" value="10+" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Filter /></el-icon>
            筛选
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <span class="name-text">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="idCard" label="身份证号码" width="180">
          <template #default="{ row }">
            {{ maskIdCard(row.idCard) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话号码" width="150">
          <template #default="{ row }">
            {{ maskPhone(row.phone) }}
          </template>
        </el-table-column>
        <el-table-column prop="birthDate" label="出生日期" width="120" />
        <el-table-column prop="ethnic" label="民族" width="100" />
        <el-table-column prop="pendingCount" label="挂单总次数" width="120" sortable="custom" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewDetail(row)"
            >
              查看
            </el-button>
            <el-button
              type="success"
              link
              @click="handleViewHistory(row)"
            >
              历史记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="挂单人详情"
      width="800px"
      :before-close="handleCloseDetail"
    >
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentDetail.gender }}</el-descriptions-item>
          <el-descriptions-item label="身份证号码">{{ maskIdCard(currentDetail.idCard) }}</el-descriptions-item>
          <el-descriptions-item label="电话号码">{{ maskPhone(currentDetail.phone) }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ currentDetail.birthDate }}</el-descriptions-item>
          <el-descriptions-item label="民族">{{ currentDetail.ethnic }}</el-descriptions-item>
          <el-descriptions-item label="婚姻状况">{{ currentDetail.marital }}</el-descriptions-item>
          <el-descriptions-item label="最高学历">{{ currentDetail.education }}</el-descriptions-item>
          <el-descriptions-item label="职业">{{ currentDetail.occupation }}</el-descriptions-item>
          <el-descriptions-item label="挂单总次数">{{ currentDetail.pendingCount }}</el-descriptions-item>
          <el-descriptions-item label="常住地址" :span="2">{{ currentDetail.address }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人" :span="2">{{ currentDetail.emergencyContact }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 历史记录弹窗 -->
    <el-dialog
      v-model="historyVisible"
      title="挂单历史记录"
      width="1200px"
      :before-close="handleCloseHistory"
    >
      <div v-if="currentHistory">
        <!-- 统计信息 -->
        <div class="history-stats">
          <h4>{{ currentRow?.name }}的挂单记录</h4>
          <el-row :gutter="20" class="stats-cards">
            <el-col :span="6">
              <el-statistic title="总挂单次数" :value="currentHistory.stats.totalCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="总挂单天数" :value="currentHistory.stats.totalDays" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="本年度次数" :value="currentHistory.stats.thisYearCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="违规记录" value="无" />
            </el-col>
          </el-row>
        </div>

        <!-- 详细记录表格 -->
        <div class="history-table">
          <h4>详细记录</h4>
          <el-table :data="currentHistory.records" stripe>
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="pendingDate" label="挂单日期" width="120" />
            <el-table-column prop="leaveDate" label="离寺日期" width="120" />
            <el-table-column prop="duration" label="挂单时长" width="100" />
            <el-table-column prop="roomNumber" label="房间号码" width="100" />
            <el-table-column prop="roomType" label="房间类型" width="120" />
            <el-table-column prop="bedNumber" label="床位号码" width="100" />
            <el-table-column prop="performance" label="挂单表现" width="120">
              <template #default="{ row }">
                <el-tag :type="getPerformanceTagType(row.performance)">
                  {{ row.performance }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
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
// 保留API接口以备将来使用
// import {
//   getPendingRecords,
//   getPendingRecordDetail,
//   getPendingHistory,
//   exportPendingRecords
// } from '@/api/pending-records'
import type {
  PendingRecordItem,
  PendingRecordDetail,
  PendingHistoryResponse
} from '@/types/pending-records'

// 查询表单数据
const queryForm = reactive({
  name: '',
  gender: '',
  pendingCountRange: ''
})

// 表格数据
const tableData = ref<PendingRecordItem[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 弹窗状态
const detailVisible = ref(false)
const historyVisible = ref(false)
const currentDetail = ref<PendingRecordDetail | null>(null)
const currentHistory = ref<PendingHistoryResponse | null>(null)
const currentRow = ref<PendingRecordItem | null>(null)

// 模拟数据
const mockData: PendingRecordItem[] = [
  {
    id: 1,
    name: '张三',
    gender: '男',
    idCard: '110101199001151234',
    phone: '13812348000',
    birthDate: '1990-01-15',
    ethnic: '汉族',
    pendingCount: 12
  },
  {
    id: 2,
    name: '李四',
    gender: '女',
    idCard: '310101198506205678',
    phone: '13912349000',
    birthDate: '1985-06-20',
    ethnic: '汉族',
    pendingCount: 8
  },
  {
    id: 3,
    name: '王五',
    gender: '男',
    idCard: '440101199503109012',
    phone: '13712347000',
    birthDate: '1995-03-10',
    ethnic: '回族',
    pendingCount: 5
  },
  {
    id: 4,
    name: '赵六',
    gender: '男',
    idCard: '510101198809253456',
    phone: '13612346000',
    birthDate: '1988-09-25',
    ethnic: '汉族',
    pendingCount: 23
  },
  {
    id: 5,
    name: '孙七',
    gender: '女',
    idCard: '330101199207087890',
    phone: '13512345000',
    birthDate: '1992-07-08',
    ethnic: '苗族',
    pendingCount: 7
  },
  {
    id: 6,
    name: '周八',
    gender: '男',
    idCard: '420101198812031234',
    phone: '13412344000',
    birthDate: '1988-12-03',
    ethnic: '汉族',
    pendingCount: 15
  },
  {
    id: 7,
    name: '吴九',
    gender: '女',
    idCard: '350101199105062345',
    phone: '13312343000',
    birthDate: '1991-05-06',
    ethnic: '壮族',
    pendingCount: 3
  },
  {
    id: 8,
    name: '郑十',
    gender: '男',
    idCard: '410101199302103456',
    phone: '13212342000',
    birthDate: '1993-02-10',
    ethnic: '汉族',
    pendingCount: 18
  }
]

// 获取挂单记录列表（使用模拟数据）
const fetchPendingRecords = async () => {
  try {
    loading.value = true
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    let filteredData = [...mockData]

    // 姓名筛选
    if (queryForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(queryForm.name.toLowerCase())
      )
    }

    // 性别筛选
    if (queryForm.gender) {
      const genderMap: { [key: string]: string } = {
        'male': '男',
        'female': '女'
      }
      filteredData = filteredData.filter(item =>
        item.gender === genderMap[queryForm.gender]
      )
    }

    // 挂单次数筛选
    if (queryForm.pendingCountRange) {
      const range = queryForm.pendingCountRange
      filteredData = filteredData.filter(item => {
        const count = item.pendingCount
        if (range === '1-5') return count >= 1 && count <= 5
        if (range === '6-10') return count >= 6 && count <= 10
        if (range === '10+') return count >= 10
        return true
      })
    }

    // 分页
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    tableData.value = filteredData.slice(startIndex, endIndex)
    total.value = filteredData.length
  } catch (error) {
    console.error('获取挂单记录失败:', error)
    ElMessage.error('获取挂单记录失败')
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

// 导出处理（模拟）
const handleExport = async () => {
  try {
    // 模拟导出延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟Excel导出（实际项目中这里会调用真实的API）
    const mockExportData = mockData.map(item => ({
      姓名: item.name,
      性别: item.gender,
      身份证号码: maskIdCard(item.idCard),
      电话号码: maskPhone(item.phone),
      出生日期: item.birthDate,
      民族: item.ethnic,
      挂单总次数: item.pendingCount
    }))

    // 创建CSV格式的模拟导出数据
    const csvContent = [
      Object.keys(mockExportData[0]).join(','),
      ...mockExportData.map(item => Object.values(item).join(','))
    ].join('\n')

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `挂单记录_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 查看详情（使用模拟数据）
const handleViewDetail = async (row: PendingRecordItem) => {
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    // 模拟详情数据
    const mockDetail: PendingRecordDetail = {
      id: row.id,
      name: row.name,
      gender: row.gender,
      idCard: row.idCard,
      phone: row.phone,
      birthDate: row.birthDate,
      ethnic: row.ethnic,
      marital: row.gender === '男' ? '已婚' : '未婚',
      education: ['本科', '硕士', '专科', '高中'][Math.floor(Math.random() * 4)],
      occupation: ['教师', '工程师', '医生', '公务员', '企业职工'][Math.floor(Math.random() * 5)],
      pendingCount: row.pendingCount,
      address: `${['北京市', '上海市', '广州市', '深圳市'][Math.floor(Math.random() * 4)]}${['朝阳区', '海淀区', '浦东新区', '福田区'][Math.floor(Math.random() * 4)]}`,
      emergencyContact: `${['李四', '王五', '赵六'][Math.floor(Math.random() * 3)]}（${maskPhone(`139${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`)}）`
    }

    currentDetail.value = mockDetail
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 查看历史记录（使用模拟数据）
const handleViewHistory = async (row: PendingRecordItem) => {
  try {
    currentRow.value = row
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    // 模拟历史记录数据
    const mockHistoryData = {
      stats: {
        totalCount: row.pendingCount,
        totalDays: row.pendingCount * (3 + Math.floor(Math.random() * 7)),
        thisYearCount: Math.min(5, row.pendingCount),
        violationCount: '无'
      },
      records: Array.from({ length: Math.min(3, row.pendingCount) }, (_, index) => ({
        id: index + 1,
        pendingDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        leaveDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        duration: `${Math.floor(Math.random() * 10) + 1}天`,
        roomNumber: ['A01', 'A02', 'B01', 'B02', 'C01'][Math.floor(Math.random() * 5)],
        roomType: ['标准间', '多人间', '单人间'][Math.floor(Math.random() * 3)],
        bedNumber: `0${Math.floor(Math.random() * 9) + 1}`,
        performance: ['优秀', '良好', '一般'][Math.floor(Math.random() * 3)],
        status: '已完成'
      }))
    }

    currentHistory.value = mockHistoryData
    historyVisible.value = true
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

// 关闭弹窗
const handleCloseDetail = () => {
  detailVisible.value = false
  currentDetail.value = null
}

const handleCloseHistory = () => {
  historyVisible.value = false
  currentHistory.value = null
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

const getPerformanceTagType = (performance: string) => {
  switch (performance) {
    case '优秀':
      return 'primary'
    case '良好':
      return 'success'
    case '一般':
      return 'warning'
    default:
      return 'info'
  }
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case '已完成':
      return 'success'
    case '进行中':
      return 'primary'
    case '已取消':
      return 'danger'
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
.pending-records {
  padding: 20px;

  .page-header {
    text-align: center;
    margin-bottom: 30px;

    .page-title {
      font-size: 2rem;
      font-weight: 600;
      color: #8B5A2B;
      margin-bottom: 10px;
    }

    .page-description {
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }
  }

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

  .history-stats {
    margin-bottom: 30px;

    h4 {
      font-size: 1.2rem;
      color: #333;
      margin-bottom: 20px;
    }

    .stats-cards {
      :deep(.el-statistic) {
        text-align: center;

        .el-statistic__head {
          color: #666;
          font-size: 14px;
        }

        .el-statistic__content {
          .el-statistic__number {
            color: #8B5A2B;
            font-weight: 600;
          }
        }
      }
    }
  }

  .history-table {
    h4 {
      font-size: 1.2rem;
      color: #333;
      margin-bottom: 20px;
    }
  }
}
</style>