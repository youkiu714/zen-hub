<template>
    <el-dialog v-model="visible" title="批量增加床位" width="860px" destroy-on-close :close-on-click-modal="false"
        class="batch-bed-dialog">
        <div class="dialog-body">
            <div class="config-panel">
                <div class="panel-header">
                    <span class="room-info">
                        正在为 <strong>{{ roomNo }}</strong> 房间增加床位
                    </span>
                </div>

                <el-form :inline="true" class="generator-form">
                    <el-form-item label="新增数量">
                        <el-input-number v-model="config.count" :min="1" :max="50" @change="generatePreview" />
                    </el-form-item>

                    <el-form-item label="起始编号">
                        <el-input-number v-model="config.startNo" :min="1" @change="generatePreview" />
                    </el-form-item>

                    <el-form-item label="命名规则">
                        <el-select v-model="config.pattern" style="width: 140px" @change="generatePreview">
                            <el-option label="数字-上下铺" value="pair-cn" />
                            <el-option label="数字-AB" value="pair-ab" />
                            <el-option label="仅数字" value="single" />
                        </el-select>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" link @click="generatePreview">
                            <el-icon>
                                <Refresh />
                            </el-icon> 重置生成的列表
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>

            <div class="preview-area">
                <div class="preview-header">
                    <span>床位预览与微调 ({{ formList.length }})</span>
                    <span class="sub-text">可以直接修改卡片内的编号</span>
                </div>

                <el-scrollbar max-height="400px">
                    <div class="beds-grid">
                        <div v-for="(item, index) in formList" :key="index" class="bed-item" :class="{
                            'bed-upper': item.bedType === 1,
                            'bed-lower': item.bedType === 2
                        }">
                            <div class="close-badge" @click.stop="removeBed(index)">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </div>

                            <div class="bed-number-wrapper">
                                <el-input v-model="item.bedNo" placeholder="床号" size="small" class="bed-number-input" />
                            </div>

                            <div class="bed-type-wrapper">
                                <el-radio-group v-model="item.bedType" size="small">
                                    <el-radio-button :label="1">上铺</el-radio-button>
                                    <el-radio-button :label="2">下铺</el-radio-button>
                                </el-radio-group>
                            </div>

                            <div class="bed-status-wrapper">
                                <el-tag type="success" size="small" effect="light">新增</el-tag>
                            </div>
                        </div>

                        <div class="bed-item add-bed-item" @click="addOneBed">
                            <el-icon size="24">
                                <Plus />
                            </el-icon>
                            <span>添加</span>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <div class="summary">
                    将创建 {{ formList.length }} 个床位 ({{ countType(1) }} 上铺, {{ countType(2) }} 下铺)
                </div>
                <div class="actions">
                    <el-button @click="visible = false">取消</el-button>
                    <el-button type="primary" @click="submit" :loading="submitting" color="#8B5A2B">
                        确认创建
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
// ... script 部分代码保持不变，逻辑无需修改 ...
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Close, Ticket } from '@element-plus/icons-vue'
import { batchCreateBeds } from '@/api/bed.d'
import type { BedUpsertRequest } from '@/types/bed'

const props = defineProps<{
    modelValue: boolean
    roomId: number
    roomNo: string
    existingBedMaxNo?: number
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const submitting = ref(false)

const config = reactive({
    count: 2,
    startNo: 1,
    pattern: 'pair-cn'
})

const formList = ref<BedUpsertRequest[]>([])

watch(() => props.modelValue, (val) => {
    if (val) {
        config.startNo = props.existingBedMaxNo ? props.existingBedMaxNo + 1 : 1
        config.count = 2
        generatePreview()
    }
})

const generatePreview = () => {
    const list: BedUpsertRequest[] = []
    let currentNo = config.startNo

    for (let i = 0; i < config.count; i++) {
        let bedNoStr = ''
        let bedType = 1

        if (config.pattern === 'single') {
            bedNoStr = `${currentNo}`
            bedType = 1
            currentNo++
        } else {
            const isEven = i % 2 === 0
            const pairIndex = Math.floor(i / 2)
            const num = config.startNo + pairIndex

            if (isEven) {
                bedType = 1
                bedNoStr = config.pattern === 'pair-cn' ? `${num}-上` : `${num}-A`
            } else {
                bedType = 2
                bedNoStr = config.pattern === 'pair-cn' ? `${num}-下` : `${num}-B`
            }
        }

        list.push({
            roomId: props.roomId,
            bedNo: bedNoStr,
            bedType: bedType,
            status: 0
        })
    }
    formList.value = list
}

const addOneBed = () => {
    formList.value.push({
        roomId: props.roomId,
        bedNo: '',
        bedType: 1,
        status: 0
    })
}

const removeBed = (index: number) => {
    formList.value.splice(index, 1)
}

const countType = (type: number) => {
    return formList.value.filter(item => item.bedType === type).length
}

const submit = async () => {
    if (formList.value.length === 0) {
        ElMessage.warning('请至少添加一个床位')
        return
    }
    if (formList.value.some(item => !item.bedNo)) {
        ElMessage.warning('所有床位号都必须填写')
        return
    }

    submitting.value = true
    try {
        const res = await batchCreateBeds({
            roomId: props.roomId,
            beds: formList.value
        })

        ElMessage.success(`成功创建 ${formList.value.length} 个床位`)
        visible.value = false
        emit('success')

    } catch (error) {
        console.error(error)
        ElMessage.error('系统异常')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
/* 1. 顶部配置区样式 */
.batch-bed-dialog :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 24px;
}

.config-panel {
    background-color: #FFF8E7;
    /* 保持系统主色调背景 */
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #F5F5DC;
}

.panel-header {
    margin-bottom: 12px;
    color: #8B5A2B;
}

.generator-form :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 24px;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
}

.preview-header .sub-text {
    font-weight: normal;
    font-size: 12px;
    color: #909399;
}

/* 2. 复刻 AssignBedModal 的网格布局 */
.beds-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    padding: 4px;
}

/* 3. 卡片样式重构 - 仿照 bed-item */
.bed-item {
    border: 1px solid #dcdfe6;
    /* 默认灰色边框 */
    border-radius: 4px;
    padding: 12px 8px;
    text-align: center;
    position: relative;
    background-color: #fff;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.bed-item:hover {
    /* 悬停时加深阴影 */
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

/* 上铺：蓝色边框 + 浅蓝背景 */
.bed-item.bed-upper {
    border: 1px solid #409eff;
    /* 四边蓝色 */
    background-color: #ecf5ff;
    /* 浅蓝背景，让区分更明显 */
}

/* 下铺：绿色边框 + 浅绿背景 */
.bed-item.bed-lower {
    border: 1px solid #67c23a;
    /* 四边绿色 */
    background-color: #f0f9eb;
    /* 浅绿背景 */
}

/* 删除按钮样式 */
.close-badge {
    position: absolute;
    top: -8px;
    /* 稍微往外移一点，避免挡住边框 */
    right: -8px;
    width: 20px;
    height: 20px;
    background-color: #f56c6c;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    /* 加点阴影让它浮起来 */
}

.bed-item:hover .close-badge {
    opacity: 1;
}

/* 内容区域微调 */
.bed-number-wrapper {
    /* 对应 bed-number 的位置 */
    font-weight: bold;
}

.bed-number-input :deep(.el-input__wrapper) {
    padding: 1px 8px;
    box-shadow: none;
    border-bottom: 1px solid #dcdfe6;
    border-radius: 0;
    text-align: center;
}

.bed-number-input :deep(.el-input__inner) {
    text-align: center;
    font-weight: bold;
    font-size: 16px;
    color: #303133;
}

.bed-type-wrapper {
    /* 对应 bed-type 的位置 */
}

/* 调整 Radio Group 样式使其适应小卡片 */
.bed-type-wrapper :deep(.el-radio-button__inner) {
    padding: 5px 8px;
    font-size: 12px;
}

.bed-status-wrapper {
    /* 对应 bed-status 的位置 */
    margin-top: auto;
    /* 推到底部 */
}

/* 添加按钮样式 */
.add-bed-item {
    border: 1px dashed #dcdfe6;
    cursor: pointer;
    color: #909399;
    justify-content: center;
    align-items: center;
    min-height: 120px;
    /* 保持和其他卡片差不多高度 */
}

.add-bed-item:hover {
    border-color: #8B5A2B;
    color: #8B5A2B;
    background-color: #fdf6ec;
}

/* 底部栏 */
.dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.summary {
    color: #606266;
    font-size: 13px;
}
</style>