<template>
    <el-dialog v-model="visible" :title="`换床申请 - ${applicant?.name || ''}`" width="640px" destroy-on-close
        class="bed-apply-dialog" @close="handleClose">
        <div class="dialog-body">
            <div class="info-card">
                <div class="card-header">
                    <el-icon class="icon">
                        <User />
                    </el-icon>
                    <span>申请人信息</span>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <label>姓名</label>
                        <div class="value">{{ applicant?.name }}</div>
                    </div>
                    <div class="info-item">
                        <label>当前房间床位</label>
                        <div class="value">{{ applicant?.roomNo }}室 - {{ applicant?.bedTypeName }} {{ applicant?.bedNo
                            }}床
                        </div>
                    </div>
                    <div class="info-item">
                        <label>入住日期</label>
                        <div class="value">{{ applicant?.checkinDate }}</div>
                    </div>
                    <div class="info-item">
                        <label>预计离店</label>
                        <div class="value">{{ applicant?.checkoutDate }}</div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="card-header">
                    <el-icon class="icon">
                        <OfficeBuilding />
                    </el-icon>
                    <span>换床申请信息</span>
                </div>

                <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" class="apply-form">
                    <el-form-item label="期望房间类型" prop="targetRoomType">
                        <el-select v-model="formData.targetRoomType" placeholder="请选择房间类型" style="width: 100%">
                            <el-option label="常规" value="regular" />
                            <el-option label="单人间" value="single" />
                            <el-option label="双人间" value="double" />
                            <el-option label="四人间" value="quad" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="期望床位类型" prop="targetBedType">
                        <el-radio-group v-model="formData.targetBedType">
                            <el-radio :label="2">下铺</el-radio>
                            <el-radio :label="1">上铺</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="换床原因" prop="reasonType">
                        <el-radio-group v-model="formData.reasonType" class="reason-radio-group">
                            <div v-for="item in reasonOptions" :key="item.value" class="reason-item"
                                :class="{ active: formData.reasonType === item.value }"
                                @click="formData.reasonType = item.value">
                                <el-radio :label="item.value" class="custom-radio">
                                    <div class="reason-content">
                                        <div class="reason-title">{{ item.label }}</div>
                                        <div class="reason-desc">{{ item.desc }}</div>
                                    </div>
                                </el-radio>
                            </div>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="formData.reasonType === 4" label="详细原因说明" prop="otherReasonDetail">
                        <el-input v-model="formData.otherReasonDetail" type="textarea" :rows="3"
                            placeholder="请详细说明换床原因" />
                    </el-form-item>

                    <el-form-item label="其他补充说明" prop="remark">
                        <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="如有其他需要说明的情况，请在此填写" />
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    提交换床申请
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { User, OfficeBuilding } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import type { BedEligibleItem } from '@/types/bed.d';
// 引入 API
import { submitBedChangeApply } from '@/api/bed.d';

const props = defineProps<{
    modelValue: boolean;
    applicant: BedEligibleItem | null;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const formRef = ref<FormInstance>();
const submitting = ref(false);

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

// 表单数据
// targetBedType: 1=上铺, 2=下铺
// reasonType: 1=身体, 2=亲属, 3=环境, 4=其他
const formData = reactive({
    targetRoomType: 'regular',
    targetBedType: undefined as number | undefined,
    reasonType: undefined as number | undefined,
    otherReasonDetail: '',
    remark: ''
});

// 换床原因选项 (Value 改为数字以匹配后端接口)
const reasonOptions = [
    { value: 1, label: '身体原因', desc: '上下铺不便、行动困难等身体因素' },
    { value: 2, label: '亲属同行', desc: '与同行亲属需要住同一房间' },
    { value: 3, label: '环境因素', desc: '噪音、采光等环境不适' },
    { value: 4, label: '其他原因', desc: '请在下方详细说明' }
];

const rules = reactive<FormRules>({
    targetRoomType: [{ required: true, message: '请选择期望房间类型', trigger: 'change' }],
    targetBedType: [{ required: true, message: '请选择期望床位类型', trigger: 'change' }],
    reasonType: [{ required: true, message: '请选择换床原因', trigger: 'change' }],
    otherReasonDetail: [{ required: true, message: '请填写详细原因', trigger: 'blur' }]
});

const handleClose = () => {
    visible.value = false;
};

// 提交逻辑
const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (valid) {
            if (!props.applicant?.applicationId) {
                ElMessage.error('数据异常：缺少申请ID');
                return;
            }

            submitting.value = true;
            try {
                // 构造提交参数
                // 逻辑：如果选了"其他(4)"，补充说明优先用 otherReasonDetail，否则用 remark
                const remark = formData.reasonType === 4
                    ? (formData.otherReasonDetail + (formData.remark ? `；${formData.remark}` : ''))
                    : formData.remark;

                await submitBedChangeApply({
                    applicationId: props.applicant.applicationId,
                    desiredBedType: formData.targetBedType!,
                    reasonType: formData.reasonType!,
                    reasonRemark: remark
                });

                ElMessage.success('换床申请已提交成功');
                emit('success');
                handleClose();
            } catch (error) {
                console.error(error);
                // request.ts 会处理错误提示，这里通常不需要额外 toast
            } finally {
                submitting.value = false;
            }
        }
    });
};
</script>

<style scoped lang="scss">

/* --- 新增：滚动条容器样式 --- */
.dialog-body {
  max-height: 60vh; /* 限制内容高度为屏幕高度的 60%，预留头部和底部空间 */
  overflow-y: auto; /* 超出部分显示滚动条 */
  padding-right: 10px; /* 右侧预留一点间距，防止滚动条遮挡内容 */
  margin-right: -10px; /* 配合 padding 保持视觉对齐 */
  
  /* 可选：美化滚动条 (Webkit内核浏览器) */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

/* ... 样式保持不变，直接复用上一个回答中的 CSS ... */
.info-card {
    background-color: #f9f9f7;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
    border: 1px solid #eef0f2;
}

.card-header {
    display: flex;
    align-items: stretch;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;

    .icon {
        color: #8b5e3c;
        margin-right: 8px;
        font-size: 18px;
    }
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.info-item {
    label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
        display: block;
    }

    .value {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
    }
}

.form-section {
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
}

.reason-radio-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;
}

:deep(.el-radio-group) {
    align-items: stretch !important;
}

.reason-item {
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        border-color: #8b5e3c;
    }

    &.active {
        border-color: #8b5e3c;
        background-color: #fdfbf6;
    }

    :deep(.el-radio) {
        width: 100%;
        height: auto;
        margin-right: 0;
        white-space: normal;

        .el-radio__label {
            width: 100%;
        }

        .el-radio__input.is-checked .el-radio__inner {
            border-color: #8b5e3c;
            background: #8b5e3c;
        }

        .el-radio__input.is-checked+.el-radio__label {
            color: #606266;
        }
    }
}

.reason-content {
    display: flex;
    flex-direction: column;

    .reason-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 2px;
    }

    .reason-desc {
        font-size: 12px;
        color: #909399;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

:deep(.el-button--primary) {
    background-color: #8b5e3c;
    border-color: #8b5e3c;

    &:hover {
        background-color: #a67c5e;
        border-color: #a67c5e;
    }
}
</style>