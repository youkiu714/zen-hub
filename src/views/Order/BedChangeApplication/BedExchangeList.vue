<template>
    <div class="bed-exchange-container">
        <PageHeader title="换床申请" />

        <PageTabs v-model="activeTab" :options="tabOptions" @change="handleTabChange" />
        <div class="table-container">
            <div class="header-action">
                <h3 class="section-title">
                    {{ activeTab === 'eligible' ? '可申请换床列表' : '已申请换床列表' }}
                </h3>
                <div class="search-box">
                    <el-input v-model="queryParams.keyword" placeholder="搜索申请人姓名或房间号" style="width: 240px" clearable
                        @keyup.enter="handleSearch" @clear="handleSearch">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                    <el-dropdown trigger="click" @command="handleRoomTypeChange">
                        <el-button class="filter-dropdown-btn">
                            {{ currentRoomTypeLabel }}
                            <el-icon class="el-icon--right">
                                <ArrowDown />
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="item in roomTypeOptions" :key="item.value"
                                    :command="item.value" :class="{ 'is-active': queryParams.roomType === item.value }">
                                    {{ item.label }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>

            <div class="table-wrapper" v-loading="loading">

                <el-table v-if="activeTab === 'eligible'" :data="eligibleList" style="width: 100%"
                    header-row-class-name="custom-header" class="application-table">
                    <el-table-column label="申请人" min-width="180">
                        <template #default="{ row }">
                            <div class="user-info">
                                <el-avatar :size="40" class="user-avatar"
                                    :style="{ backgroundColor: stringToColor(row.name) }">
                                    {{ row.name ? row.name.charAt(0) : '无' }}
                                </el-avatar>
                                <div class="user-detail">
                                    <div class="user-name">{{ row.name }}</div>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="房间信息" min-width="160">
                        <template #default="{ row }">
                            <div class="room-info">
                                <div class="room-no">{{ row.roomNo }}（{{ row.bedNo }}）</div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="checkinDate" label="入住日期" min-width="120" />
                    <el-table-column prop="checkoutDate" label="预计离店" min-width="120" />

                    <el-table-column label="当前状态" min-width="100">
                        <template #default="{ row }">
                            <el-tag type="success" effect="light" round>
                                {{ row.statusDesc || '已入住' }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <el-button type="primary" link class="action-btn" @click="handleApply(row)">
                                <el-icon style="margin-right: 4px">
                                    <Switch />
                                </el-icon>
                                申请换床
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <el-table v-else :data="appliedList" style="width: 100%" header-row-class-name="custom-header">
                    <el-table-column prop="name" label="申请人" min-width="120" />

                    <el-table-column label="原床位" min-width="140">
                        <template #default="{ row }">
                            {{ row.originalRoomNo }} - {{ row.originalBedTypeName }}
                        </template>
                    </el-table-column>

                    <el-table-column label="目标床位" min-width="140">
                        <template #default="{ row }">
                            <span style="color: #8b5e3c; font-weight: bold;">
                                {{ row.newRoomNo }} - {{ row.newBedTypeName }}
                            </span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="reasonName" label="换床原因" min-width="120" />
                    <el-table-column prop="applyTime" label="申请时间" min-width="160" />

                    <el-table-column label="审批状态" min-width="100">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.statusName)">
                                {{ row.statusName }}
                            </el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-container">
                <div class="pagination-info">
                    显示 {{ startRow }} 至 {{ endRow }} 条，共 {{ total }} 条
                </div>
                <el-pagination v-model:current-page="queryParams.pageNo" v-model:page-size="queryParams.pageSize"
                    :total="total" :page-sizes="[10, 20, 50]" background layout="prev, pager, next"
                    @size-change="fetchData" @current-change="fetchData" />
            </div>
        </div>

        <BedExchangeApplyDialog v-model="applyDialogVisible" :applicant="currentApplicant"
            @success="handleApplySuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Search, Switch, List, Checked } from '@element-plus/icons-vue';
import PageTabs from '@/components/PageTabs.vue';
import { getEligibleList, getAppliedList } from '@/api/bed.d';
import BedExchangeApplyDialog from './components/BedExchangeApplyDialog.vue';
import type { BedEligibleItem, BedAppliedItem, BedQueryParams } from '@/types/bed.d';

// --- 状态定义 ---
const activeTab = ref<'eligible' | 'applied'>('eligible');
const loading = ref(false);
const total = ref(0);

// --- 弹窗控制状态 ---
const applyDialogVisible = ref(false);
const currentApplicant = ref<BedEligibleItem | null>(null);

// --- 扩展查询参数接口，增加 roomType ---
interface ExtendedQueryParams extends BedQueryParams {
    roomType?: string; // 新增房型筛选字段
}

// 定义 Tab 选项配置
// --- 关键修改：定义带有图标的 Tab 选项 ---
const tabOptions = [
    {
        label: '可申请换床',
        value: 'eligible',
        icon: List  // 使用 List 图标
    },
    {
        label: '已申请换床',
        value: 'applied',
        icon: Checked // 使用 Checked 图标
    }
]
// 分别存储两个列表的数据，避免切换时闪烁或类型冲突
const eligibleList = ref<BedEligibleItem[]>([]);
const appliedList = ref<BedAppliedItem[]>([]);

// 查询参数 (注意：后端参数名为 pageNo)
const queryParams = reactive<BedQueryParams>({
    pageNo: 1,
    pageSize: 10,
    keyword: '',
    // roomType: 'normal' // 默认选中 '常规'，如果想默认全部则设为 ''
});


// --- 新增：房型下拉选项配置 ---
const roomTypeOptions = [
    { label: '全部房型', value: '' },
    { label: '常规', value: 'normal' },
    { label: '单人间', value: 'single' },
    { label: '双人间', value: 'double' },
    { label: '四人间', value: 'quad' },
    { label: '多人间', value: 'dorm' }
];

// --- 计算属性 ---
const startRow = computed(() => (queryParams.pageNo - 1) * queryParams.pageSize + 1);
const endRow = computed(() => {
    // 避免显示 "1 至 10 条，共 5 条" 这种尴尬情况
    return Math.min(queryParams.pageNo * queryParams.pageSize, total.value);
});

// 计算当前显示的按钮文字
const currentRoomTypeLabel = computed(() => {
    const option = roomTypeOptions.find(opt => opt.value === queryParams.roomType);
    return option ? option.label : '全部房型';
});


// 点击“申请换床”按钮
const handleApply = (row: BedEligibleItem) => {
    currentApplicant.value = row; // 将当前行数据传给弹窗
    applyDialogVisible.value = true; // 显示弹窗
};

// 申请提交成功后的回调
const handleApplySuccess = () => {
    fetchData(); // 刷新列表
};

// --- 事件处理 ---

// 处理房型切换
const handleRoomTypeChange = (command: string) => {
    queryParams.roomType = command;
    queryParams.pageNo = 1; // 筛选变动时重置页码
    fetchData();
};

// --- 核心方法 ---

// 获取数据
const fetchData = async () => {
    loading.value = true;
    try {
        // 根据当前 Tab 调用不同的 API
        if (activeTab.value === 'eligible') {
            const res = await getEligibleList(queryParams);
            // request.ts 已经处理了解包，这里直接拿 res
            eligibleList.value = res.records || [];
            total.value = res.total || 0;
        } else {
            const res = await getAppliedList(queryParams);
            appliedList.value = res.records || [];
            total.value = res.total || 0;
        }
    } catch (error) {
        console.error('获取列表失败', error);
        // request.ts 的拦截器通常会弹出 ElMessage，这里可以不做额外处理
    } finally {
        loading.value = false;
    }
};

// 搜索
const handleSearch = () => {
    queryParams.pageNo = 1; // 搜索时重置回第一页
    fetchData();
};

// Tab 切换 (稍微修改一下，去掉 event 参数，因为自定义组件直接传 value)
const handleTabChange = (val: string) => {
    // 重置状态
    queryParams.pageNo = 1;
    queryParams.keyword = '';
    eligibleList.value = [];
    appliedList.value = [];
    total.value = 0;

    fetchData();
};


// --- 工具方法 ---

// 简单的根据字符串生成颜色，让头像不那么单调
const stringToColor = (str: string | undefined) => {
    if (!str) return '#ccc';
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#8b5e3c'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// 状态 Tag 颜色映射
const getStatusType = (statusName: string | undefined) => {
    if (!statusName) return 'info';
    if (statusName.includes('通过') || statusName.includes('完成')) return 'success';
    if (statusName.includes('拒绝') || statusName.includes('取消')) return 'danger';
    return 'warning'; // 默认审批中为黄色
};

// --- 生命周期 ---
onMounted(() => {
    fetchData();
});
</script>

<style scoped lang="scss">
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


// 保持和原型图一致的样式体系
.bed-exchange-container {
    padding: 20px;
    background-color: #fdf6e3;
    // min-height: 100vh;
}


.table-container {
    border-radius: 8px;

    .header-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
            font-size: 18px;
            color: #8b5e3c;
            font-weight: normal;
            margin: 0;
        }

        .search-box {
            display: flex;
            gap: 10px;
        }
    }
}

.table-wrapper {
    margin-top: 10px;
}

// 用户信息列样式
.user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-avatar {
        color: #fff;
        font-size: 16px;
    }

    .user-detail {
        display: flex;
        flex-direction: column;

        .user-name {
            font-weight: 600;
            color: #333;
        }

        .user-id {
            font-size: 12px;
            color: #999;
        }
    }
}

.room-info {
    .room-no {
        font-weight: 500;
        color: #333;
    }

    .bed-detail {
        font-size: 12px;
        color: #666;
    }
}

.action-btn {
    color: #8b5e3c;

    &:hover {
        color: #a67c5e;
    }
}

// 修改表头背景色
:deep(.custom-header th) {
    background-color: #fdfbf6 !important;
    color: #666;
    font-weight: 500;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #666;
    font-size: 14px;
}
</style>