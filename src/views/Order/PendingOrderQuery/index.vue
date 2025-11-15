<template>
  <div class="pending-order-query">
    <!-- 页面头部 -->
    <PageHeader title="挂单记录查询" description="查询和管理挂单记录信息" />

    <!-- 筛选区域 -->
    <FilterForm
      ref="filterFormRef"
      :exporting="exporting"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    />

    <!-- 数据表格 -->
    <PendingOrderTable
      :loading="loading"
      :data="tableData"
      @view-detail="handleViewDetail"
      @view-history="handleViewHistory"
    />

    <!-- 分页 -->
    <CustomPagination
      :pagination="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 查看详情弹窗 -->
    <OrderDetailDialog
      v-model="detailVisible"
      :record="currentRecord"
    />

    <!-- 历史记录弹窗 -->
    <OrderHistoryDialog
      v-model="historyVisible"
      :record="currentRecord"
      :history-data="historyData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 引入组件
import PageHeader from './components/PageHeader.vue'
import FilterForm from './components/FilterForm.vue'
import PendingOrderTable from './components/PendingOrderTable.vue'
import CustomPagination from './components/CustomPagination.vue'
import OrderDetailDialog from './components/OrderDetailDialog.vue'
import OrderHistoryDialog from './components/OrderHistoryDialog.vue'

// 引入类型
import type { PendingOrderRecord, OrderHistory } from './components/types' // FilterForm

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const detailVisible = ref(false)
const historyVisible = ref(false)
const currentRecord = ref<PendingOrderRecord | null>(null)
const historyData = ref<OrderHistory[]>([])

// 组件引用
const filterFormRef = ref()

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

// 表格数据
const tableData = ref<PendingOrderRecord[]>([])

// 模拟数据
const mockData: PendingOrderRecord[] = [
  {
    id: '1',
    name: '张三',
    gender: 'male',
    idCard: '110101199001011234',
    phone: '13800138000',
    birthDate: '1990-01-01',
    nation: '汉族',
    totalOrderCount: 5,
    address: '北京市朝阳区',
    wechat: 'zhangsan_wx',
    maritalStatus: '未婚',
    permanentProvince: '北京市',
    permanentCity: '朝阳区',
    permanentAddress: '某某街道某某小区1号楼101室',
    education: '本科',
    university: '北京大学',
    major: '计算机科学与技术',
    skills: '编程、摄影、英语流利',
    profession: '软件工程师',
    emergencyContact1: '张父',
    emergencyPhone1: '13900139001',
    emergencyContact2: '张母',
    emergencyPhone2: '13900139002',
    medicalHistory: '无重大疾病史',
    medicationHistory: '无长期服药史',
    infectiousHistory: '无传染病史',
    studySituation: '已接触佛教3年，每日诵经',
    convertDate: '2021-06-15',
    templeExperience: '曾在灵隐寺参加禅修营',
    currentActivities: '参加当地佛学小组学习',
    visitHistory: '来崇恩寺3次，分别为2023年春节、2023年中秋节、2024年元旦',
    ordination: '未受戒',
    fivePrecepts: '是',
    eightPrecepts: '否',
    bodhisattvaPrecepts: '否',
    applyStartDate: '2024-02-01',
    applyEndDate: '2024-02-07',
    stayReason: '希望在新年期间进行禅修，净化心灵，学习佛法',
    selfEvaluation: '性格温和，有耐心，尊重寺院规矩，希望能在清净环境中修行',
    referee: '李法师',
    refereeContact: '13600136001',
    refereeEvaluation: '该弟子诚心向佛，品行端正，推荐挂单'
  },
  {
    id: '2',
    name: '李四',
    gender: 'female',
    idCard: '110101199002021234',
    phone: '13800138001',
    birthDate: '1990-02-02',
    nation: '汉族',
    totalOrderCount: 3,
    address: '北京市海淀区',
    wechat: 'lisi_wx',
    maritalStatus: '已婚',
    permanentProvince: '北京市',
    permanentCity: '海淀区',
    permanentAddress: '某某街道某某小区2号楼202室',
    education: '硕士',
    university: '清华大学',
    major: '中国语言文学',
    skills: '书法、茶道、古琴',
    profession: '高中语文教师',
    emergencyContact1: '李夫',
    emergencyPhone1: '13900139003',
    emergencyContact2: '李母',
    emergencyPhone2: '13900139004',
    medicalHistory: '轻度过敏性鼻炎',
    medicationHistory: '季节性服用抗过敏药物',
    infectiousHistory: '无',
    studySituation: '自幼受家庭影响信仰佛教',
    convertDate: '2018-09-20',
    templeExperience: '多次参与寺院义工活动',
    currentActivities: '每周参加佛学讲座',
    visitHistory: '来崇恩寺2次，2023年佛诞节、2024年春节',
    ordination: '已受居士五戒',
    fivePrecepts: '是',
    eightPrecepts: '是',
    bodhisattvaPrecepts: '否',
    applyStartDate: '2024-03-01',
    applyEndDate: '2024-03-05',
    stayReason: '希望在工作之余进行短期修行，充实精神生活',
    selfEvaluation: '性格沉稳，做事认真，遵守纪律，有团队合作精神',
    referee: '王法师',
    refereeContact: '13600136002',
    refereeEvaluation: '李居士热心佛法，乐于助人，适合寺院修行生活'
  },
  {
    id: '3',
    name: '王五',
    gender: 'male',
    idCard: '110101199003031234',
    phone: '13800138002',
    birthDate: '1990-03-03',
    nation: '回族',
    totalOrderCount: 8,
    address: '北京市西城区'
  },
  {
    id: '4',
    name: '赵六',
    gender: 'female',
    idCard: '110101199004041234',
    phone: '13800138003',
    birthDate: '1990-04-04',
    nation: '汉族',
    totalOrderCount: 12,
    address: '北京市东城区'
  },
  {
    id: '5',
    name: '钱七',
    gender: 'male',
    idCard: '110101199005051234',
    phone: '13800138004',
    birthDate: '1990-05-05',
    nation: '满族',
    totalOrderCount: 3,
    address: '北京市丰台区'
  },
  {
    id: '6',
    name: '孙八',
    gender: 'female',
    idCard: '110101199006061234',
    phone: '13800138005',
    birthDate: '1990-06-06',
    nation: '蒙古族',
    totalOrderCount: 15,
    address: '北京市石景山区'
  }
]

const mockHistoryData: OrderHistory[] = [
  {
    id: '1',
    orderDate: '2024-01-15',
    leaveDate: '2024-01-17',
    duration: 3,
    roomNumber: '101',
    roomType: '单人间',
    bedNumber: '1号床',
    performance: '优秀',
    status: 'completed'
  },
  {
    id: '2',
    orderDate: '2024-02-08',
    leaveDate: '2024-02-10',
    duration: 3,
    roomNumber: '205',
    roomType: '双人间',
    bedNumber: '2号床',
    performance: '良好',
    status: 'completed'
  },
  {
    id: '3',
    orderDate: '2024-03-12',
    leaveDate: '2024-03-18',
    duration: 7,
    roomNumber: '308',
    roomType: '三人间',
    bedNumber: '1号床',
    performance: '一般',
    status: 'violation'
  },
  {
    id: '4',
    orderDate: '2024-05-01',
    leaveDate: '2024-05-03',
    duration: 3,
    roomNumber: '102',
    roomType: '单人间',
    bedNumber: '1号床',
    performance: '优秀',
    status: 'completed'
  },
  {
    id: '5',
    orderDate: '2024-07-15',
    leaveDate: '2024-07-20',
    duration: 6,
    roomNumber: '210',
    roomType: '双人间',
    bedNumber: '1号床',
    performance: '良好',
    status: 'completed'
  }
]

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 获取筛选条件
    const filterForm = filterFormRef.value?.form || {}

    // 过滤数据
    let filteredData = [...mockData]

    if (filterForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.includes(filterForm.name)
      )
    }

    if (filterForm.gender) {
      filteredData = filteredData.filter(item =>
        item.gender === filterForm.gender
      )
    }

    if (filterForm.orderCountRange) {
      const range = filterForm.orderCountRange
      filteredData = filteredData.filter(item => {
        if (range === '1-5') {
          return item.totalOrderCount >= 1 && item.totalOrderCount <= 5
        } else if (range === '6-10') {
          return item.totalOrderCount >= 6 && item.totalOrderCount <= 10
        } else if (range === '10+') {
          return item.totalOrderCount > 10
        }
        return true
      })
    }

    pagination.total = filteredData.length

    // 分页
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)

  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  pagination.currentPage = 1
  loadData()
}

const handleExport = async () => {
  exporting.value = true
  try {
    // 模拟导出
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

const handleViewDetail = (record: PendingOrderRecord) => {
  currentRecord.value = record
  detailVisible.value = true
}

const handleViewHistory = (record: PendingOrderRecord) => {
  currentRecord.value = record
  // 模拟加载历史数据
  historyData.value = [...mockHistoryData]
  historyVisible.value = true
}


// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.pending-order-query {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

// 响应式设计
@media (max-width: 768px) {
  .pending-order-query {
    padding: 16px;
  }
}
</style>