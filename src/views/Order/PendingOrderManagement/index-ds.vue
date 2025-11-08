<template>
  <div class="pending-order-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">挂单管理</h1>
      <p class="page-description">对接人申请界面 - 管理和处理挂单申请</p>
    </div>

    <!-- 申请挂单按钮 -->
    <div class="action-bar">
      <el-button
        type="primary"
        size="large"
        @click="handleNewApplication"
        class="apply-btn"
      >
        <el-icon><Plus /></el-icon>
        申请挂单
      </el-button>

      <!-- 显示模式切换 -->
      <div class="view-mode-switch">
        <el-segmented
          v-model="viewMode"
          :options="viewModeOptions"
          size="large"
          @change="handleViewModeChange"
        />
      </div>
    </div>

    <!-- 状态筛选标签 -->
    <div class="status-filter">
      <el-radio-group
        v-model="currentStatus"
        @change="handleStatusChange"
        class="status-tabs"
      >
        <el-radio-button label="all">全部状态</el-radio-button>
        <el-radio-button label="applying">申请中</el-radio-button>
        <el-radio-button label="pending">待入住</el-radio-button>
        <el-radio-button label="staying">入住中</el-radio-button>
        <el-radio-button label="checked-out">已退住</el-radio-button>
        <el-radio-button label="rejected">未通过</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 卡片列表显示模式 -->
    <div v-if="viewMode === 'card'" v-loading="loading" class="card-list">
      <div
        v-for="record in tableData"
        :key="record.id"
        class="order-card"
      >
        <div class="card-header">
          <div class="applicant-info">
            <div class="avatar">
              <el-avatar :size="50" :src="getAvatarUrl(record)">
                {{ getInitialName(record) }}
              </el-avatar>
            </div>
            <div class="person-details">
              <h3 class="person-name">{{ getPersonName(record) }}</h3>
              <div class="person-meta">
                <span class="gender">{{ getGenderText(record) }}</span>
                <span class="phone">{{ getPersonPhone(record) }}</span>
              </div>
            </div>
          </div>
          <div class="status-section">
            <el-tag
              :type="getStatusTagType(record)"
              size="large"
              class="status-tag"
            >
              {{ getStatusText(record) }}
            </el-tag>
          </div>
        </div>

        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">申请日期</span>
              <span class="value">{{ record.checkinDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">入住日期</span>
              <span class="value">{{ record.checkinDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">退住日期</span>
              <span class="value">{{ record.checkoutDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">分配床位</span>
              <span class="value">{{ getAssignedBed(record) }}</span>
            </div>
          </div>

          <div v-if="record.specialRequest" class="special-request">
            <span class="label">特殊要求：</span>
            <span class="value">{{ record.specialRequest }}</span>
          </div>

          <div class="recommender-info">
            <span class="label">推荐人：</span>
            <span class="value">{{ record.recommenderName }} ({{ record.recommenderRelation }})</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="apply-time">
            申请时间：{{ record.createdAt || '-' }}
          </div>
          <div class="action-buttons">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(record)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="canEdit(record)"
              type="default"
              size="small"
              @click="handleEditInfo(record)"
            >
              修改信息
            </el-button>
            <el-button
              v-if="canApprove(record)"
              type="success"
              size="small"
              @click="handleApprove(record)"
            >
              通过
            </el-button>
            <el-button
              v-if="canReject(record)"
              type="danger"
              size="small"
              @click="handleReject(record)"
            >
              拒绝
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <el-empty description="暂无挂单申请数据" />
      </div>
    </div>

    <!-- 表格显示模式 -->
    <div v-if="viewMode === 'table'" v-loading="loading" class="table-container">
      <el-table
        :data="tableData"
        style="width: 100%"
        stripe
        border
        :header-cell-style="{ background: '#f8fafc', color: '#374151', fontWeight: '600' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <!-- 申请人信息 -->
        <el-table-column label="申请人信息" min-width="200">
          <template #default="{ row }">
            <div class="applicant-cell">
              <el-avatar :size="32" :src="getAvatarUrl(row)" class="applicant-avatar">
                {{ getInitialName(row) }}
              </el-avatar>
              <div class="applicant-details">
                <div class="name">{{ getPersonName(row) }}</div>
                <div class="meta">
                  <span class="gender">{{ getGenderText(row) }}</span>
                  <span class="phone">{{ getPersonPhone(row) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 申请日期 -->
        <el-table-column prop="checkinDate" label="申请日期" width="120" align="center" />

        <!-- 入住日期 -->
        <el-table-column prop="checkinDate" label="入住日期" width="120" align="center" />

        <!-- 退住日期 -->
        <el-table-column prop="checkoutDate" label="退住日期" width="120" align="center" />

        <!-- 分配床位 -->
        <el-table-column label="分配床位" width="120" align="center">
          <template #default="{ row }">
            {{ getAssignedBed(row) }}
          </template>
        </el-table-column>

        <!-- 特殊要求 -->
        <el-table-column label="特殊要求" width="150" align="center">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.specialRequest"
              :content="row.specialRequest"
              placement="top"
              :show-after="500"
            >
              <div class="special-request-cell">
                {{ row.specialRequest.length > 10 ? row.specialRequest.substring(0, 10) + '...' : row.specialRequest }}
              </div>
            </el-tooltip>
            <span v-else class="text-muted">无</span>
          </template>
        </el-table-column>

        <!-- 推荐人 -->
        <el-table-column label="推荐人" width="120" align="center">
          <template #default="{ row }">
            <div class="recommender-cell">
              <div class="name">{{ row.recommenderName }}</div>
              <div class="relation">{{ row.recommenderRelation }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row)"
              size="small"
              class="status-tag"
            >
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 申请时间 -->
        <el-table-column label="申请时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.createdAt || '-' }}
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleViewDetail(row)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="canEdit(row)"
                type="default"
                size="small"
                link
                @click="handleEditInfo(row)"
              >
                修改信息
              </el-button>
              <el-button
                v-if="canApprove(row)"
                type="success"
                size="small"
                link
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                v-if="canReject(row)"
                type="danger"
                size="small"
                link
                @click="handleReject(row)"
              >
                拒绝
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 表格空状态 -->
      <div v-if="!loading && tableData.length === 0" class="table-empty">
        <el-empty description="暂无挂单申请数据" />
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="tableData.length > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[6, 12, 24, 48]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="申请详情"
      width="80%"
      :before-close="handleCloseDetail"
    >
      <div v-if="currentRecord" class="detail-content">
        <!-- 申请人信息 -->
        <el-descriptions title="申请人信息" :column="2" border>
          <el-descriptions-item label="姓名">
            {{ personSnapshot.name }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ personSnapshot.gender === 1 ? '男' : '女' }}
          </el-descriptions-item>
          <el-descriptions-item label="身份证号">
            {{ personSnapshot.idCard }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ personSnapshot.mobile }}
          </el-descriptions-item>
          <el-descriptions-item label="民族">
            {{ personSnapshot.ethnic }}
          </el-descriptions-item>
          <el-descriptions-item label="学历">
            {{ personSnapshot.education }}
          </el-descriptions-item>
          <el-descriptions-item label="职业">
            {{ personSnapshot.occupation }}
          </el-descriptions-item>
          <el-descriptions-item label="专业">
            {{ personSnapshot.major }}
          </el-descriptions-item>
          <el-descriptions-item label="毕业院校">
            {{ personSnapshot.school }}
          </el-descriptions-item>
          <el-descriptions-item label="技能">
            {{ personSnapshot.skills }}
          </el-descriptions-item>
          <el-descriptions-item label="婚姻状况">
            {{ personSnapshot.marital }}
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">
            {{ personSnapshot.province }} {{ personSnapshot.city }} {{ personSnapshot.address }}
          </el-descriptions-item>
          <el-descriptions-item label="微信号">
            {{ personSnapshot.weChat }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 申请信息 -->
        <el-descriptions title="申请信息" :column="2" border class="mt-4">
          <el-descriptions-item label="入住日期">
            {{ currentRecord.checkinDate }}
          </el-descriptions-item>
          <el-descriptions-item label="退房日期">
            {{ currentRecord.checkoutDate }}
          </el-descriptions-item>
          <el-descriptions-item label="特殊要求" :span="2">
            {{ currentRecord.specialRequest || '无' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 推荐人信息 -->
        <el-descriptions title="推荐人信息" :column="2" border class="mt-4">
          <el-descriptions-item label="推荐人姓名">
            {{ currentRecord.recommenderName }}
          </el-descriptions-item>
          <el-descriptions-item label="推荐人电话">
            {{ currentRecord.recommenderPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="关系">
            {{ currentRecord.recommenderRelation }}
          </el-descriptions-item>
          <el-descriptions-item label="推荐评价" :span="2">
            {{ currentRecord.recommenderComment }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 修行信息 -->
        <el-descriptions title="修行信息" :column="2" border class="mt-4">
          <el-descriptions-item label="到访记录">
            {{ practiceSnapshot.visitRecords }}
          </el-descriptions-item>
          <el-descriptions-item label="皈依日期">
            {{ practiceSnapshot.refugeTakenDate }}
          </el-descriptions-item>
          <el-descriptions-item label="修行年限">
            {{ practiceSnapshot.yearsOfPractice }}年
          </el-descriptions-item>
          <el-descriptions-item label="是否受戒">
            {{ practiceSnapshot.hasTakenPrecepts ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="过往修行" :span="2">
            {{ practiceSnapshot.pastPracticeExperience }}
          </el-descriptions-item>
          <el-descriptions-item label="当前修行" :span="2">
            {{ practiceSnapshot.currentPracticeExperience }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 紧急联系人 -->
        <el-descriptions title="紧急联系人" :column="2" border class="mt-4">
          <el-descriptions-item
            v-for="(contact, index) in personSnapshot.emergencyContacts"
            :key="index"
            :label="`联系人${index + 1}`"
          >
            {{ contact.contactName }} - {{ contact.contactPhone }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button
            v-if="currentRecord && currentRecord.reviewStatus === 10"
            type="success"
            @click="handleApprove(currentRecord)"
          >
            通过申请
          </el-button>
          <el-button
            v-if="currentRecord && currentRecord.reviewStatus === 10"
            type="danger"
            @click="handleReject(currentRecord)"
          >
            拒绝申请
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 显示模式
const viewMode = ref('card')
const viewModeOptions = [
  { label: '卡片视图', value: 'card' },
  { label: '表格视图', value: 'table' }
]

// 类型定义
interface PendingOrderRecord {
  id: number
  personId: number
  applicationType: number
  checkinDate: string
  checkoutDate: string
  specialRequest: string
  recommenderName: string
  recommenderPhone: string
  recommenderRelation: string
  recommenderComment: string
  status: number
  reviewStatus: number
  createdAt?: string
  updatedAt?: string
  personSnapshot: string
  practiceSnapshot: string
  assignedRoom?: string
  assignedBed?: string
}

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const currentRecord = ref<PendingOrderRecord | null>(null)
const currentStatus = ref('all')

// 分页数据
const pagination = reactive({
  current: 1,
  size: 12,
  total: 0
})

// 表格数据
const tableData = ref<PendingOrderRecord[]>([])

// 解析 personSnapshot
const personSnapshot = computed(() => {
  if (!currentRecord.value?.personSnapshot) return {}
  return JSON.parse(currentRecord.value.personSnapshot)
})

// 解析 practiceSnapshot
const practiceSnapshot = computed(() => {
  if (!currentRecord.value?.practiceSnapshot) return {}
  return JSON.parse(currentRecord.value.practiceSnapshot)
})

// 模拟数据
const mockData: PendingOrderRecord[] = [
  {
    id: 2,
    personId: 1,
    applicationType: 0,
    checkinDate: "2025-11-01",
    checkoutDate: "2025-11-07",
    specialRequest: "需要安静的房间，便于打坐修行",
    recommenderName: "王法师",
    recommenderPhone: "13548789658",
    recommenderRelation: "师父",
    recommenderComment: "该弟子诚心向佛，品行端正，推荐挂单",
    status: 10,
    reviewStatus: 10,
    createdAt: "2025-11-02 10:30:00",
    assignedRoom: "101",
    assignedBed: "1号床",
    personSnapshot: "{\"city\": \"北京\", \"name\": \"乔明\", \"major\": \"计算机\", \"ethnic\": \"汉\", \"gender\": 1, \"idCard\": \"211003198145784586\", \"mobile\": \"15910520755\", \"school\": \"沈阳建筑大学\", \"skills\": \"编程、摄影、英语流利\", \"weChat\": \"joe_relax\", \"address\": \"海淀区中关村大街123号\", \"marital\": \"未婚\", \"photoUrl\": \"string\", \"province\": \"北京\", \"education\": \"本科\", \"occupation\": \"软件工程师\", \"diseaseHistory\": \"无重大疾病史\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"乔父\", \"contactPhone\": \"13548578965\"}, {\"sortNo\": 1, \"contactName\": \"乔母\", \"contactPhone\": \"17848578965\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无长期服药史\"}",
    practiceSnapshot: "{\"visitRecords\": \"三次\", \"refugeTakenDate\": \"2021-06-15\", \"yearsOfPractice\": 3, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"参加禅修营\", \"currentPracticeExperience\": \"每日诵经打坐\"}"
  },
  {
    id: 3,
    personId: 2,
    applicationType: 0,
    checkinDate: "2025-11-05",
    checkoutDate: "2025-11-10",
    specialRequest: "希望参加早晚课",
    recommenderName: "李居士",
    recommenderPhone: "13548789659",
    recommenderRelation: "师兄",
    recommenderComment: "学佛多年，诚心修行",
    status: 20,
    reviewStatus: 20,
    createdAt: "2025-11-02 11:20:00",
    assignedRoom: "205",
    assignedBed: "2号床",
    personSnapshot: "{\"city\": \"北京\", \"name\": \"李美华\", \"major\": \"文学\", \"ethnic\": \"汉\", \"gender\": 2, \"idCard\": \"211003199545784586\", \"mobile\": \"15910520756\", \"school\": \"北京大学\", \"skills\": \"写作、茶道、古琴\", \"weChat\": \"li_writer\", \"address\": \"朝阳区建国门外大街456号\", \"marital\": \"未婚\", \"photoUrl\": \"string\", \"province\": \"北京\", \"education\": \"硕士\", \"occupation\": \"编辑\", \"diseaseHistory\": \"轻度过敏性鼻炎\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"李父\", \"contactPhone\": \"13548578966\"}, {\"sortNo\": 1, \"contactName\": \"李母\", \"contactPhone\": \"17848578966\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"季节性服用抗过敏药物\"}",
    practiceSnapshot: "{\"visitRecords\": \"五次\", \"refugeTakenDate\": \"2018-09-20\", \"yearsOfPractice\": 5, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"参加佛学讲座\", \"currentPracticeExperience\": \"学习净土法门\"}"
  },
  {
    id: 4,
    personId: 3,
    applicationType: 0,
    checkinDate: "2025-10-28",
    checkoutDate: "2025-11-02",
    specialRequest: "无特殊要求",
    recommenderName: "陈法师",
    recommenderPhone: "13548789660",
    recommenderRelation: "师父",
    recommenderComment: "皈依弟子，修持精进",
    status: 30,
    reviewStatus: 30,
    createdAt: "2025-10-27 14:15:00",
    assignedRoom: "308",
    assignedBed: "1号床",
    personSnapshot: "{\"city\": \"上海\", \"name\": \"张德华\", \"major\": \"佛学\", \"ethnic\": \"汉\", \"gender\": 1, \"idCard\": \"310003198245784586\", \"mobile\": \"15910520757\", \"school\": \"复旦大学\", \"skills\": \"梵文、佛法研究\", \"weChat\": \"zhang_buddhist\", \"address\": \"黄浦区人民大道200号\", \"marital\": \"已婚\", \"photoUrl\": \"string\", \"province\": \"上海\", \"education\": \"博士\", \"occupation\": \"佛学研究员\", \"diseaseHistory\": \"无\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"妻子\", \"contactPhone\": \"13548578967\"}, {\"sortNo\": 1, \"contactName\": \"父亲\", \"contactPhone\": \"17848578967\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无\"}",
    practiceSnapshot: "{\"visitRecords\": \"十次\", \"refugeTakenDate\": \"2015-03-20\", \"yearsOfPractice\": 8, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"学习藏传佛教\", \"currentPracticeExperience\": \"研究佛经理论\"}"
  },
  {
    id: 5,
    personId: 4,
    applicationType: 0,
    checkinDate: "2025-11-08",
    checkoutDate: "2025-11-15",
    specialRequest: "希望能够参加寺院义工活动",
    recommenderName: "赵居士",
    recommenderPhone: "13548789661",
    recommenderRelation: "师兄",
    recommenderComment: "热心佛法，乐于助人",
    status: 10,
    reviewStatus: 10,
    createdAt: "2025-11-03 09:20:00",
    personSnapshot: "{\"city\": \"广州\", \"name\": \"王小芳\", \"major\": \"艺术设计\", \"ethnic\": \"汉\", \"gender\": 2, \"idCard\": \"440101199245784586\", \"mobile\": \"15910520758\", \"school\": \"广州美术学院\", \"skills\": \"绘画、书法、园艺\", \"weChat\": \"wang_artist\", \"address\": \"天河区珠江新城789号\", \"marital\": \"未婚\", \"photoUrl\": \"string\", \"province\": \"广东\", \"education\": \"本科\", \"occupation\": \"设计师\", \"diseaseHistory\": \"无\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"王父\", \"contactPhone\": \"13548578968\"}, {\"sortNo\": 1, \"contactName\": \"王母\", \"contactPhone\": \"17848578968\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无\"}",
    practiceSnapshot: "{\"visitRecords\": \"两次\", \"refugeTakenDate\": \"2022-08-18\", \"yearsOfPractice\": 2, \"hasTakenPrecepts\": false, \"pastPracticeExperience\": \"参加佛教艺术展\", \"currentPracticeExperience\": \"学习佛教艺术\"}"
  },
  {
    id: 6,
    personId: 5,
    applicationType: 0,
    checkinDate: "2025-10-25",
    checkoutDate: "2025-10-30",
    specialRequest: "需要素食，对葱蒜过敏",
    recommenderName: "刘法师",
    recommenderPhone: "13548789662",
    recommenderRelation: "师父",
    recommenderComment: "老实修行，遵守规矩",
    status: 20,
    reviewStatus: 20,
    createdAt: "2025-10-24 16:45:00",
    assignedRoom: "102",
    assignedBed: "3号床",
    personSnapshot: "{\"city\": \"成都\", \"name\": \"刘建国\", \"major\": \"中医\", \"ethnic\": \"汉\", \"gender\": 1, \"idCard\": \"510101198045784586\", \"mobile\": \"15910520759\", \"school\": \"成都中医药大学\", \"skills\": \"中医推拿、养生保健\", \"weChat\": \"liu_doctor\", \"address\": \"武侯区锦里古街321号\", \"marital\": \"已婚\", \"photoUrl\": \"string\", \"province\": \"四川\", \"education\": \"本科\", \"occupation\": \"中医师\", \"diseaseHistory\": \"无\", \"emergencyContacts\": [{\"sortNo\": 0, \"contactName\": \"妻子\", \"contactPhone\": \"13548578969\"}, {\"sortNo\": 1, \"contactName\": \"儿子\", \"contactPhone\": \"17848578969\"}], \"infectiousHistory\": \"无\", \"medicationHistory\": \"无\"}",
    practiceSnapshot: "{\"visitRecords\": \"八次\", \"refugeTakenDate\": \"2018-12-25\", \"yearsOfPractice\": 6, \"hasTakenPrecepts\": true, \"pastPracticeExperience\": \"学习中医养生结合佛法\", \"currentPracticeExperience\": \"修持药师佛法门\"}"
  }
]

// 工具函数：获取申请人信息
const getPersonName = (record: PendingOrderRecord): string => {
  try {
    const personData = JSON.parse(record.personSnapshot)
    return personData.name || '未知'
  } catch {
    return '解析失败'
  }
}

const getGenderText = (record: PendingOrderRecord): string => {
  try {
    const personData = JSON.parse(record.personSnapshot)
    return personData.gender === 1 ? '男' : '女'
  } catch {
    return '未知'
  }
}

const getPersonPhone = (record: PendingOrderRecord): string => {
  try {
    const personData = JSON.parse(record.personSnapshot)
    return personData.mobile || ''
  } catch {
    return ''
  }
}

const getInitialName = (record: PendingOrderRecord): string => {
  const name = getPersonName(record)
  return name.charAt(0)
}

const getAvatarUrl = (record: PendingOrderRecord): string => {
  try {
    const personData = JSON.parse(record.personSnapshot)
    return personData.photoUrl || ''
  } catch {
    return ''
  }
}

const getAssignedBed = (record: PendingOrderRecord): string => {
  if (record.assignedRoom && record.assignedBed) {
    return `${record.assignedRoom}室 ${record.assignedBed}`
  }
  return '未分配'
}

// 状态相关方法
const getStatusTagType = (record: PendingOrderRecord): string => {
  // 10: 申请中/待审核, 20: 待入住/入住中, 30: 已退住/未通过
  if (record.reviewStatus === 10) {
    return 'warning' // 申请中
  } else if (record.reviewStatus === 20 && record.status === 20) {
    return 'success' // 待入住/入住中
  } else if (record.reviewStatus === 30 || record.status === 30) {
    return 'danger' // 未通过
  }
  return 'info'
}

const getStatusText = (record: PendingOrderRecord): string => {
  if (record.reviewStatus === 10) {
    return '申请中'
  } else if (record.reviewStatus === 20 && record.status === 20) {
    return '待入住'
  } else if (record.reviewStatus === 30) {
    return '未通过'
  }
  return '未知'
}

// 权限判断
const canEdit = (record: PendingOrderRecord): boolean => {
  return record.reviewStatus === 10 // 申请中可以编辑
}

const canApprove = (record: PendingOrderRecord): boolean => {
  return record.reviewStatus === 10 // 申请中可以通过
}

const canReject = (record: PendingOrderRecord): boolean => {
  return record.reviewStatus === 10 // 申请中可以拒绝
}

// 数据加载方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 根据状态筛选数据
    let filteredData = [...mockData]

    switch (currentStatus.value) {
      case 'applying':
        filteredData = filteredData.filter(item => item.reviewStatus === 10)
        break
      case 'pending':
        filteredData = filteredData.filter(item => item.reviewStatus === 20 && item.status === 20)
        break
      case 'staying':
        filteredData = filteredData.filter(item =>
          item.reviewStatus === 20 && item.status === 20 &&
          new Date(item.checkinDate) <= new Date() && new Date(item.checkoutDate) >= new Date()
        )
        break
      case 'checked-out':
        filteredData = filteredData.filter(item =>
          item.reviewStatus === 20 && new Date(item.checkoutDate) < new Date()
        )
        break
      case 'rejected':
        filteredData = filteredData.filter(item => item.reviewStatus === 30 || item.status === 30)
        break
      // 'all' 不筛选
    }

    pagination.total = filteredData.length

    // 分页
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    tableData.value = filteredData.slice(start, end)

  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 事件处理方法
const handleViewModeChange = () => {
  // 保存用户偏好到localStorage
  localStorage.setItem('pending-order-view-mode', viewMode.value)
}

const handleStatusChange = () => {
  pagination.current = 1
  loadData()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  loadData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadData()
}

const handleViewDetail = (record: PendingOrderRecord) => {
  currentRecord.value = record
  detailVisible.value = true
}

const handleCloseDetail = () => {
  detailVisible.value = false
  currentRecord.value = null
}

const handleNewApplication = () => {
  // 跳转到挂单申请页面
  router.push('/contact-application/pending-application')
}

const handleEditInfo = (record: PendingOrderRecord) => {
  ElMessage.info('跳转到编辑页面功能待实现')
  // router.push(`/contact-application/edit/${record.id}`)
}

const handleApprove = async (record: PendingOrderRecord) => {
  try {
    await ElMessageBox.confirm(
      '确定要通过这个申请吗？',
      '确认通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    record.reviewStatus = 20
    record.status = 20

    ElMessage.success('申请已通过')
    detailVisible.value = false
    loadData()
  } catch {
    // 用户取消操作
  }
}

const handleReject = async (record: PendingOrderRecord) => {
  try {
    await ElMessageBox.confirm(
      '确定要拒绝这个申请吗？',
      '确认拒绝',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    record.reviewStatus = 30
    record.status = 30

    ElMessage.success('申请已拒绝')
    detailVisible.value = false
    loadData()
  } catch {
    // 用户取消操作
  }
}

// 生命周期
onMounted(() => {
  // 从localStorage读取用户显示模式偏好
  const savedViewMode = localStorage.getItem('pending-order-view-mode')
  if (savedViewMode && (savedViewMode === 'card' || savedViewMode === 'table')) {
    viewMode.value = savedViewMode
  }

  loadData()
})
</script>

<style scoped lang="scss">
.pending-order-management {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .page-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .apply-btn {
    font-size: 16px;
    padding: 12px 24px;
    border-radius: 8px;

    .el-icon {
      margin-right: 8px;
    }
  }

  .view-mode-switch {
    flex-shrink: 0;
  }
}

.status-filter {
  margin-bottom: 24px;

  .status-tabs {
    .el-radio-button {
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }

    :deep(.el-radio-button__inner) {
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 6px;
      border: 1px solid #dcdfe6;
      background: #fff;
      color: #606266;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      background: #409eff;
      border-color: #409eff;
      color: #fff;
      box-shadow: 0 0 0 1px #409eff;
    }
  }
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  .order-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;

    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #f0f0f0;
      background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);

      .applicant-info {
        display: flex;
        align-items: center;
        flex: 1;

        .avatar {
          margin-right: 12px;

          .el-avatar {
            border: 2px solid #e5e7eb;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            font-weight: 600;
            font-size: 18px;
          }
        }

        .person-details {
          .person-name {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 4px 0;
          }

          .person-meta {
            display: flex;
            gap: 12px;
            font-size: 13px;
            color: #6b7280;

            .gender {
              display: flex;
              align-items: center;

              &::before {
                content: '•';
                margin-right: 4px;
                color: #9ca3af;
              }
            }

            .phone {
              display: flex;
              align-items: center;
            }
          }
        }
      }

      .status-section {
        .status-tag {
          font-size: 13px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 20px;
          border: none;
        }
      }
    }

    .card-content {
      padding: 20px;

      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;

        .info-item {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
            font-weight: 500;
          }

          .value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 600;
          }
        }
      }

      .special-request {
        margin-bottom: 12px;
        padding: 12px;
        background: #f8fafc;
        border-radius: 6px;
        border-left: 3px solid #fbbf24;

        .label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          font-size: 13px;
          color: #374151;
          margin-left: 4px;
        }
      }

      .recommender-info {
        font-size: 13px;
        color: #6b7280;

        .label {
          font-weight: 500;
        }

        .value {
          color: #374151;
          margin-left: 4px;
        }
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: #fafbfc;
      border-top: 1px solid #f0f0f0;

      .apply-time {
        font-size: 12px;
        color: #9ca3af;
      }

      .action-buttons {
        display: flex;
        gap: 8px;

        .el-button {
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 6px;
        }
      }
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;

  .mt-4 {
    margin-top: 24px;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .card-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .pending-order-management {
    padding: 16px;
  }

  .action-bar {
    text-align: center;

    .apply-btn {
      width: 100%;
      max-width: 300px;
    }
  }

  .status-filter {
    .status-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .el-radio-button {
        flex: 1;
        min-width: calc(50% - 4px);
        margin-right: 0;

        :deep(.el-radio-button__inner) {
          width: 100%;
          text-align: center;
        }
      }
    }
  }

  .card-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .order-card {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .applicant-info {
        width: 100%;
      }

      .status-section {
        width: 100%;
        text-align: right;
      }
    }

    .card-content {
      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    .card-footer {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .action-buttons {
        justify-content: center;
      }
    }
  }
}

// 表格样式
.table-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ebeef5;

  :deep(.el-table) {
    --el-table-border-color: #e5e7eb;
    --el-table-header-bg-color: #f8fafc;
    --el-table-row-hover-bg-color: #f1f5f9;
    border-radius: 8px;
    overflow: hidden;

    .el-table__header-wrapper {
      .el-table__header {
        th {
          background: var(--el-table-header-bg-color);
          color: #374151;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }
      }
    }

    .el-table__body-wrapper {
      .el-table__body {
        tr {
          transition: all 0.2s ease;

          &:hover {
            background: var(--el-table-row-hover-bg-color);
          }
        }
      }
    }
  }

  .applicant-cell {
    display: flex;
    align-items: center;
    gap: 12px;

    .applicant-avatar {
      border: 2px solid #e5e7eb;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-weight: 600;
    }

    .applicant-details {
      flex: 1;

      .name {
        font-weight: 600;
        color: #1f2937;
        font-size: 14px;
        margin-bottom: 2px;
      }

      .meta {
        display: flex;
        gap: 8px;
        font-size: 12px;
        color: #6b7280;

        .gender {
          &::before {
            content: '•';
            margin-right: 4px;
            color: #9ca3af;
          }
        }
      }
    }
  }

  .special-request-cell {
    font-size: 13px;
    color: #374151;
    cursor: help;
    padding: 2px 6px;
    background: #fef3c7;
    border-radius: 4px;
    border: 1px solid #fbbf24;
  }

  .recommender-cell {
    .name {
      font-weight: 600;
      color: #1f2937;
      font-size: 13px;
      margin-bottom: 2px;
    }

    .relation {
      font-size: 11px;
      color: #6b7280;
    }
  }

  .status-tag {
    font-weight: 500;
  }

  .table-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;

    .el-button {
      padding: 4px 8px;
      font-size: 12px;
      border-radius: 4px;
    }
  }

  .text-muted {
    color: #9ca3af;
    font-style: italic;
  }
}

.table-empty {
  text-align: center;
  padding: 60px 20px;
}

// 响应式设计
@media (max-width: 1200px) {
  .card-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .pending-order-management {
    padding: 16px;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    .apply-btn {
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }

    .view-mode-switch {
      align-self: center;
    }
  }

  .status-filter {
    .status-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .el-radio-button {
        flex: 1;
        min-width: calc(50% - 4px);
        margin-right: 0;

        :deep(.el-radio-button__inner) {
          width: 100%;
          text-align: center;
        }
      }
    }
  }

  .card-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .order-card {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .applicant-info {
        width: 100%;
      }

      .status-section {
        width: 100%;
        text-align: right;
      }
    }

    .card-content {
      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    .card-footer {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .action-buttons {
        justify-content: center;
      }
    }
  }

  .table-container {
    padding: 12px;
    overflow-x: auto;

    :deep(.el-table) {
      min-width: 800px;

      .table-actions {
        flex-direction: column;
        gap: 4px;

        .el-button {
          font-size: 11px;
          padding: 2px 6px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .status-filter {
    .status-tabs {
      .el-radio-button {
        min-width: 100%;
        margin-bottom: 8px;
      }
    }
  }
}
</style>