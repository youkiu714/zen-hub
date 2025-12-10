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
                    <span class="sub-text">您可以直接修改下面的卡片内容</span>
                </div>

                <el-scrollbar max-height="400px">
                    <div class="cards-grid">
                        <div v-for="(item, index) in formList" :key="index" class="bed-card"
                            :class="{ 'is-upper': item.bedType === 1, 'is-lower': item.bedType === 2 }">
                            <div class="card-header">
                                <span class="index-badge">#{{ index + 1 }}</span>
                                <el-button type="danger" circle size="small" icon="Close" text class="remove-btn"
                                    @click="removeBed(index)" />
                            </div>

                            <div class="card-body">
                                <el-input v-model="item.bedNo" placeholder="床位号" class="bed-no-input">
                                    <template #prefix><el-icon>
                                            <Ticket />
                                        </el-icon></template>
                                </el-input>

                                <el-radio-group v-model="item.bedType" size="small" class="bed-type-group">
                                    <el-radio-button :label="1">上铺</el-radio-button>
                                    <el-radio-button :label="2">下铺</el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>

                        <div class="add-one-btn" @click="addOneBed">
                            <el-icon size="24">
                                <Plus />
                            </el-icon>
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
                    <el-button type="primary" @click="submit" :loading="submitting" color="#2c3e50">
                        确认创建
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, Close, Ticket } from '@element-plus/icons-vue'
import { batchCreateBeds } from '@/api/bed.d'
import type { BedUpsertRequest } from '@/types/bed.d'

const props = defineProps<{
    modelValue: boolean
    roomId: number
    roomNo: string
    existingBedMaxNo?: number // 可选：传入当前房间最大的床号，用于自动计算起始值
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const submitting = ref(false)

// 配置项
const config = reactive({
    count: 8,
    startNo: 1,
    pattern: 'pair-cn' // pair-cn (1-上), pair-ab (1-A), single (1, 2, 3)
})

// 生成的表单列表
const formList = ref<BedUpsertRequest[]>([])

// 监听弹窗打开，自动重置并生成
watch(() => props.modelValue, (val) => {
    if (val) {
        // 智能推断起始号：如果外部传入了 existingBedMaxNo，则 +1，否则默认为 1
        config.startNo = props.existingBedMaxNo ? props.existingBedMaxNo + 1 : 1
        config.count = 8 // 重置默认数量
        generatePreview()
    }
})

// 核心逻辑：生成预览列表
const generatePreview = () => {
    const list: BedUpsertRequest[] = []
    let currentNo = config.startNo

    for (let i = 0; i < config.count; i++) {
        let bedNoStr = ''
        let bedType = 1 // 默认上铺

        if (config.pattern === 'single') {
            // 纯数字模式：1, 2, 3
            bedNoStr = `${currentNo}`
            bedType = 1 // 默认都算下铺或者根据需求
            currentNo++
        } else {
            // 配对模式
            const isEven = i % 2 === 0 // 偶数索引 (0, 2...)
            // 逻辑：每两个床位共用一个数字编号
            // i=0 -> num=1, 上
            // i=1 -> num=1, 下
            // i=2 -> num=2, 上
            const pairIndex = Math.floor(i / 2)
            const num = config.startNo + pairIndex

            if (isEven) {
                // 上铺
                bedType = 1
                bedNoStr = config.pattern === 'pair-cn' ? `${num}-上` : `${num}-A`
            } else {
                // 下铺
                bedType = 2
                bedNoStr = config.pattern === 'pair-cn' ? `${num}-下` : `${num}-B`
            }
        }

        list.push({
            roomId: props.roomId,
            bedNo: bedNoStr,
            bedType: bedType,
            status: 0 // 默认空闲
        })
    }
    formList.value = list
}

// 手动添加一个
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

// 统计辅助函数
const countType = (type: number) => {
    return formList.value.filter(item => item.bedType === type).length
}

const submit = async () => {
    // 简单校验
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
        console.log(res);
        
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
.batch-bed-dialog :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 24px;
}

.config-panel {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.panel-header {
    margin-bottom: 15px;
    color: #606266;
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

/* Grid 布局核心 */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    padding: 4px;
    /* 防止阴影被裁剪 */
}

/* 乔布斯风格卡片 */
.bed-card {
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    padding: 12px;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.bed-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #c0c4cc;
}

/* 上下铺视觉区分 */
.bed-card.is-upper {
    border-left: 4px solid #409eff;
    /* 蓝色条表示上铺 */
}

.bed-card.is-lower {
    border-left: 4px solid #67c23a;
    /* 绿色条表示下铺 */
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.index-badge {
    font-size: 12px;
    color: #c0c4cc;
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* 调整输入框和按钮组样式使其更紧凑 */
.bed-no-input :deep(.el-input__wrapper) {
    box-shadow: none;
    border-bottom: 1px solid #dcdfe6;
    border-radius: 0;
    padding-left: 0;
}

.bed-no-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: none;
    border-bottom-color: #409eff;
}

.bed-type-group {
    width: 100%;
}

.bed-type-group :deep(.el-radio-button__inner) {
    width: 50%;
    padding: 5px 0;
    border: none;
    background: #f5f7fa;
    border-radius: 4px;
    margin: 0 2px;
}

.bed-type-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 4px;
}

.bed-type-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 4px;
}

.bed-type-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #303133;
    /* 选中变黑，苹果风 */
    color: white;
    box-shadow: none;
}

/* 添加按钮样式 */
.add-one-btn {
    border: 1px dashed #dcdfe6;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    min-height: 110px;
    color: #909399;
    transition: all 0.2s;
}

.add-one-btn:hover {
    border-color: #409eff;
    color: #409eff;
    background-color: #ecf5ff;
}

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