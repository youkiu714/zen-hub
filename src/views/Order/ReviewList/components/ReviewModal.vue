<template>
  <el-dialog v-model="visible" :title="`提交审核（${props.reviewListItem?.applicantName}）`" width="800px" @close="handleClose">
    <div class="review-container">
      <!-- <div class="section-header">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>客堂义工审核</span>
      </div> -->

      <!-- 审核意见 -->
      <div class="form-item">
        <label class="form-label">审核意见</label>
        <el-input v-model="formData.comment" type="textarea" placeholder="请输入审核意见，如信息是否完整、是否需要补充材料等" rows="4"
          maxlength="500" show-word-limit />
      </div>

      <!-- 审核结果 -->
      <div class="form-item">
        <label class="form-label">审核结果</label>
        <div class="radio-group">
          <el-radio v-model="formData.pass" :label="true">
            同意
            <!-- 信息完整{{ props.status==10?'，提交给客堂法师审核':''}} -->
          </el-radio>
          <el-radio v-model="formData.pass" :label="false">
            拒绝
            <!-- 信息不完整，退回申请人 -->
          </el-radio>
        </div>
      </div>

      <!-- 退回原因（仅当不通过时显示） -->
      <!-- <div v-if="!formData.pass" class="return-reasons-section">
        <div class="reasons-header">退回原因</div>
        <el-checkbox-group v-model="formData.returnReasons">
          <el-checkbox v-for="item in returnReasonOptions" :key="item.value" :label="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
        <el-input v-if="formData.returnReasons.includes('other')" v-model="formData.otherReason" type="textarea"
          placeholder="请说明其他退回原因" rows="2" class="mt-2" />
      </div> -->

      <!-- 操作按钮 -->
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          提交审核
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import axios from 'axios'
import { reception } from '@/api/review';
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()

// 获取用户信息的响应式引用
const currentUser = computed(() => userStore.user)

console.log('角色');
console.log(userStore.roles);

// 定义 props
const props = defineProps<{
  modelValue: boolean // 控制弹窗显隐
  applicationId: number // 申请ID
  status: number
  reviewListItem: any
}>()

// 定义 emits
const emit = defineEmits(['update:modelValue', 'submitSuccess'])

const resetForm = () => {
  formData.pass = true
  formData.comment = '通过'
  formData.returnReasons = []
  formData.otherReason = ''
}



// 弹窗显隐控制
const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    console.log(props.reviewListItem)
    visible.value = val
    if (val) {
      resetForm()
    }
  }
)
// 表单数据
const formData = reactive({
  pass: true, // 默认通过
  comment: '通过',
  returnReasons: [] as string[],
  otherReason: ''
})

// 退回原因选项
const returnReasonOptions = [
  { label: '身份证照片不清晰', value: 'id_card_blur' },
  { label: '个人照片不符合要求', value: 'photo_invalid' },
  { label: '联系电话无法联系', value: 'phone_unreachable' },
  { label: '紧急联系人信息不完整', value: 'emergency_incomplete' },
  { label: '其他原因', value: 'other' }
]

// 加载状态
const loading = ref(false)

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}

// 取消按钮
const handleCancel = () => {
  handleClose()
}

// 提交审核
const handleSubmit = async () => {
  if (!formData.comment.trim()) {
    ElMessage.warning('请填写审核意见')
    return
  }

  // 构造最终评论内容（如果退回，拼接退回原因）
  let finalComment = formData.comment.trim()
  if (!formData.pass && formData.returnReasons.length > 0) {

    // 先获取除 'other' 外的标签
    const mainReasons = returnReasonOptions
      .filter(item => formData.returnReasons.includes(item.value) && item.value !== 'other')
      .map(item => item.label)

    // 如果有“其他原因”，单独处理
    if (formData.returnReasons.includes('other') && formData.otherReason.trim()) {
      mainReasons.push(formData.otherReason.trim())
    }

    const selectedReasons = mainReasons.join('、')

    finalComment = `${finalComment}\n\n退回原因：${selectedReasons}`
  }
  console.log('当前用户信息:', currentUser.value)
  console.log('用户ID:', currentUser.value?.id)

  const params = {
    "pass": formData.pass,
    "comment": finalComment,
    "operatorId": currentUser.value?.id
  };
  const res = await reception(params, props.applicationId);
  ElMessage.success('审核提交成功')
  emit('submitSuccess') // 通知父组件刷新数据或关闭弹窗
  handleClose()

}
</script>

<style scoped>
.review-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #8b653c;
}

.section-header .el-icon {
  margin-right: 8px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.return-reasons-section {
  background-color: #fdf2f2;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.reasons-header {
  font-weight: bold;
  color: #d32f2f;
  margin-bottom: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.mt-2 {
  margin-top: 8px;
}
</style>