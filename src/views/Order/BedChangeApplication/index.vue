<template>
  <div class="bed-change-application">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">换床申请</h2>
      <p class="page-description">对已入住的挂单申请进行换床管理，可申请换床的数据为已入住但未离店的申请，需填写换床原因</p>
    </div>

    <!-- 状态页签 -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="可申请换床" name="available">
          <template #label>
            <span class="tab-label">可申请换床</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已申请换床" name="applied">
          <template #label>
            <span class="tab-label">已申请换床</span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 可申请换床列表 -->
    <div v-show="activeTab === 'available'">
      <el-card class="table-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">可申请换床列表</h3>
            <div class="card-actions">
              <el-input
                v-model="availableQuery.keyword"
                placeholder="搜索申请人姓名或房间号"
                clearable
                style="width: 250px"
                @input="handleAvailableSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="availableQuery.roomType"
                placeholder="全部房型"
                clearable
                style="width: 150px"
                @change="handleAvailableSearch"
              >
                <el-option label="全部房型" value="" />
                <el-option label="常规" value="regular" />
                <el-option label="单人间" value="single" />
                <el-option label="双人间" value="double" />
                <el-option label="四人间" value="quad" />
                <el-option label="多人间" value="dorm" />
              </el-select>
            </div>
          </div>
        </template>

        <el-table
          v-loading="availableLoading"
          :data="availableData"
          stripe
          style="width: 100%"
        >
          <el-table-column label="申请人" min-width="150">
            <template #default="{ row }">
              <div class="applicant-info">
                <el-avatar :size="40" :src="row.avatar" class="applicant-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="applicant-details">
                  <div class="applicant-name">{{ row.name }}</div>
                  <div class="applicant-id">{{ maskIdCard(row.idCard) }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="房间信息" min-width="120">
            <template #default="{ row }">
              <div class="room-info">
                <div class="room-number">{{ row.roomInfo.roomNumber }}</div>
                <div class="bed-number">{{ row.roomInfo.bedNumber }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="checkinDate" label="入住日期" width="120" />
          <el-table-column prop="expectedCheckout" label="预计离店" width="120" />
          <el-table-column label="当前状态" width="100">
            <template #default="{ row }">
              <el-tag type="success" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleApplyChange(row)"
              >
                <el-icon><RefreshRight /></el-icon>
                申请换床
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <div class="pagination-info">
            显示 {{ (availableCurrentPage - 1) * availablePageSize + 1 }} 到 {{ Math.min(availableCurrentPage * availablePageSize, availableTotal) }} 条，共 {{ availableTotal }} 条
          </div>
          <el-pagination
            v-model:current-page="availableCurrentPage"
            v-model:page-size="availablePageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="availableTotal"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleAvailableSizeChange"
            @current-change="handleAvailableCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 已申请换床列表 -->
    <div v-show="activeTab === 'applied'">
      <el-card class="table-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">已申请换床列表</h3>
            <div class="card-actions">
              <el-input
                v-model="appliedQuery.keyword"
                placeholder="搜索申请人姓名或申请编号"
                clearable
                style="width: 250px"
                @input="handleAppliedSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </template>

        <el-table
          v-loading="appliedLoading"
          :data="appliedData"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="applicationId" label="申请编号" width="150" />
          <el-table-column label="申请人" min-width="150">
            <template #default="{ row }">
              <div class="applicant-info">
                <el-avatar :size="40" :src="row.avatar" class="applicant-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="applicant-details">
                  <div class="applicant-name">{{ row.applicantName }}</div>
                  <div class="applicant-id">{{ maskIdCard(row.idCard) }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="原房间床位" min-width="120">
            <template #default="{ row }">
              <div class="room-info">
                <div class="room-number">{{ row.originalBed.roomNumber }}</div>
                <div class="bed-number">{{ row.originalBed.bedNumber }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="applicationDate" label="申请日期" width="120" />
          <el-table-column prop="changeReason" label="换床原因" min-width="200">
            <template #default="{ row }">
              <el-tooltip :content="row.changeReason" placement="top">
                <div class="reason-text">{{ row.changeReason }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="申请状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.applicationStatus)" size="small">
                {{ getStatusText(row.applicationStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="换后房间床位" min-width="120">
            <template #default="{ row }">
              <div v-if="row.newBed" class="room-info">
                <div class="room-number">{{ row.newBed.roomNumber }}</div>
                <div class="bed-number">{{ row.newBed.bedNumber }}</div>
              </div>
              <div v-else class="text-gray-400">待分配</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleViewDetail(row)"
              >
                查看
              </el-button>
              <el-button
                type="danger"
                link
                :disabled="row.applicationStatus !== 'pending'"
                @click="handleCancelApplication(row)"
              >
                取消申请
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <div class="pagination-info">
            显示 {{ (appliedCurrentPage - 1) * appliedPageSize + 1 }} 到 {{ Math.min(appliedCurrentPage * appliedPageSize, appliedTotal) }} 条，共 {{ appliedTotal }} 条
          </div>
          <el-pagination
            v-model:current-page="appliedCurrentPage"
            v-model:page-size="appliedPageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="appliedTotal"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleAppliedSizeChange"
            @current-change="handleAppliedCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 换床申请弹窗 -->
    <el-dialog
      v-model="changeBedVisible"
      :title="`换床申请 - ${currentApplicant?.name}`"
      width="800px"
      :before-close="handleChangeBedClose"
    >
      <div v-if="currentApplicant" class="change-bed-form">
        <!-- 申请人信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="info-header">
              <el-icon><User /></el-icon>
              <span>申请人信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ currentApplicant.name }}</el-descriptions-item>
            <el-descriptions-item label="当前房间床位">
              {{ currentApplicant.roomInfo.buildingName }} {{ currentApplicant.roomInfo.roomNumber }} - {{ currentApplicant.roomInfo.bedNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="入住日期">{{ currentApplicant.checkinDate }}</el-descriptions-item>
            <el-descriptions-item label="预计离店">{{ currentApplicant.expectedCheckout }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 换床申请信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="info-header">
              <el-icon><House /></el-icon>
              <span>换床申请信息</span>
            </div>
          </template>

          <el-form ref="formRef" :model="changeForm" :rules="formRules" label-width="120px">
            <el-form-item label="期望房间类型" prop="newRoomType">
              <el-select v-model="changeForm.newRoomType" placeholder="请选择房间类型" style="width: 100%">
                <el-option label="常规" value="regular" />
                <el-option label="单人间" value="single" />
                <el-option label="双人间" value="double" />
                <el-option label="四人间" value="quad" />
                <el-option label="多人间" value="dorm" />
              </el-select>
            </el-form-item>

            <el-form-item label="期望床位类型" prop="preferredBedType">
              <el-radio-group v-model="changeForm.preferredBedType">
                <el-radio value="lower">下铺</el-radio>
                <el-radio value="upper">上铺</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="换床原因" prop="changeReason">
              <el-radio-group v-model="changeForm.changeReason" @change="handleReasonChange">
                <el-radio value="health" class="reason-radio">
                  <div class="reason-option">
                    <div class="reason-title">身体原因</div>
                    <div class="reason-desc">上下铺不便、行动困难等身体因素</div>
                  </div>
                </el-radio>
                <el-radio value="relative" class="reason-radio">
                  <div class="reason-option">
                    <div class="reason-title">亲属同行</div>
                    <div class="reason-desc">与同行亲属需要住同一房间</div>
                  </div>
                </el-radio>
                <el-radio value="environment" class="reason-radio">
                  <div class="reason-option">
                    <div class="reason-title">环境因素</div>
                    <div class="reason-desc">噪音、采光等环境不适</div>
                  </div>
                </el-radio>
                <el-radio value="other" class="reason-radio">
                  <div class="reason-option">
                    <div class="reason-title">其他原因</div>
                    <div class="reason-desc">请在下方详细说明</div>
                  </div>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-show="changeForm.changeReason === 'other'" label="详细原因说明" prop="otherReason">
              <el-input
                v-model="changeForm.otherReason"
                type="textarea"
                :rows="3"
                placeholder="请详细说明换床原因"
              />
            </el-form-item>

            <el-form-item label="其他补充说明">
              <el-input
                v-model="changeForm.additionalInfo"
                type="textarea"
                :rows="2"
                placeholder="如有其他需要说明的情况，请在此填写"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="changeBedVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmitApplication">
            提交换床申请
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 申请详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="申请详情"
      width="600px"
    >
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请编号">{{ currentDetail.applicationId }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentDetail.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="原房间床位">
            {{ currentDetail.originalBed.roomNumber }} {{ currentDetail.originalBed.bedNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentDetail.applicationDate }}</el-descriptions-item>
          <el-descriptions-item label="换床原因" :span="2">
            {{ currentDetail.changeReason }}
          </el-descriptions-item>
          <el-descriptions-item label="申请状态">
            <el-tag :type="getStatusTagType(currentDetail.applicationStatus)">
              {{ getStatusText(currentDetail.applicationStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.newBed" label="换后房间床位">
            {{ currentDetail.newBed.roomNumber }} {{ currentDetail.newBed.bedNumber }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, User, RefreshRight, House } from '@element-plus/icons-vue'
// 保留API接口以备将来使用
// import {
//   getAvailableForChange,
//   getAppliedChange,
//   submitBedChangeApplication,
//   cancelBedChangeApplication,
//   getBedChangeDetail
// } from '@/api/bed-change'
import type {
  AvailableForChangeItem,
  AppliedChangeItem,
  BedChangeApplication
} from '@/types/bed-change'

// 页签状态
const activeTab = ref('available')

// 可申请换床相关数据
const availableData = ref<AvailableForChangeItem[]>([])
const availableLoading = ref(false)
const availableTotal = ref(0)
const availableCurrentPage = ref(1)
const availablePageSize = ref(10)
const availableQuery = reactive({
  keyword: '',
  roomType: '',
  currentPage: 1,
  pageSize: 10
})

// 已申请换床相关数据
const appliedData = ref<AppliedChangeItem[]>([])
const appliedLoading = ref(false)
const appliedTotal = ref(0)
const appliedCurrentPage = ref(1)
const appliedPageSize = ref(10)
const appliedQuery = reactive({
  keyword: '',
  currentPage: 1,
  pageSize: 10
})

// 弹窗状态
const changeBedVisible = ref(false)
const detailVisible = ref(false)
const submitting = ref(false)
const currentApplicant = ref<AvailableForChangeItem | null>(null)
const currentDetail = ref<AppliedChangeItem | null>(null)

// 换床申请表单
const formRef = ref()
const changeForm = reactive<BedChangeApplication>({
  applicantId: '',
  applicantName: '',
  currentBed: {
    roomNumber: '',
    bedNumber: '',
    buildingName: ''
  },
  newRoomType: '',
  preferredBedType: 'lower',
  changeReason: 'health',
  otherReason: '',
  additionalInfo: ''
})

// 表单验证规则
const formRules = {
  newRoomType: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  preferredBedType: [{ required: true, message: '请选择床位类型', trigger: 'change' }],
  changeReason: [{ required: true, message: '请选择换床原因', trigger: 'change' }],
  otherReason: [
    { required: true, message: '请详细说明换床原因', trigger: 'blur' },
    { min: 10, message: '换床原因至少需要10个字符', trigger: 'blur' }
  ]
}

// 模拟数据
const mockAvailableData: AvailableForChangeItem[] = [
  {
    id: 'GS20230615001',
    name: '张明远',
    idCard: '110101199001151234',
    avatar: 'https://design.gemcoder.com/staticResource/systemDefaultImages/1200x630.png',
    roomInfo: {
      roomNumber: '302室',
      bedNumber: '上铺 A2床',
      buildingName: '东禅房'
    },
    checkinDate: '2023-07-01',
    expectedCheckout: '2023-07-15',
    status: '已入住'
  },
  {
    id: 'GS20230614002',
    name: '李静怡',
    idCard: '310101198506205678',
    avatar: '/src/assets/avatar/default.png',
    roomInfo: {
      roomNumber: '205室',
      bedNumber: '下铺 B1床',
      buildingName: '西禅房'
    },
    checkinDate: '2023-07-05',
    expectedCheckout: '2023-07-20',
    status: '已入住'
  },
  {
    id: 'GS20230616006',
    name: '陈教授',
    idCard: '440101195006301234',
    avatar: '/src/assets/avatar/default.png',
    roomInfo: {
      roomNumber: '101室',
      bedNumber: '单人间 A1床',
      buildingName: '贵宾楼'
    },
    checkinDate: '2023-07-05',
    expectedCheckout: '2023-07-07',
    status: '已入住'
  }
]

const mockAppliedData: AppliedChangeItem[] = [
  {
    applicationId: 'HC20230702001',
    applicantName: '王智明',
    idCard: '110101197508011234',
    avatar: '/src/assets/avatar/default.png',
    originalBed: {
      roomNumber: '201室',
      bedNumber: '上铺 A1床'
    },
    applicationDate: '2023-07-02',
    changeReason: '膝盖受伤，上下铺不便，申请调换至下铺',
    applicationStatus: 'pending'
  },
  {
    applicationId: 'HC20230701002',
    applicantName: '释永慧',
    idCard: '320101194512311234',
    avatar: 'https://design.gemcoder.com/staticResource/systemDefaultImages/1200x630.png',
    originalBed: {
      roomNumber: '403室',
      bedNumber: '上铺 B3床'
    },
    applicationDate: '2023-07-01',
    changeReason: '年事已高，行动不便，申请调换至一楼房间',
    applicationStatus: 'approved',
    newBed: {
      roomNumber: '102室',
      bedNumber: '下铺 B2床'
    }
  }
]

// 获取可申请换床列表（使用模拟数据）
const fetchAvailableData = async () => {
  try {
    availableLoading.value = true
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    let filteredData = [...mockAvailableData]

    // 关键词筛选
    if (availableQuery.keyword) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(availableQuery.keyword.toLowerCase()) ||
        item.roomInfo.roomNumber.toLowerCase().includes(availableQuery.keyword.toLowerCase())
      )
    }

    // 房型筛选
    if (availableQuery.roomType) {
      // 这里可以添加房型筛选逻辑
    }

    // 分页
    const startIndex = (availableCurrentPage.value - 1) * availablePageSize.value
    const endIndex = startIndex + availablePageSize.value
    availableData.value = filteredData.slice(startIndex, endIndex)
    availableTotal.value = filteredData.length
  } catch (error) {
    console.error('获取可申请换床列表失败:', error)
    ElMessage.error('获取可申请换床列表失败')
  } finally {
    availableLoading.value = false
  }
}

// 获取已申请换床列表（使用模拟数据）
const fetchAppliedData = async () => {
  try {
    appliedLoading.value = true
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    let filteredData = [...mockAppliedData]

    // 关键词筛选
    if (appliedQuery.keyword) {
      filteredData = filteredData.filter(item =>
        item.applicantName.toLowerCase().includes(appliedQuery.keyword.toLowerCase()) ||
        item.applicationId.toLowerCase().includes(appliedQuery.keyword.toLowerCase())
      )
    }

    // 分页
    const startIndex = (appliedCurrentPage.value - 1) * appliedPageSize.value
    const endIndex = startIndex + appliedPageSize.value
    appliedData.value = filteredData.slice(startIndex, endIndex)
    appliedTotal.value = filteredData.length
  } catch (error) {
    console.error('获取已申请换床列表失败:', error)
    ElMessage.error('获取已申请换床列表失败')
  } finally {
    appliedLoading.value = false
  }
}

// 页签切换
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  if (tabName === 'available') {
    fetchAvailableData()
  } else {
    fetchAppliedData()
  }
}

// 可申请换床搜索
const handleAvailableSearch = () => {
  availableCurrentPage.value = 1
  fetchAvailableData()
}

// 已申请换床搜索
const handleAppliedSearch = () => {
  appliedCurrentPage.value = 1
  fetchAppliedData()
}

// 分页处理
const handleAvailableSizeChange = (val: number) => {
  availablePageSize.value = val
  availableCurrentPage.value = 1
  fetchAvailableData()
}

const handleAvailableCurrentChange = (val: number) => {
  availableCurrentPage.value = val
  fetchAvailableData()
}

const handleAppliedSizeChange = (val: number) => {
  appliedPageSize.value = val
  appliedCurrentPage.value = 1
  fetchAppliedData()
}

const handleAppliedCurrentChange = (val: number) => {
  appliedCurrentPage.value = val
  fetchAppliedData()
}

// 申请换床
const handleApplyChange = (row: AvailableForChangeItem) => {
  currentApplicant.value = row

  // 设置表单数据
  changeForm.applicantId = row.id
  changeForm.applicantName = row.name
  changeForm.currentBed = row.roomInfo
  changeForm.newRoomType = ''
  changeForm.preferredBedType = 'lower'
  changeForm.changeReason = 'health'
  changeForm.otherReason = ''
  changeForm.additionalInfo = ''

  changeBedVisible.value = true
}

// 换床原因变化
const handleReasonChange = (value: string) => {
  if (value !== 'other') {
    changeForm.otherReason = ''
  }
}

// 提交换床申请
const handleSubmitApplication = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 这里会调用真实的API
    // await submitBedChangeApplication(changeForm)

    ElMessage.success('换床申请已提交，请等待审核')
    changeBedVisible.value = false

    // 刷新列表
    fetchAvailableData()
    fetchAppliedData()
  } catch (error) {
    if (error === false) {
      // 表单验证失败
      return
    }
    console.error('提交换床申请失败:', error)
    ElMessage.error('提交换床申请失败')
  } finally {
    submitting.value = false
  }
}

// 查看详情
const handleViewDetail = async (row: AppliedChangeItem) => {
  currentDetail.value = row
  detailVisible.value = true
}

// 取消申请
const handleCancelApplication = async (row: AppliedChangeItem) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该换床申请吗？',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟取消延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 这里会调用真实的API
    // await cancelBedChangeApplication(row.applicationId)

    ElMessage.success('换床申请已取消')
    fetchAppliedData()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('取消换床申请失败:', error)
    ElMessage.error('取消换床申请失败')
  }
}

// 关闭换床弹窗
const handleChangeBedClose = () => {
  changeBedVisible.value = false
  currentApplicant.value = null
  formRef.value?.resetFields()
}

// 工具函数
const maskIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.slice(0, 3) + '********' + idCard.slice(-4)
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已批准'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知'
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchAvailableData()
})
</script>

<style scoped lang="scss">
.bed-change-application {
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
      line-height: 1.6;
    }
  }

  .tab-card {
    margin-bottom: 20px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    .tab-label {
      font-weight: 500;
    }
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #8B5A2B;
        margin: 0;
      }

      .card-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
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

    .room-info {
      .room-number {
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
      }

      .bed-number {
        font-size: 12px;
        color: #666;
      }
    }

    .reason-text {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

  .change-bed-form {
    .info-card {
      margin-bottom: 20px;

      .info-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
    }

    .form-card {
      .info-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      :deep(.el-form-item) {
        margin-bottom: 24px;
      }

      .reason-radio {
        width: 100%;
        margin-bottom: 16px;
        padding: 12px;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          border-color: #8B5A2B;
        }

        &.is-checked {
          border-color: #8B5A2B;
          background-color: #f8f6f3;
        }

        .reason-option {
          margin-left: 24px;

          .reason-title {
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
          }

          .reason-desc {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>