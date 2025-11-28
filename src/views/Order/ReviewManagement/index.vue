<template>
  <div class="evaluation-management">
    <!-- 页面标题 -->
    <PageHeader title="在寺表现评价" />

    <EvaluationStatusFilter v-model="filterStatus" @update:modelValue="statusChange" />

    <!-- 状态页签 -->
    <!-- <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待评价" name="pending">
          <template #label>
            <span class="tab-label">
              <el-badge :value="pendingCount" class="tab-badge" v-if="pendingCount > 0">
                待评价
              </el-badge>
              <span v-else>待评价</span>
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已评价" name="completed">
          <template #label>
            <span class="tab-label">
              <el-badge :value="completedCount" class="tab-badge" type="success" v-if="completedCount > 0">
                已评价
              </el-badge>
              <span v-else>已评价</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card> -->

    <!-- 评价列表 -->
    <div class="table-container">
      <!-- 搜索和筛选区域 -->
      <div class="filter-bar">
          <div class="search-box">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索挂单人姓名或身份证号"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <el-select
            v-model="searchForm.type"
            placeholder="全部挂单类型"
            clearable
            @change="handleSearch"
            style="width: 150px"
          >
            <el-option label="短住" value="short" />
            <el-option label="直通车" value="express" />
            <el-option label="僧亲" value="monk" />
            <el-option label="团队挂单" value="group" />
            <el-option label="特殊客人" value="special" />
          </el-select>

          <el-select
            v-model="searchForm.dateRange"
            placeholder="全部退单日期"
            clearable
            @change="handleSearch"
            style="width: 150px"
          >
            <el-option label="今天" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本季度" value="quarter" />
          </el-select>

          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="filteredTableData"
        stripe
        style="width: 100%"
        class="application-table"
        v-loading="loading"
      >
        <el-table-column label="挂单人" min-width="120">
          <template #default="{ row }">
            <div class="person-info">
              <el-avatar :size="32" :src="row.avatar" />
              <span class="person-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="idCardMasked" label="身份证号" width="150">
          <template #default="{ row }">
            {{ maskIdCard(row.idCardMasked || row.idCard) }}
          </template>
        </el-table-column>

        <el-table-column prop="departmentName" label="部组" width="100">
          <template #default="{ row }">
            {{ row.departmentName || getDepartmentName(row.departmentCode) }}
          </template>
        </el-table-column>

        <el-table-column prop="checkinDate" label="入住日期" width="120" />

        <el-table-column prop="checkoutDate" label="退单日期" width="120" />

        <el-table-column prop="stayDays" label="入住天数" width="100" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleViewProfile(row)"
            >
              查看
            </el-button>
            <el-button
              v-if="row.status === 30"
              link
              type="info"
              size="small"
              @click="handleStartEvaluation(row)"
            >
              评价
            </el-button>
            <el-button
              v-else-if="row.status === 40"
              link
              type="warning"
              size="small"
              @click="handleViewEvaluation(row)"
            >
              查看评价
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 10" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 评价详情弹窗 -->
    <EvaluationDialog
      v-model:visible="evaluationDialog.visible"
      :title="evaluationDialog.title"
      :profile="currentProfile"
      :show-form="evaluationDialog.showForm"
      :show-evaluation="evaluationDialog.showEvaluation"
      :form="evaluationForm"
      :submitting="submitting"
      :view-evaluation-data="viewEvaluationData"
      :rating-items="ratingItems"
      @close="handleCloseDialog"
      @start-evaluation="handleStartEvaluationFromProfile"
      @cancel-evaluation="handleCancelEvaluation"
      @submit-evaluation="handleSubmitEvaluation"
      @download-profile="handleDownloadProfile"
      @set-rating="setRating"
    />

    <!-- 导出选项弹窗 -->
    <ExportDialog
      v-model:visible="exportDialog.visible"
      :form="exportForm"
      :exporting="exporting"
      @close="exportDialog.visible = false"
      @confirm-export="handleConfirmExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, User, Star, StarFilled, Menu, Message } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EvaluationStatusFilter from './components/EvaluationStatusFilter.vue'
import EvaluationDialog from './components/EvaluationDialog.vue'
import ExportDialog from './components/ExportDialog.vue'
import { EvaluationStatus } from '@/types/review'
import { departmentOptions } from '@/utils/constants'
import {
  EvaluationRecord,
  EvaluationForm,
  RatingOption,
  RatingItem,
  ViewEvaluationData,
  ExportForm,
  EvaluationDialogConfig,
  ExportDialogConfig,
} from '@/types/evaluation'

import {
  getPendingRecords,
  exportPendingRecords,
  type PendingRecordsQuery,
  type LodgingRecordVO,
} from '@/api/pending-records'
import {
  submitEvaluation,
  type EvaluationSubmitRequest,
  type ResultBoolean,
} from '@/api/review'


// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const exporting = ref(false)
const activeTab = ref('pending')

const filterStatus = ref(EvaluationStatus.PENDING)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  dateRange: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 表格数据 - 使用挂单记录的真实数据
const tableData = ref<LodgingRecordVO[]>([])
const total = ref(0)

// 评价弹窗
const evaluationDialog = reactive({
  visible: false,
  title: '',
  showForm: false,
  showEvaluation: false
})

// 当前查看的档案 - 兼容新旧数据结构
const currentProfile = ref<EvaluationRecord & Partial<LodgingRecordVO>>({} as EvaluationRecord & Partial<LodgingRecordVO>)

// 评价表单
const evaluationForm = reactive<EvaluationForm>({
  ratings: [0, 0, 0, 0, 0],
  comments: '',
  overall: ''
})

// 评分项配置
const ratingItems = ref([
  {
    label: '纪律遵守情况',
    options: [
      { value: 1, label: '差', icon: Message, color: '#f56565' },
      { value: 2, label: '较差', icon: Menu, color: '#ed8936' },
      { value: 3, label: '一般', icon: Menu, color: '#ecc94b' },
      { value: 4, label: '良好', icon: StarFilled, color: '#48bb78' },
      { value: 5, label: '优秀', icon: StarFilled, color: '#38a169' }
    ]
  },
  {
    label: '礼仪规范情况',
    options: [
      { value: 1, label: '差', icon: Message, color: '#f56565' },
      { value: 2, label: '较差', icon: Menu, color: '#ed8936' },
      { value: 3, label: '一般', icon: Menu, color: '#ecc94b' },
      { value: 4, label: '良好', icon: StarFilled, color: '#48bb78' },
      { value: 5, label: '优秀', icon: StarFilled, color: '#38a169' }
    ]
  },
  {
    label: '集体活动参与',
    options: [
      { value: 1, label: '差', icon: Message, color: '#f56565' },
      { value: 2, label: '较差', icon: Menu, color: '#ed8936' },
      { value: 3, label: '一般', icon: Menu, color: '#ecc94b' },
      { value: 4, label: '良好', icon: StarFilled, color: '#48bb78' },
      { value: 5, label: '优秀', icon: StarFilled, color: '#38a169' }
    ]
  },
  {
    label: '环境维护与卫生',
    options: [
      { value: 1, label: '差', icon: Message, color: '#f56565' },
      { value: 2, label: '较差', icon: Menu, color: '#ed8936' },
      { value: 3, label: '一般', icon: Menu, color: '#ecc94b' },
      { value: 4, label: '良好', icon: StarFilled, color: '#48bb78' },
      { value: 5, label: '优秀', icon: StarFilled, color: '#38a169' }
    ]
  },
  {
    label: '与人相处情况',
    options: [
      { value: 1, label: '差', icon: Message, color: '#f56565' },
      { value: 2, label: '较差', icon: Menu, color: '#ed8936' },
      { value: 3, label: '一般', icon: Menu, color: '#ecc94b' },
      { value: 4, label: '良好', icon: StarFilled, color: '#48bb78' },
      { value: 5, label: '优秀', icon: StarFilled, color: '#38a169' }
    ]
  }
])

// 查看评价数据
const viewEvaluationData = reactive({
  discipline: 4,
  etiquette: 5,
  activity: 4,
  environment: 5,
  interaction: 4,
  comments: '该挂单人在寺期间表现良好，遵守寺院规章制度，积极参与各项活动。',
  overall: 'good'
})

// 导出弹窗
const exportDialog = reactive({
  visible: false
})

const exportForm = reactive({
  range: 'current',
  format: 'excel'
})

// 计算属性
const filteredTableData = computed(() => {
  let data = tableData.value

  // // 根据当前选择的tab状态筛选
  // if (activeTab.value === 'pending') {
  //   // 待评价：入住中的记录 (status = 30)
  //   data = data.filter(item => item.status === 30)
  // } else if (activeTab.value === 'completed') {
  //   // 已评价：已退住的记录 (status = 40)
  //   data = data.filter(item => item.status === 40)
  // }

  // 关键词搜索
  if (searchForm.keyword) {
    data = data.filter(item =>
      item.name?.includes(searchForm.keyword) ||
      item.idCard?.includes(searchForm.keyword) ||
      item.mobile?.includes(searchForm.keyword)
    )
  }

  return data
})

const totalItems = computed(() => filteredTableData.value.length)
const startIndex = computed(() => (pagination.currentPage - 1) * pagination.pageSize + 1)
const endIndex = computed(() => Math.min(pagination.currentPage * pagination.pageSize, totalItems.value))

const pendingCount = computed(() => {
  // 基于当前筛选状态计算待评价数量
  const filteredData = tableData.value.filter(item => {
    if (filterStatus.value === EvaluationStatus.PENDING) {
      return item.status === 30 // 入住中
    } else if (filterStatus.value === EvaluationStatus.COMPLETED) {
      return item.status === 40 // 已退住
    }
    return false
  })
  return filteredData.length
})

const completedCount = computed(() => {
  // 基于当前筛选状态计算已评价数量
  const filteredData = tableData.value.filter(item => {
    if (filterStatus.value === EvaluationStatus.COMPLETED) {
      return item.status === 40 // 已退住
    }
    return false
  })
  return filteredData.length
})

// 获取挂单记录列表 - 使用真实数据
const fetchPendingRecords = async () => {
  try {
    loading.value = true
    const params: PendingRecordsQuery = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }

    // 根据评价状态筛选对应的入住状态
    if (filterStatus.value === EvaluationStatus.PENDING) {
      // 待评价：入住中 (status = 30)
      params.status = 30
    } else if (filterStatus.value === EvaluationStatus.COMPLETED) {
      // 已评价：已退住 (status = 40)
      params.status = 40
    }

    const response = await getPendingRecords(params)
    console.log('评价管理页面-挂单记录查询响应:', response)

    if (response && response.records) {
      tableData.value = response.records || []
      total.value = response.total || 0
    } else {
      tableData.value = []
      total.value = 0
    }
    console.log(tableData.value);
    
  } catch (error) {
    console.error('获取挂单记录失败:', error)
    ElMessage.error('获取挂单记录失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ====== 筛选状态 切换 ======
const statusChange = () => {
  pagination.currentPage = 1; // 切换 Tab 时重置页码
  fetchPendingRecords(); // 重新加载数据
};


// 方法
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  pagination.currentPage = 1
}

const handleSearch = () => {
  pagination.currentPage = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchPendingRecords()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchPendingRecords()
}

// 查看
const handleViewProfile = (row: LodgingRecordVO) => {
  currentProfile.value = {
    // id: row.personId?.toString() || row.applicationId?.toString() || '',
    id: row.applicationId?.toString(),
    name: row.name || '',
    avatar: row.avatar || '',
    idCard: row.idCardMasked || row.idCard || '',
    type: row.applicationType || 'short',
    checkInDate: row.checkinDate || '',
    checkOutDate: row.checkoutDate || '',
    status: row.status === 30 ? 'pending' : 'completed',
    gender: row.gender || '',
    age: row.age || '',
    nation: row.nation || '',
    phone: row.mobileMasked || row.mobile || '',
    duration: row.stayDays ? `${row.stayDays}天` : '',
    purpose: row.purpose || '禅修'
  }
  evaluationDialog.title = `挂单人详情 - ${row.name}`
  evaluationDialog.visible = true
  evaluationDialog.showForm = false
  evaluationDialog.showEvaluation = false
}

// 评价
const handleStartEvaluation = (row: LodgingRecordVO) => {
  currentProfile.value = {
    // id: row.personId?.toString() || row.applicationId?.toString() || '',
    id: row.applicationId?.toString(),
    name: row.name || '',
    avatar: row.avatar || '',
    idCard: row.idCardMasked || row.idCard || '',
    type: row.applicationType || 'short',
    checkInDate: row.checkinDate || '',
    checkOutDate: row.checkoutDate || '',
    status: row.status === 30 ? 'pending' : 'completed',
    gender: row.gender || '',
    age: row.age || '',
    nation: row.nation || '',
    phone: row.mobileMasked || row.mobile || '',
    duration: row.stayDays ? `${row.stayDays}天` : '',
    purpose: row.purpose || '禅修'
  }
  evaluationDialog.title = `挂单人详情 - ${row.name}`
  evaluationDialog.visible = true
  evaluationDialog.showForm = true
  evaluationDialog.showEvaluation = false
  resetEvaluationForm()
}

// 查看评价
const handleViewEvaluation = (row: LodgingRecordVO) => {
  currentProfile.value = {
    // id: row.personId?.toString() || row.applicationId?.toString() || '',
    id: row.applicationId?.toString(),
    name: row.name || '',
    avatar: row.avatar || '',
    idCard: row.idCardMasked || row.idCard || '',
    type: row.applicationType || 'short',
    checkInDate: row.checkinDate || '',
    checkOutDate: row.checkoutDate || '',
    status: row.status === 30 ? 'pending' : 'completed',
    gender: row.gender || '',
    age: row.age || '',
    nation: row.nation || '',
    phone: row.mobileMasked || row.mobile || '',
    duration: row.stayDays ? `${row.stayDays}天` : '',
    purpose: row.purpose || '禅修'
  }
  evaluationDialog.title = `挂单人评价详情 - ${row.name}`
  evaluationDialog.visible = true
  evaluationDialog.showForm = false
  evaluationDialog.showEvaluation = true
}

// 开始评价
const handleStartEvaluationFromProfile = () => {
  evaluationDialog.showForm = true
  evaluationDialog.showEvaluation = false
  resetEvaluationForm()
}

const handleCloseDialog = () => {
  evaluationDialog.visible = false
  resetEvaluationForm()
}

const handleCancelEvaluation = () => {
  evaluationDialog.showForm = false
  resetEvaluationForm()
}

const resetEvaluationForm = () => {
  evaluationForm.ratings = [0, 0, 0, 0, 0]
  evaluationForm.comments = ''
  evaluationForm.overall = ''
}

const setRating = (index: number, value: number) => {
  evaluationForm.ratings[index] = value
}

// 提交评价
const handleSubmitEvaluation = async () => {
  if (!evaluationForm.comments.trim()) {
    ElMessage.error('请输入评价意见与建议')
    return
  }

  if (!evaluationForm.overall) {
    ElMessage.error('请选择综合评价等级')
    return
  }

  // 检查所有评分项是否都已评分
  const hasEmptyRating = evaluationForm.ratings.some(rating => rating === 0)
  if (hasEmptyRating) {
    ElMessage.error('请为所有评分项打分')
    return
  }

  try {
    submitting.value = true

    // 构建API请求参数
    const params: EvaluationSubmitRequest = {
      disciplineScore: evaluationForm.ratings[0], // 纪律遵守情况
      etiquetteScore: evaluationForm.ratings[1],   // 礼仪规范情况
      activityScore: evaluationForm.ratings[2],    // 集体活动参与
      hygieneScore: evaluationForm.ratings[3],      // 环境维护与卫生
      relationshipScore: evaluationForm.ratings[4], // 与人相处情况
      comment: evaluationForm.comments,
      overallGrade: getOverallGradeValue(evaluationForm.overall)
    }
    
    // 使用 applicationId 或 personId 作为评价ID
    // const evaluationId = currentProfile.value.applicationId || currentProfile.value.personId || 0
    const evaluationId = currentProfile.value.id

    const response: ResultBoolean = await submitEvaluation(evaluationId, params)

    if (response.code === 0) {
      ElMessage.success('评价提交成功')

      // 更新数据状态 - 将入住中状态改为已退住状态
      const index = tableData.value.findIndex(item =>
        item.applicationId === evaluationId || item.personId === evaluationId
      )
      if (index !== -1) {
        tableData.value[index].status = 40 // 已退住
      }

      handleCloseDialog()
    } else {
      ElMessage.error(response.message || '评价提交失败')
    }
  } catch (error) {
    console.error('提交评价失败:', error)
    ElMessage.error('评价提交失败')
  } finally {
    submitting.value = false
  }
}

const handleDownloadProfile = () => {
  ElMessage.info('挂单记录下载功能已触发')
}

const handleExport = () => {
  exportDialog.visible = true
}

const handleConfirmExport = async () => {
  try {
    exporting.value = true

    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    const rangeText = {
      current: '当前页记录',
      filtered: '筛选后记录',
      all: '全部记录'
    }[exportForm.range]

    ElMessage.success(`导出成功！文件格式: ${exportForm.format.toUpperCase()}, 范围: ${rangeText}`)
    exportDialog.visible = false
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
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


// 工具函数 - 从 PendingRecords 页面复制
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
      return 'primary'
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

// 获取状态标签文本
const getStatusLabel = (status?: number): string => {
  switch (status) {
    case 10:
      return '申请中'
    case 20:
      return '待入住'
    case 30:
      return '入住中'
    case 40:
      return '已退住'
    case 70:
      return '未通过'
    case 90:
      return '已取消'
    default:
      return '未知'
  }
}

// 将综合评价字符串转换为数值（根据API文档：1优秀 2良好 3一般 4较差 5差）
const getOverallGradeValue = (overall: string): number => {
  switch (overall) {
    case 'excellent':
      return 1 // 优秀
    case 'good':
      return 2 // 良好
    case 'average':
      return 3 // 一般
    case 'poor':
      return 4 // 较差
    case 'bad':
      return 5 // 差
    default:
      return 3 // 默认一般
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  fetchPendingRecords()
})
</script>

<style scoped lang="scss">
.evaluation-management {
  padding: 20px;
  background: #fdf6e3;
  min-height: calc(100vh - 64px);
}

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

.filter-input {
  max-width: 260px;
}

/* 隐藏 Webkit 浏览器的滚动条 */
.table-container::-webkit-scrollbar {
  display: none;
}

.application-table {
  max-height: calc(100vh - 360px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

/* 隐藏表格的 Webkit 滚动条 */
.application-table::-webkit-scrollbar {
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
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
.application-table {
  max-height: calc(100vh - 360px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}
/* 隐藏表格的 Webkit 滚动条 */
.application-table::-webkit-scrollbar {
  display: none;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>