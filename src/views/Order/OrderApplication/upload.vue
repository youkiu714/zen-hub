<template>
  <div class="lodging-upload-page">
    <PageHeader title="挂单申请 - 文件上传">
      <el-button @click="goBack">返回选择</el-button>
    </PageHeader>

    <el-card class="upload-card">
      <el-upload
        v-model:file-list="fileList"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg"
        class="upload"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持常见格式，当前仅展示上传组件（不自动上传）</div>
        </template>
      </el-upload>

      <div class="actions">
        <el-button type="primary" :disabled="!fileList.length" @click="handleConfirm">确认</el-button>
        <el-button @click="clearFiles">清空</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { UploadUserFile } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()

const fileList = ref<UploadUserFile[]>([])

const goBack = () => {
  router.push('/contact-application/pending-application')
}

const clearFiles = () => {
  fileList.value = []
}

const handleConfirm = () => {
  if (!fileList.value.length) {
    ElMessage.warning('请先选择文件')
    return
  }
  ElMessage.success('已选择文件（示例页面未接入解析/上传接口）')
}
</script>

<style scoped>
.lodging-upload-page {
  padding: 24px;
  min-height: 100vh;
}

.upload-card {
  border-radius: 8px;
}

.upload {
  width: 100%;
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
</style>

