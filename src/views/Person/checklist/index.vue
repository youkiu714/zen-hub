<template>
  <div class="checklist-page">
    <PageHeader title="校验名单管理" />

    <div class="operation-bar">
      <div class="search-wrapper">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索姓名或身份证号"
          class="custom-input"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-button type="primary" class="add-btn" @click="openDialog()">
        <el-icon class="mr-2"><Plus /></el-icon> 新增校验人员
      </el-button>
    </div>

    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        :header-cell-style="{ background: '#F5F5DC', color: '#6B7280', fontWeight: '500' }"
        row-class-name="custom-row"
      >
        <el-table-column label="序号" type="index" width="80" align="center" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="idCard" label="身份证号" min-width="180" />
        <el-table-column prop="gender" label="性别" width="100" />
        <el-table-column prop="reason" label="纳入原因" min-width="250" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link class="action-btn edit" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link class="action-btn delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="queryParams.pageSize"
          :current-page="queryParams.pageNo"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增校验人员' : '编辑校验人员'"
      width="600px"
      class="elegant-dialog"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="custom-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入18位身份证号" />
        </el-form-item>

        <el-form-item label="背景简介" prop="background">
          <el-input 
            v-model="form.background" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入背景简介（选填）" 
          />
        </el-form-item>

        <el-form-item label="纳入原因" prop="reason">
          <el-input 
            v-model="form.reason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入纳入校验名单的原因" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting" class="submit-btn">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getChecklist, saveChecklistItem, deleteChecklistItem } from '@/api/checklist'
import type { ChecklistItem, ChecklistQuery, ChecklistForm } from '@/types/checklist'

// --- 状态定义 ---
const loading = ref(false)
const submitting = ref(false)
const tableData = ref<ChecklistItem[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

const queryParams = reactive<ChecklistQuery>({
  pageNo: 1,
  pageSize: 10,
  keyword: ''
})

const form = reactive<ChecklistForm>({
  name: '',
  idCard: '',
  gender: '男',
  reason: '',
  background: ''
})

// --- 表单校验规则 ---
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证格式不正确', trigger: 'blur' }
  ],
  reason: [{ required: true, message: '请输入纳入原因', trigger: 'blur' }]
})

// --- 方法 ---

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getChecklist(queryParams)
    tableData.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageNo = 1
  loadData()
}

// 翻页
const handlePageChange = (page: number) => {
  queryParams.pageNo = page
  loadData()
}

// 打开弹窗
const openDialog = (row?: ChecklistItem) => {
  dialogType.value = row ? 'edit' : 'add'
  if (row) {
    Object.assign(form, row)
  } else {
    // 默认值
    form.id = undefined
    form.name = ''
    form.idCard = ''
    form.gender = '男'
    form.reason = ''
    form.background = ''
  }
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await saveChecklistItem(form)
        ElMessage.success('保存成功')
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除
const handleDelete = (row: ChecklistItem) => {
  ElMessageBox.confirm(
    '确定要删除该记录吗？此操作不可撤销。',
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger' // 强制红色按钮
    }
  ).then(async () => {
    try {
      await deleteChecklistItem(row.id)
      ElMessage.success('删除成功')
      // 如果当前页只有一条数据且不是第一页，则向前翻一页
      if (tableData.value.length === 1 && queryParams.pageNo > 1) {
        queryParams.pageNo--
      }
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 定义 CSS 变量以匹配原型颜色 */
.checklist-page {
  --primary-color: #8B5A2B;
  --primary-hover: #704822;
  --bg-light: #FFF8E7;
  --bg-neutral: #F5F5DC;
  --text-dark: #3E2723;
  --text-gray: #6B7280;
  --danger-color: #F44336;
  --info-color: #2196F3;
  
  padding: 20px;
  background-color: var(--bg-light);
  min-height: calc(100vh - 60px); /* 减去头部高度 */
  font-family: 'Noto Sans SC', 'sans-serif';
}

/* 标题区 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-family: 'Noto Serif SC', serif;
  font-size: 2.5rem;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 12px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: var(--text-gray);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 操作栏 */
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.operation-bar:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.search-wrapper {
  width: 320px;
}

/* 覆盖 Element Input 样式以匹配原型 */
:deep(.custom-input .el-input__wrapper) {
  border-radius: 8px;
  padding: 4px 11px;
  box-shadow: 0 0 0 1px #dcdfe6; /* 默认边框 */
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.add-btn {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: 8px;
  padding: 20px 24px;
  font-size: 15px;
}

.add-btn:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

/* 表格容器 */
.table-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding-bottom: 20px;
}

/* 表格样式微调 */
:deep(.el-table__row) {
  height: 60px;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(245, 245, 220, 0.5); /* Neutral 色的透明版 */
}

.action-btn {
  font-weight: 500;
}

.action-btn.edit {
  color: var(--info-color);
}

.action-btn.delete {
  color: var(--danger-color);
}

/* 分页 */
.pagination-wrapper {
  padding: 20px 24px 0;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: var(--primary-color);
}

/* 弹窗样式定制 - 乔布斯风格/Elegant */
:deep(.elegant-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.elegant-dialog .el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  margin-right: 0;
}

:deep(.elegant-dialog .el-dialog__title) {
  font-family: 'Noto Serif SC', serif;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.25rem;
}

:deep(.elegant-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.elegant-dialog .el-dialog__footer) {
  padding: 20px 24px;
  background-color: #f9fafb;
  border-top: 1px solid #eee;
}

/* 弹窗内按钮 */
.cancel-btn {
  border-radius: 8px;
  padding: 18px 24px;
}

.submit-btn {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  border-radius: 8px;
  padding: 18px 24px;
}

.submit-btn:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-wrapper {
    width: 100%;
  }
  
  .title {
    font-size: 1.8rem;
  }
}
</style>