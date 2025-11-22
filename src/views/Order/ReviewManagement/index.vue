<template>
  <div class="evaluation-management">
    <!-- 页面标题 -->
    <PageHeader title="在寺表现评价" />

    <!-- 状态页签 -->
    <el-card class="tab-card" shadow="never">
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
    </el-card>

    <!-- 评价列表 -->
    <el-card class="list-card" shadow="never">
      <!-- 搜索和筛选区域 -->
      <div class="filter-section">
        <h3 class="section-title">评价列表</h3>
        <div class="filter-controls">
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
      </div>

      <!-- 表格 -->
      <el-table
        :data="filteredTableData"
        stripe
        style="width: 100%"
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

        <el-table-column prop="idCard" label="身份证号" width="150" />

        <el-table-column label="挂单类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="checkInDate" label="挂单日期" width="120" />

        <el-table-column prop="checkOutDate" label="退单日期" width="120" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'" size="small">
              {{ row.status === 'completed' ? '已评价' : '待评价' }}
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
              v-if="row.status === 'pending'"
              link
              type="info"
              size="small"
              @click="handleStartEvaluation(row)"
            >
              评价
            </el-button>
            <el-button
              v-else
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
      <div class="pagination-wrapper">
        <div class="pagination-info">
          显示 {{ startIndex }} 至 {{ endIndex }} 条，共 {{ totalItems }} 条
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalItems"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 评价详情弹窗 -->
    <el-dialog
      v-model="evaluationDialog.visible"
      :title="evaluationDialog.title"
      width="80%"
      :before-close="handleCloseDialog"
      class="evaluation-dialog"
    >
      <div class="dialog-content">
        <!-- 挂单人基本信息 -->
        <div class="profile-section">
          <h4 class="section-title">
            <el-icon><User /></el-icon>
            挂单人基本信息
          </h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ currentProfile.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ currentProfile.gender }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ currentProfile.age }}</el-descriptions-item>
            <el-descriptions-item label="民族">{{ currentProfile.nation }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentProfile.phone }}</el-descriptions-item>
            <el-descriptions-item label="挂单类型">
              <el-tag :type="getTypeTagType(currentProfile.type)" size="small">
                {{ getTypeLabel(currentProfile.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="挂单日期">{{ currentProfile.checkInDate }}</el-descriptions-item>
            <el-descriptions-item label="退单日期">{{ currentProfile.checkOutDate }}</el-descriptions-item>
            <el-descriptions-item label="挂单时长">{{ currentProfile.duration }}</el-descriptions-item>
            <el-descriptions-item label="挂单目的">{{ currentProfile.purpose }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 评价表单 -->
        <div v-if="evaluationDialog.showForm" class="evaluation-form">
          <h4 class="section-title">
            <el-icon><Star /></el-icon>
            在寺表现评价
          </h4>

          <el-form :model="evaluationForm" label-width="140px">
            <!-- 评分项 -->
            <div class="rating-sections">
              <div
                v-for="(item, index) in ratingItems"
                :key="index"
                class="rating-item"
              >
                <label class="rating-label">{{ index + 1 }}. {{ item.label }}</label>
                <div class="rating-options">
                  <div
                    v-for="option in item.options"
                    :key="option.value"
                    class="rating-option"
                    :class="{ active: evaluationForm.ratings[index] === option.value }"
                    @click="setRating(index, option.value)"
                  >
                    <el-icon :size="24" :color="option.color">
                      <component :is="option.icon" />
                    </el-icon>
                    <span>{{ option.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 评价意见 -->
            <el-form-item label="评价意见与建议" required>
              <el-input
                v-model="evaluationForm.comments"
                type="textarea"
                :rows="4"
                placeholder="请输入对挂单人在寺表现的具体评价和建议"
              />
            </el-form-item>

            <!-- 综合评价 -->
            <el-form-item label="综合评价等级" required>
              <el-select
                v-model="evaluationForm.overall"
                placeholder="请选择综合评价等级"
                style="width: 200px"
              >
                <el-option label="优秀" value="excellent" />
                <el-option label="良好" value="good" />
                <el-option label="一般" value="average" />
                <el-option label="较差" value="poor" />
                <el-option label="差" value="bad" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 已评价内容展示 -->
        <div v-else-if="evaluationDialog.showEvaluation" class="evaluation-content">
          <h4 class="section-title">
            <el-icon><Star /></el-icon>
            评价内容
          </h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="纪律遵守情况">
              <el-rate v-model="viewEvaluationData.discipline" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="礼仪规范情况">
              <el-rate v-model="viewEvaluationData.etiquette" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="集体活动参与">
              <el-rate v-model="viewEvaluationData.activity" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="环境维护与卫生">
              <el-rate v-model="viewEvaluationData.environment" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="与人相处情况">
              <el-rate v-model="viewEvaluationData.interaction" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="评价意见">
              {{ viewEvaluationData.comments }}
            </el-descriptions-item>
            <el-descriptions-item label="综合评价等级">
              <el-tag :type="getOverallTagType(viewEvaluationData.overall)">
                {{ getOverallLabel(viewEvaluationData.overall) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <div v-if="!evaluationDialog.showForm && !evaluationDialog.showEvaluation" class="view-actions">
            <el-button @click="handleCloseDialog">关闭</el-button>
            <el-button type="primary" @click="handleStartEvaluationFromProfile">开始评价</el-button>
          </div>
          <div v-else-if="evaluationDialog.showForm" class="form-actions">
            <el-button @click="handleCancelEvaluation">取消</el-button>
            <el-button type="primary" @click="handleSubmitEvaluation" :loading="submitting">
              提交评价
            </el-button>
          </div>
          <div v-else class="evaluation-actions">
            <el-button @click="handleCloseDialog">关闭</el-button>
          </div>
        </div>
        <div class="dialog-footer-bottom">
          <el-button type="primary" @click="handleDownloadProfile">
            <el-icon><Download /></el-icon>
            下载挂单记录
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出选项弹窗 -->
    <el-dialog
      v-model="exportDialog.visible"
      title="导出评价记录"
      width="500px"
    >
      <el-form :model="exportForm" label-width="80px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportForm.range">
            <el-radio value="current">当前页记录</el-radio>
            <el-radio value="filtered">筛选后记录</el-radio>
            <el-radio value="all">全部记录</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio value="excel">Excel (.xlsx)</el-radio>
            <el-radio value="csv">CSV (.csv)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmExport" :loading="exporting">
            确认导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download, User, Star, StarFilled, Menu, Message } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'

// 类型定义
interface EvaluationRecord {
  id: string
  name: string
  avatar: string
  idCard: string
  type: 'short' | 'express' | 'monk' | 'group' | 'special'
  checkInDate: string
  checkOutDate: string
  status: 'pending' | 'completed'
  gender: string
  age: string
  nation: string
  phone: string
  duration: string
  purpose: string
}

interface EvaluationForm {
  ratings: number[]
  comments: string
  overall: string
}

interface RatingOption {
  value: number
  label: string
  icon: any
  color: string
}

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const exporting = ref(false)
const activeTab = ref('pending')

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

// 表格数据
const tableData = ref<EvaluationRecord[]>([
  {
    id: 'GP20230701001',
    name: '张明远',
    avatar: 'https://via.placeholder.com/32x32',
    idCard: '3****************X',
    type: 'short',
    checkInDate: '2023-07-01',
    checkOutDate: '2023-07-15',
    status: 'pending',
    gender: '男',
    age: '32岁',
    nation: '汉族',
    phone: '138****5678',
    duration: '15天',
    purpose: '禅修'
  },
  {
    id: 'GP20230705002',
    name: '李静怡',
    avatar: 'https://via.placeholder.com/32x32',
    idCard: '4****************X',
    type: 'express',
    checkInDate: '2023-07-05',
    checkOutDate: '2023-07-20',
    status: 'pending',
    gender: '女',
    age: '28岁',
    nation: '汉族',
    phone: '139****8765',
    duration: '16天',
    purpose: '禅修'
  },
  {
    id: 'GP20230620003',
    name: '王智明',
    avatar: 'https://via.placeholder.com/32x32',
    idCard: '1****************X',
    type: 'monk',
    checkInDate: '2023-06-20',
    checkOutDate: '2023-06-30',
    status: 'pending',
    gender: '男',
    age: '45岁',
    nation: '汉族',
    phone: '137****4321',
    duration: '11天',
    purpose: '禅修'
  },
  {
    id: 'GP20230610004',
    name: '陈司时',
    avatar: 'https://via.placeholder.com/32x32',
    idCard: '1****************1',
    type: 'group',
    checkInDate: '2023-06-10',
    checkOutDate: '2023-06-25',
    status: 'completed',
    gender: '男',
    age: '35岁',
    nation: '汉族',
    phone: '136****9876',
    duration: '16天',
    purpose: '禅修'
  },
  {
    id: 'GP20230705005',
    name: '陈教授',
    avatar: 'https://via.placeholder.com/32x32',
    idCard: '5****************X',
    type: 'special',
    checkInDate: '2023-07-05',
    checkOutDate: '2023-07-07',
    status: 'completed',
    gender: '男',
    age: '58岁',
    nation: '汉族',
    phone: '135****2468',
    duration: '3天',
    purpose: '交流访问'
  }
])

// 评价弹窗
const evaluationDialog = reactive({
  visible: false,
  title: '',
  showForm: false,
  showEvaluation: false
})

// 当前查看的档案
const currentProfile = ref<EvaluationRecord>({} as EvaluationRecord)

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
  let data = tableData.value.filter(item => item.status === activeTab.value)

  if (searchForm.keyword) {
    data = data.filter(item =>
      item.name.includes(searchForm.keyword) ||
      item.idCard.includes(searchForm.keyword)
    )
  }

  if (searchForm.type) {
    data = data.filter(item => item.type === searchForm.type)
  }

  return data
})

const totalItems = computed(() => filteredTableData.value.length)
const startIndex = computed(() => (pagination.currentPage - 1) * pagination.pageSize + 1)
const endIndex = computed(() => Math.min(pagination.currentPage * pagination.pageSize, totalItems.value))

const pendingCount = computed(() => tableData.value.filter(item => item.status === 'pending').length)
const completedCount = computed(() => tableData.value.filter(item => item.status === 'completed').length)

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
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

const handleViewProfile = (row: EvaluationRecord) => {
  currentProfile.value = { ...row }
  evaluationDialog.title = `挂单人详情 - ${row.id}`
  evaluationDialog.visible = true
  evaluationDialog.showForm = false
  evaluationDialog.showEvaluation = false
}

const handleStartEvaluation = (row: EvaluationRecord) => {
  currentProfile.value = { ...row }
  evaluationDialog.title = `挂单人详情 - ${row.id}`
  evaluationDialog.visible = true
  evaluationDialog.showForm = true
  evaluationDialog.showEvaluation = false
  resetEvaluationForm()
}

const handleViewEvaluation = (row: EvaluationRecord) => {
  currentProfile.value = { ...row }
  evaluationDialog.title = `挂单人评价详情 - ${row.id}`
  evaluationDialog.visible = true
  evaluationDialog.showForm = false
  evaluationDialog.showEvaluation = true
}

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

const handleSubmitEvaluation = async () => {
  if (!evaluationForm.comments.trim()) {
    ElMessage.error('请输入评价意见与建议')
    return
  }

  if (!evaluationForm.overall) {
    ElMessage.error('请选择综合评价等级')
    return
  }

  try {
    submitting.value = true

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('评价提交成功')

    // 更新数据状态
    const index = tableData.value.findIndex(item => item.id === currentProfile.value.id)
    if (index !== -1) {
      tableData.value[index].status = 'completed'
    }

    handleCloseDialog()
  } catch (error) {
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

const getTypeLabel = (type: string) => {
  const labels = {
    short: '短住',
    express: '直通车',
    monk: '僧亲',
    group: '团队挂单',
    special: '特殊客人'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    short: 'primary',
    express: 'success',
    monk: 'warning',
    group: 'info',
    special: 'danger'
  }
  return types[type] || 'info'
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

const getOverallTagType = (overall: string) => {
  const types = {
    excellent: 'success',
    good: 'primary',
    average: 'warning',
    poor: 'danger',
    bad: 'danger'
  }
  return types[overall] || 'info'
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.evaluation-management {
  padding: 24px;
  background: #fdf6e3;
  min-height: calc(100vh - 64px);
}



.tab-card {
  margin-bottom: 24px;

  .tab-label {
    font-weight: 500;
  }

  .tab-badge {
    margin-left: 8px;
  }
}

.list-card {
  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 24px;

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #8b5a2b;
      margin: 0;
      white-space: nowrap;
    }

    .filter-controls {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      flex: 1;

      .search-box {
        flex: 1;
        min-width: 200px;
        max-width: 300px;
      }
    }
  }

  .person-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .person-name {
      font-weight: 500;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .pagination-info {
      color: #666;
      font-size: 14px;
    }
  }
}

.evaluation-dialog {
  .dialog-content {
    max-height: 70vh;
    overflow-y: auto;
  }

  .profile-section {
    margin-bottom: 32px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #8b5a2b;
      margin-bottom: 16px;
    }
  }

  .evaluation-form {
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #8b5a2b;
      margin-bottom: 24px;
    }

    .rating-sections {
      margin-bottom: 32px;

      .rating-item {
        margin-bottom: 24px;

        .rating-label {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
        }

        .rating-options {
          display: flex;
          gap: 24px;

          .rating-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.3s;

            &:hover {
              background: #f5f7fa;
            }

            &.active {
              background: #e8f5e8;
              border: 2px solid #67c23a;
            }

            span {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }
  }

  .evaluation-content {
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #8b5a2b;
      margin-bottom: 16px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .view-actions,
  .form-actions,
  .evaluation-actions {
    display: flex;
    gap: 12px;
  }
}

.dialog-footer-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>