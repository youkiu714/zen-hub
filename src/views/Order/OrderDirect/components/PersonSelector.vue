<template>
    <el-dialog v-model="visible" title="选择已有挂单人员" width="900px" :close-on-click-modal="false" append-to-body
        @open="handleOpen">
        <div class="filter-container">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="关键词">
                    <el-input v-model="searchForm.keyword" placeholder="请输入姓名/手机号" clearable @keyup.enter="handleSearch"
                        style="width: 240px">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-table v-loading="loading" :data="tableData" border stripe highlight-current-row
            style="width: 100%; margin-bottom: 20px" height="400px" @current-change="handleCurrentChange"
            row-key="personId">
            <el-table-column label="选择" width="55" align="center">
                <template #default="scope">
                    <el-radio :model-value="currentRow?.personId" :label="scope.row.personId"
                        @change="handleCurrentChange(scope.row)">
                        &nbsp;
                    </el-radio>
                </template>
            </el-table-column>

            <el-table-column prop="name" label="姓名" show-overflow-tooltip />

            <el-table-column prop="gender" label="性别" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.gender === 1 ? 'primary' : 'danger'" size="small">
                        {{ row.gender === 1 ? '男' : '女' }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="age" label="年龄" align="center" />

            <el-table-column prop="mobile" label="手机号码" />

            <!-- <el-table-column label="证件号码" width="180">
         <template #default="{ row }">
            {{ row.idCard || '-' }} 
         </template>
      </el-table-column>

      <el-table-column prop="lastCheckinDate" label="最近挂单时间" min-width="160" sortable /> -->

            <el-table-column prop="departmentCode" label="所属部组" show-overflow-tooltip />

        </el-table>

        <div class="pagination-container">
            <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                :total="pagination.total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange" @current-change="handlePageChange" />
        </div>

        <template #footer>
            <div class="dialog-footer">
                <div class="left-tips" v-if="currentRow">
                    已选择：<span class="highlight">{{ currentRow.name }}</span>
                </div>
                <div>
                    <el-button @click="visible = false">取消</el-button>
                    <el-button type="primary" @click="confirmSelection" :disabled="!currentRow">
                        确认选择
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCheckedOutRecords, getCheckedOutDetail } from '@/api/person' // 引入API
import type { BasicInfo, PracticeInfo, LodgingInfo, ApplicationSubmitRequest } from '@/types'

// ================= 类型定义 (根据 CheckedOutGuestVO) =================
export interface PersonItem {
    personId: number
    name: string
    mobile: string
    gender: number // 1 | 2
    age?: number
    lastCheckinDate?: string
    departmentCode?: string
    // 注意：如果后端接口 CheckedOutGuestVO 确实不返回 idCard，
    // 回填时可能需要额外调用详情接口，或者让后端补充该字段
    idCard?: string
    [key: string]: any
}

// ================= Props & Emits =================
const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'select': [person: PersonItem]
}>()

// ================= 状态管理 =================
const loading = ref(false)
const currentRow = ref<PersonItem | null>(null)

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const searchForm = reactive({
    keyword: ''
})

const pagination = reactive({
    currentPage: 1, // 对应 pageNo
    pageSize: 10,   // 对应 pageSize
    total: 0
})

const tableData = ref<PersonItem[]>([])

// ================= 方法逻辑 =================

const handleOpen = () => {
    // 不重置 currentRow，允许用户保留上次选择（可选）
    // currentRow.value = null 
    fetchData()
}

// 调用真实 API
const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            keyword: searchForm.keyword,
            pageNo: pagination.currentPage,
            pageSize: pagination.pageSize
        }

        const res = await getCheckedOutRecords(params)
        console.log(res)
        // 根据您的 Response 结构：data.code === 0 表示成功

        tableData.value = res || []
        pagination.total = res.total || 0

    } catch (error) {
        console.error('API Error:', error)
        // ElMessage.error('网络请求异常') // request拦截器通常已处理
        tableData.value = []
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    pagination.currentPage = 1
    fetchData()
}

const resetSearch = () => {
    searchForm.keyword = ''
    handleSearch()
}

const handleCurrentChange = (val: PersonItem | undefined) => {
    if (val) {
        currentRow.value = val
    }
}

const handleSizeChange = (val: number) => {
    pagination.pageSize = val
    fetchData() // Element Plus 分页组件改变 pageSize 不会自动触发 current-change，需手动加载
}

const handlePageChange = (val: number) => {
    pagination.currentPage = val
    fetchData()
}

const confirmSelection = () => {
    if (!currentRow.value) {
        ElMessage.warning('请先选择一名人员')
        return
    }
    console.log(currentRow.value.personId)

    const res: any = getCheckedOutDetail(currentRow.value.personId)

    console.log(res)
    const detail = res

    //   emit('select', currentRow.value)
    emit('select', detail)
    visible.value = false
}
</script>

<style scoped lang="scss">
.filter-container {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-tips {
        font-size: 14px;
        color: #606266;

        .highlight {
            color: #8B5A2B;
            font-weight: bold;
            margin-left: 4px;
        }
    }
}

:deep(.el-table__body tr.current-row > td) {
    background-color: #fdf6ec !important;
}
</style>