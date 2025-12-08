<template>
  <el-dialog v-model="visible" title="分配床位1" width="600px" :close-on-click-modal="false" custom-class="assign-bed-dialog"
    @close="handleClose">
    <div class="dialog-body">
      <!-- 人员信息 -->
      <div class="person-info">
        <h4 class="section-title">挂单人信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>姓名：</label>
            <span>{{ selectedPerson?.name || '—' }}</span>
          </div>
          <div class="info-item">
            <label>性别：</label>
            <span>{{ selectedPerson?.gender === 1 ? '男' : selectedPerson?.gender === 2 ? '女' : '—' }}</span>
          </div>
          <div class="info-item">
            <label>房间号：</label>
            <span>{{ selectedPerson?.roomNumber || '未分配' }}</span>
          </div>
          <div class="info-item">
            <label>床位号：</label>
            <span>{{ selectedPerson?.bedNumber || '未分配' }}</span>
          </div>
        </div>
      </div>

      <!-- 床位选择 -->
      <div class="bed-selection">
        <h4 class="section-title">床位选择</h4>
        <el-form :model="form" label-width="100px">
          <el-form-item label="房间号" required>
            <el-input v-model="form.roomNumber" placeholder="请输入房间号" clearable />
          </el-form-item>

          <el-form-item label="床位号" required>
            <el-input v-model="form.bedNumber" placeholder="请输入床位号" clearable />
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息（可选）" />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确认分配
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { AssignmentListItemVO } from '@/types/assignment'

interface Props {
  visible: boolean
  selectedPerson: AssignmentListItemVO | null
  submitting: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  selectedPerson: null,
  submitting: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': [data: { roomNumber: string, bedNumber: string, remark: string }]
  'close': []
}>()

// 表单数据
const form = reactive({
  roomNumber: '',
  bedNumber: '',
  remark: ''
})

// 监听人员变化，自动填充房间和床位信息
watch(
  () => props.selectedPerson,
  (newPerson) => {
    if (newPerson) {
      form.roomNumber = newPerson.roomNumber || ''
      form.bedNumber = newPerson.bedNumber || ''
      form.remark = ''
    } else {
      // 清空表单
      form.roomNumber = ''
      form.bedNumber = ''
      form.remark = ''
    }
  },
  { immediate: true }
)

// 重置表单
const resetForm = () => {
  form.roomNumber = ''
  form.bedNumber = ''
  form.remark = ''
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  emit('update:visible', false)
  emit('close')
}

// 提交分配
const handleSubmit = () => {
  if (!form.roomNumber.trim()) {
    ElMessage.error('请输入房间号')
    return
  }

  if (!form.bedNumber.trim()) {
    ElMessage.error('请输入床位号')
    return
  }

  emit('success', {
    roomNumber: form.roomNumber.trim(),
    bedNumber: form.bedNumber.trim(),
    remark: form.remark.trim()
  })

  ElMessage.success('床位分配成功')
  resetForm()
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.dialog-body {
  // padding: 20px;
  max-height: 70vh;
  /* 限制内容高度为屏幕高度的 60%，预留头部和底部空间 */
  overflow-y: auto;
  /* 超出部分显示滚动条 */
  padding-right: 10px;
  /* 右侧预留一点间距，防止滚动条遮挡内容 */
  margin-right: -10px;
  /* 配合 padding 保持视觉对齐 */

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

.assign-bed-dialog {
  .person-info {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #8b5a2b;
    margin-bottom: 16px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-weight: 500;
      color: #666;
      min-width: 60px;
    }

    span {
      color: #333;
      font-weight: 400;
    }
  }

  .bed-selection {
    .el-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
    margin-top: 16px;
    padding-top: 16px;
  }
}
</style>