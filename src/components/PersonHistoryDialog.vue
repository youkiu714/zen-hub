<template>
  <el-dialog
    v-model="visible"
    :title="currentPerson ? `${currentPerson.name} 的历史记录` : '历史记录'"
    width="1000px"
    :before-close="handleClose"
    class="steve-jobs-dialog"
  >
    <div v-if="currentPerson" class="history-content">
      <div class="history-header">
        <p>总挂单次数: **{{ currentPerson.totalCount }}**</p>
      </div>

      <el-table
        :data="historyData"
        style="width: 100%; margin-top: 20px"
        :loading="loading"
        max-height="400"
        :border="false"
        class="steve-jobs-table"
      >
        <el-table-column prop="applicationId" label="申请ID" width="100" />

        <el-table-column prop="recordTypeName" label="挂单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getRecordTypeTagType(row.recordType)" size="small" effect="light">
              {{ row.recordTypeName || '--' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="checkinDate" label="入住日期" width="120" />

        <el-table-column prop="checkoutDate" label="退住日期" width="120">
          <template #default="{ row }">
            {{ row.checkoutDate || '--' }}
          </template>
        </el-table-column>

        <el-table-column prop="stayDays" label="挂单天数" width="100">
          <template #default="{ row }">
            {{ row.stayDays || '--' }}
          </template>
        </el-table-column>

        <el-table-column prop="departmentName" label="部组" width="120">
          <template #default="{ row }">
            {{ row.departmentName || row.departmentCode || '--' }}
          </template>
        </el-table-column>

        <el-table-column prop="mobileMasked" label="手机号" width="130">
          <template #default="{ row }">
            {{ row.mobileMasked || '--' }}
          </template>
        </el-table-column>

        <el-table-column prop="overallGradeName" label="综合评价" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.overallGradeName" :type="getGradeTagType(row.overallGrade)" size="small" effect="light">
              {{ row.overallGradeName }}
            </el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="history-pagination">
        <el-pagination
          v-model:current-page="pageNo"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper, total"
          @current-change="handlePageChange"
        />
      </div>

      <div v-if="!loading && historyData.length === 0" class="empty-history">
        <el-empty description="暂无历史记录" />
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose" plain>关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// ... (script 部分保持不变，因为它处理的是逻辑而非样式)
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getPersonLodgingHistory,
  type PersonLodgingHistoryQuery,
  type PersonLodgingHistoryVO,
  type PersonProfileVO
} from '@/api/person-profiles'

interface Props {
  modelValue: boolean
  currentPerson: PersonProfileVO | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 组件内部状态
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 历史记录数据
const historyData = ref<PersonLodgingHistoryVO[]>([])
const loading = ref(false)
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)

// 获取历史记录数据
const fetchHistoryData = async (personId: number) => {
  if (!personId) return

  try {
    loading.value = true
    const params: PersonLodgingHistoryQuery = {
      personId,
      pageNo: pageNo.value,
      pageSize: pageSize.value
    }

    const response = await getPersonLodgingHistory(params)
    historyData.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败')
    historyData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 历史记录分页变化
const handlePageChange = (page: number) => {
  pageNo.value = page
  if (props.currentPerson?.personId) {
    fetchHistoryData(props.currentPerson.personId)
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 获取记录类型标签颜色 (保持不变，但模板中使用了 effect="light" 来淡化颜色)
const getRecordTypeTagType = (recordType?: string): string => {
  switch (recordType) {
    case '1': // 可能是普通挂单
      return 'success'
    case '2': // 可能是紧急挂单
      return 'warning'
    case '3': // 可能是特殊挂单
      return 'danger'
    default:
      return 'info'
  }
}

// 获取评价等级标签颜色 (保持不变，但模板中使用了 effect="light" 来淡化颜色)
const getGradeTagType = (grade?: number): string => {
  switch (grade) {
    case 5:
      return 'success'
    case 4:
      return 'success'
    case 3:
      return 'warning'
    case 2:
      return 'danger'
    case 1:
      return 'danger'
    default:
      return 'info'
  }
}

// 监听弹窗打开，重置数据并加载历史记录
watch(
  () => visible.value,
  (newValue) => {
    if (newValue && props.currentPerson?.personId) {
      pageNo.value = 1
      fetchHistoryData(props.currentPerson.personId)
    } else if (!newValue) {
      // 弹窗关闭时清理数据
      historyData.value = []
      total.value = 0
      pageNo.value = 1
    }
  }
)
</script>

<style scoped lang="scss">
.steve-jobs-dialog {
  // 覆盖 Element Plus 默认对话框样式，实现更扁平、圆润的风格
  .el-dialog {
    border-radius: 10px; // 圆角
  }
  
  // 移除对话框头部边框，使用更轻盈的样式
  .el-dialog__header {
    padding-bottom: 0;
    margin-right: 0; // 消除默认的右边距，让关闭按钮更贴合边角
    border-bottom: 1px solid #e0e0e0; // 细分隔线
  }

  .el-dialog__title {
    font-weight: 600; // 标题略微加粗
    font-size: 20px;
    color: #1a1a1a; // 接近黑色
  }
}

.history-content {
  padding: 0 20px 0 20px; // 增加左右留白
  
  .history-header {
    margin-bottom: 25px; // 增加底部留白
    padding-bottom: 15px;
    border-bottom: 1px solid #e0e0e0; // 细分隔线，代替原有的粗线

    p {
      margin: 0;
      color: #888; // 较淡的颜色
      font-size: 15px; // 略微放大
    }
  }

  .steve-jobs-table {
    // 覆盖 Element Plus 表格默认样式
    --el-table-border-color: #e0e0e0; // 使用浅灰细线作为边框色
    
    // 头部样式
    .el-table__header-wrapper {
      th {
        color: #333; // 头部文字颜色
        background: #fafafa !important; // 浅灰背景，略微区分
        font-weight: 500; // 适度加粗
        border-bottom: 1px solid #d0d0d0 !important; // 表头底部更明显的细线
      }
    }

    // 行样式
    .el-table__row {
      td {
        padding: 12px 0; // 增加行间距
        border-bottom: 1px solid #f0f0f0; // 极细的行分隔线
      }
    }

    // 移除表格整体边框
    &::before, &::after {
        display: none;
    }
  }

  .history-pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0; // 细分隔线
  }

  .empty-history {
    padding: 60px 20px; // 增加留白
    text-align: center;
    color: #b0b0b0; 
    font-size: 16px; 
  }
}
</style>