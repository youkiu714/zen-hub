<template>
  <div class="evaluation-management">
    <!-- 页面标题 -->
    <PageHeader title="在寺表现评价" />

    <EvaluationStatusFilter v-model="filterStatus" @update:modelValue="statusChange" />

    <!-- 评价列表 -->
    <div class="table-container">
      <!-- 搜索和筛选区域 -->
      <div class="filter-bar">
        <div class="search-box">
          <el-input v-model="searchForm.keyword" placeholder="搜索姓名、证件号或申请编号" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="filteredTableData" stripe style="width: 100%" class="application-table" v-loading="loading">
        <el-table-column label="挂单人" min-width="150">
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

        <el-table-column label="性别/年龄" min-width="100">
          <template #default="{ row }">
            <div>{{ row.gender === 1 ? '男' : '女' }} / {{ row.age }}岁</div>
          </template>
        </el-table-column>

        <el-table-column prop="applicationTypeName" label="挂单类型" min-width="100">
          <template #default="{ row }">
            {{ row.applicationTypeName}}
          </template>
        </el-table-column>

        <el-table-column prop="checkinDate" label="入住日期" min-width="120" />

        <el-table-column prop="actualCheckoutDate" label="退单日期" min-width="120">
          <template #default="{ row }">
            {{ row.actualCheckoutDate || row.plannedCheckoutDate || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="mobileMasked" label="手机号" min-width="120">
          <template #default="{ row }">
            {{ row.mobileMasked || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getEvaluationStatusType(row.status)" size="small">
              {{ getEvaluationStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">   <!-- handleViewProfile -->
              查看
            </el-button>
            <el-button v-if="row.status === 10" link type="info" size="small" @click="handleStartEvaluation(row)">
              评价
            </el-button>
            <el-button v-else-if="row.status === 20" link type="warning" size="small"
              @click="handleViewEvaluation(row)">
              查看评价
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 10" class="pagination-container">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 评价详情弹窗 -->
    <EvaluationDialog v-model:visible="evaluationDialog.visible" :title="evaluationDialog.title"
      :profile="currentProfile" :show-form="evaluationDialog.showForm"
      :show-evaluation="evaluationDialog.showEvaluation" :form="evaluationForm" :submitting="submitting"
      :view-evaluation-data="viewEvaluationData" :rating-items="ratingItems" @close="handleCloseDialog"
      @start-evaluation="handleStartEvaluationFromProfile" @cancel-evaluation="handleCancelEvaluation"
      @submit-evaluation="handleSubmitEvaluation" @download-profile="handleDownloadProfile" @set-rating="setRating" />

       <!-- 查看详情 -->
    <ApplicationDetailDialog v-model="detailVisible" :application-id="currentAppId" @close="onDetailClosed" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EvaluationStatusFilter from './components/EvaluationStatusFilter.vue'
import EvaluationDialog from './components/EvaluationDialog.vue'
import { EvaluationStatus } from '@/types/review'
import {
  EvaluationRecord,
  EvaluationForm,
} from '@/types/evaluation'

import {
  submitEvaluation,
  getEvaluations,
  getEvaluationDetail,
  type EvaluationsQuery,
  type EvaluationListItemVO,
  type EvaluationsResponse,
  type EvaluationSubmitRequest,
  type ResultBoolean,
  type EvaluationDetailResponse,
  type EvaluationDetailVO,
} from '@/api/review'

import ApplicationDetailDialog from '@/components/ApplicationDetailDialog.vue'
import { ApplicationTypeMap } from '@/utils/constants'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)

const filterStatus = ref(EvaluationStatus.PENDING)

// 详情对话框状态
const detailVisible = ref(false)
const currentAppId = ref<number | null>(null)

// 查看详情
const handleViewDetail = async (row: EvaluationDetailVO) => {
  currentAppId.value = row.applicationId
  detailVisible.value = true
}

// 关闭详情对话框
const onDetailClosed = () => {
  detailVisible.value = false
  currentAppId.value = null
}

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 表格数据 - 使用评价列表的真实数据
const tableData = ref<EvaluationListItemVO[]>([])
const total = ref(0)

// 评价弹窗
const evaluationDialog = reactive({
  visible: false,
  title: '',
  showForm: false,
  showEvaluation: false
})

// 当前查看的档案 - 兼容新旧数据结构
const currentProfile = ref<EvaluationRecord & Partial<EvaluationListItemVO>>({} as EvaluationRecord & Partial<EvaluationListItemVO>)

// 评价表单
const evaluationForm = reactive<EvaluationForm>({
  ratings: [0, 0, 0, 0, 0],
  comments: '',
  overall: ''
})

// 评分项配置 - 简化配置，使用el-rate组件
const ratingItems = ref([
  {
    label: '纪律遵守情况'
  },
  {
    label: '礼仪规范情况'
  },
  {
    label: '集体活动参与'
  },
  {
    label: '环境维护与卫生'
  },
  {
    label: '与人相处情况'
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


// 计算属性
const filteredTableData = computed(() => {
  let data = tableData.value

  // 关键词搜索 - 现在由后端处理，前端只做显示
  if (searchForm.keyword) {
    data = data.filter(item =>
      item.applicantName?.includes(searchForm.keyword) ||
      item.idCardMasked?.includes(searchForm.keyword) ||
      item.mobileMasked?.includes(searchForm.keyword) ||
      item.applicationId?.toString().includes(searchForm.keyword)
    )
  }

  return data
})


// 获取评价列表 - 使用新的评价接口
const fetchEvaluationRecords = async () => {
  try {
    loading.value = true
    const params: EvaluationsQuery = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }

    // 根据评价状态筛选
    if (filterStatus.value === EvaluationStatus.PENDING) {
      // 待评价
      params.status = 10
    } else if (filterStatus.value === EvaluationStatus.COMPLETED) {
      // 已评价
      params.status = 20
    }

    // 添加关键词搜索
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }

    const response: EvaluationsResponse = await getEvaluations(params)
    console.log('评价管理页面-评价列表查询响应:', response)
    tableData.value = response.records || []

    // if (response && response.code === 0 && response.data) {
    //   tableData.value = response.data.records || []
    //   total.value = response.data.total || 0
    // } else {
    //   tableData.value = []
    //   total.value = 0
    //   ElMessage.error(response.message || '获取评价列表失败')
    // }
    console.log(tableData.value);

  } catch (error) {
    console.error('获取评价列表失败:', error)
    ElMessage.error('获取评价列表失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ====== 筛选状态 切换 ======
const statusChange = () => {
  pagination.currentPage = 1; // 切换 Tab 时重置页码
  fetchEvaluationRecords(); // 重新加载数据
};

const handleSearch = () => {
  pagination.currentPage = 1
  fetchEvaluationRecords()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchEvaluationRecords()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchEvaluationRecords()
}

// 评价
const handleStartEvaluation = (row: EvaluationListItemVO) => {
  currentProfile.value = {
    id: row.evaluationId?.toString() || row.applicationId?.toString() || '',
    name: row.applicantName || '',
    idCard: row.idCardMasked || '',
    type: row.applicationType && ApplicationTypeMap[row.applicationType],
    checkInDate: row.checkinDate || '',
    checkOutDate: row.actualCheckoutDate || row.plannedCheckoutDate || '',
    status: row.status === 10 ? 'pending' : 'completed',
    gender: row.gender ? (row.gender === 1 ? '男' : '女') : '',
    age: row.age, // 新接口没有年龄字段
    nation: row.nation, // 新接口没有民族字段
    phone: row.mobileMasked || '',
    duration: '', // 新接口没有住宿天数字段
    stayDays: row.stayDays || '-',
    purpose: '禅修' // 默认值
  }
  evaluationDialog.title = `${row.applicantName}挂单详情`
  evaluationDialog.visible = true
  evaluationDialog.showForm = true
  evaluationDialog.showEvaluation = false
  resetEvaluationForm()
}

// 查看评价
const handleViewEvaluation = async (row: EvaluationListItemVO) => {
  try {
    // 调用评价详情接口
    const evaluationId = row.evaluationId || row.applicationId
    if (!evaluationId) {
      ElMessage.error('评价ID不存在')
      return
    }

    const response: EvaluationDetailResponse = await getEvaluationDetail(evaluationId)

    const detailData = response

    // 更新当前评价数据
    viewEvaluationData.discipline = detailData.evaluation?.disciplineScore || 0
    viewEvaluationData.etiquette = detailData.evaluation?.etiquetteScore || 0
    viewEvaluationData.activity = detailData.evaluation?.activityScore || 0
    viewEvaluationData.environment = detailData.evaluation?.hygieneScore || 0
    viewEvaluationData.interaction = detailData.evaluation?.relationshipScore || 0
    viewEvaluationData.comments = detailData.evaluation?.comment || ''
    viewEvaluationData.overall = getOverallGradeByNumber(detailData.evaluation?.overallGrade) || 'average'

    console.log("detailData.lodging?.applicationType]:",detailData.lodging?.applicationType)
    // 设置档案信息
    currentProfile.value = {
      id: detailData.person?.personId?.toString() || detailData.lodging?.applicationId?.toString() || evaluationId.toString(),
      name: detailData.person?.name?.toString() || detailData.lodging?.applicationTypeName || '',
      avatar: '', // 接口没有头像字段
      idCard: detailData.person?.idCard || detailData.lodging?.bedNo || '',
      type: ApplicationTypeMap[detailData.lodging?.applicationType],
      checkInDate: detailData.lodging?.checkinDate || '',
      checkOutDate: detailData.lodging?.actualCheckoutDate || '',
      status: row.status === 10 ? 'pending' : 'completed',
      gender: detailData.person?.genderName || '',
      age: detailData.person?.age?.toString() || '',
      nation: detailData.person?.nation || '',
      phone: detailData.person?.mobile || '',
      stayDays: row.stayDays || '-',
      purpose: detailData.lodging?.purpose || '禅修'
    }

    evaluationDialog.title = `挂单人评价详情 - ${detailData.person?.name || detailData.lodging?.applicationTypeName || ''}`
    evaluationDialog.visible = true
    evaluationDialog.showForm = false
    evaluationDialog.showEvaluation = true


  } catch (error) {
    console.error('获取评价详情失败:', error)
    ElMessage.error('获取评价详情失败')
  }
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

    ElMessage.success('评价提交成功')
    // 更新数据状态 - 将入住中状态改为已退住状态
    const index = tableData.value.findIndex(item =>
      item.applicationId === evaluationId || item.personId === evaluationId
    )
    if (index !== -1) {
      tableData.value[index].status = 40 // 已退住
    }

    handleCloseDialog()

    fetchEvaluationRecords()
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

// 获取评价状态标签类型
const getEvaluationStatusType = (status?: number): string => {
  switch (status) {
    case 10: // 待评价
      return 'warning'
    case 20: // 已评价
      return 'success'
    default:
      return 'info'
  }
}

// 获取评价状态标签文本
const getEvaluationStatusLabel = (status?: number): string => {
  switch (status) {
    case 10:
      return '待评价'
    case 20:
      return '已评价'
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

// 将综合评价数值转换为字符串（根据API文档反转换）
const getOverallGradeByNumber = (grade?: number): string => {
  switch (grade) {
    case 1:
      return 'excellent' // 优秀
    case 2:
      return 'good' // 良好
    case 3:
      return 'average' // 一般
    case 4:
      return 'poor' // 较差
    case 5:
      return 'bad' // 差
    default:
      return 'average' // 默认一般
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  fetchEvaluationRecords()
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
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
}

/* 隐藏表格的 Webkit 滚动条 */
.application-table::-webkit-scrollbar {
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

.application-table {
  max-height: calc(100vh - 360px);
  overflow-y: scroll;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 和 Edge */
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
.search-box {
    width: 300px;
}
</style>