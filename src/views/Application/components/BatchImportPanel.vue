<template>
  <div class="batch-import-panel">
    <div class="panel-title">批量导入</div>
    <el-tabs v-model="activeTab" class="import-tabs">
      <el-tab-pane label="上传文件" name="word">
        <el-upload
          :key="wordUploadKey"
          class="import-uploader"
          action="#"
          :auto-upload="false"
          :file-list="wordFileList"
          :limit="10"
          accept=".doc,.docx"
          multiple
          :disabled="wordBusy"
          :show-file-list="false"
          :before-upload="handleWordBeforeUpload"
          :on-change="handleWordChange"
          :on-remove="handleWordRemove"
        >
          <div class="upload-box">
            <div class="upload-icon">
              <el-icon><UploadFilled /></el-icon>
            </div>
            <div class="upload-title">批量上传人员文档</div>
            <div class="upload-desc">支持 doc/docx，最多10个文件</div>
          </div>
        </el-upload>

        <div v-if="wordFileList.length" class="upload-list" :class="{ 'is-disabled': wordBusy }">
          <div v-if="isWordParsing" class="list-progress">
            <div class="list-progress-text">
              解析进度：{{ progressData.processed }}/{{ progressData.total }}
            </div>
            <el-progress :percentage="parseProgress" :stroke-width="6" />
          </div>
          <div class="list-header">
            <span>已上传文件（{{ wordFileList.length }}）</span>
            <el-button link type="danger" :disabled="wordBusy" @click="handleWordClearAll">删除全部</el-button>
          </div>
          <div class="list-items">
            <div v-for="file in wordFileList" :key="file.uid" class="list-item">
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
                <span v-if="wordFileStatus(file.name)" class="file-status">
                  {{ wordFileStatus(file.name) }}
                </span>
                <span v-if="wordFileError(file.name)" class="file-error">
                  {{ wordFileError(file.name) }}
                </span>
              </div>
              <el-button link type="danger" size="small" :disabled="wordBusy" @click="handleWordRemoveByUid(file.uid)">
                删除
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="wordFileList.length" class="submit-actions">
          <el-button type="primary" :loading="wordSubmitting" :disabled="wordBusy" @click="handleSubmitWord">
            确认提交
          </el-button>
        </div>
        <div v-if="wordSubmitting" class="submit-progress">
          <el-progress :percentage="wordDisplayProgress" :stroke-width="6" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="上传压缩包" name="archive">
        <el-upload
          class="import-uploader"
          action="#"
          :auto-upload="false"
          :file-list="archiveFileList"
          :limit="1"
          accept=".zip,.rar,.7z"
          :multiple="false"
          :disabled="archiveBusy"
          :show-file-list="false"
          :before-upload="handleArchiveBeforeUpload"
          :on-change="handleArchiveChange"
          :on-remove="handleArchiveRemove"
        >
          <div class="upload-box">
            <div class="upload-icon">
              <el-icon><UploadFilled /></el-icon>
            </div>
            <div class="upload-title">批量上传压缩包</div>
            <div class="upload-desc">支持 zip/rar/7z，仅限单个文件</div>
          </div>
        </el-upload>

        <div v-if="archiveFileList.length" class="upload-list" :class="{ 'is-disabled': archiveBusy }">
          <div v-if="isArchiveParsing" class="list-progress">
            <div class="list-progress-text">
              解析进度：{{ progressData.processed }}/{{ progressData.total }}
            </div>
            <el-progress :percentage="parseProgress" :stroke-width="6" />
          </div>
          <div class="list-header">
            <span>已上传文件（{{ archiveFileList.length }}）</span>
            <el-button link type="danger" :disabled="archiveBusy" @click="handleArchiveClearAll">
              删除全部
            </el-button>
          </div>
          <div class="list-items">
            <div v-for="file in archiveFileList" :key="file.uid" class="list-item">
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
                <span v-if="archiveFileStatus(file.name)" class="file-status">
                  {{ archiveFileStatus(file.name) }}
                </span>
                <span v-if="archiveFileError(file.name)" class="file-error">
                  {{ archiveFileError(file.name) }}
                </span>
              </div>
              <el-button
                link
                type="danger"
                size="small"
                :disabled="archiveBusy"
                @click="handleArchiveRemoveByUid(file.uid)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="archiveFileList.length" class="submit-actions">
          <el-button
            type="primary"
            :loading="archiveSubmitting"
            :disabled="archiveBusy"
            @click="handleSubmitArchive"
          >
            确认提交
          </el-button>
        </div>
        <div v-if="archiveSubmitting" class="submit-progress">
          <el-progress :percentage="archiveDisplayProgress" :stroke-width="6" />
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles, UploadUserFile } from 'element-plus'
import {
  getWordImportProgress,
  uploadWordImportArchive,
  uploadWordImportFiles
} from '@/api/word-import'

const activeTab = ref<'word' | 'archive'>('word')
const wordFileList = ref<UploadUserFile[]>([])
const archiveFileList = ref<UploadUserFile[]>([])
const wordUploadKey = ref(0)
const wordSubmitting = ref(false)
const archiveSubmitting = ref(false)
const wordProgress = ref(0)
const archiveProgress = ref(0)
const wordParsing = ref(false)
const archiveParsing = ref(false)
const progressMode = ref<'word' | 'archive' | null>(null)
const progressData = ref({
  taskId: '',
  status: '',
  total: 0,
  processed: 0,
  successCount: 0,
  failCount: 0,
  errors: [] as { fileName: string; message: string }[]
})
let progressTimer: number | null = null

const props = defineProps<{
  applicationType: number | null
}>()

const parseProgress = computed(() => {
  if (!progressData.value.total) {
    return 0
  }
  return Math.min(
    100,
    Math.round((progressData.value.processed / progressData.value.total) * 100)
  )
})

const wordBusy = computed(() => wordSubmitting.value || wordParsing.value)
const archiveBusy = computed(() => archiveSubmitting.value || archiveParsing.value)
const isWordParsing = computed(() => progressMode.value === 'word' && wordParsing.value)
const isArchiveParsing = computed(() => progressMode.value === 'archive' && archiveParsing.value)
const showWordResult = computed(() => progressMode.value === 'word' && Boolean(progressData.value.taskId))
const showArchiveResult = computed(() => progressMode.value === 'archive' && Boolean(progressData.value.taskId))
const wordDisplayProgress = computed(() =>
  wordSubmitting.value ? wordProgress.value : progressMode.value === 'word' ? parseProgress.value : 0
)
const archiveDisplayProgress = computed(() =>
  archiveSubmitting.value
    ? archiveProgress.value
    : progressMode.value === 'archive'
      ? parseProgress.value
      : 0
)

const wordExtensions = ['doc', 'docx']
const archiveExtensions = ['zip', 'rar', '7z']

const getFileExtension = (name: string) => {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

const handleWordBeforeUpload = (rawFile: File) => {
  const ext = getFileExtension(rawFile.name)
  if (!wordExtensions.includes(ext)) {
    ElMessage.warning('仅支持 .doc / .docx 文件')
    return false
  }
  if (wordFileList.value.length >= 10) {
    ElMessage.warning('最多上传10个Word文件')
    return false
  }
  return true
}

const handleArchiveBeforeUpload = (rawFile: File) => {
  const ext = getFileExtension(rawFile.name)
  if (!archiveExtensions.includes(ext)) {
    ElMessage.warning('仅支持 .zip / .rar / .7z 文件')
    return false
  }
  if (archiveFileList.value.length >= 1) {
    ElMessage.warning('仅支持上传一个压缩包')
    return false
  }
  return true
}

const handleWordChange = (file: UploadFile) => {
  if (wordFileList.value.length >= 10) {
    ElMessage.warning('最多上传10个Word文件')
    wordUploadKey.value += 1
    return
  }
  const exists = wordFileList.value.some(
    (item) => item.name === file.name && item.size === file.size
  )
  if (!exists) {
    wordFileList.value = [...wordFileList.value, file]
  } else {
    ElMessage.warning('该文件已上传')
  }
  wordUploadKey.value += 1
}

const handleWordRemove = (file: UploadFile) => {
  wordFileList.value = wordFileList.value.filter((item) => item.uid !== file.uid)
}

const handleWordRemoveByUid = (uid: string | number) => {
  wordFileList.value = wordFileList.value.filter((file) => file.uid !== uid)
}

const handleWordClearAll = () => {
  wordFileList.value = []
}

const handleArchiveChange = (_file: UploadFile, files: UploadFiles) => {
  archiveFileList.value = files
}

const handleArchiveRemove = (_file: UploadFile, files: UploadFiles) => {
  archiveFileList.value = files
}

const handleArchiveRemoveByUid = (uid: string | number) => {
  archiveFileList.value = archiveFileList.value.filter((file) => file.uid !== uid)
}

const handleArchiveClearAll = () => {
  archiveFileList.value = []
}

const collectRawFiles = (list: UploadUserFile[]) =>
  list.map((item) => item.raw).filter((file): file is File => Boolean(file))

const handleSubmitWord = async () => {
  if (!props.applicationType) {
    ElMessage.warning('缺少挂单类型，请返回上一步选择')
    return
  }
  const files = collectRawFiles(wordFileList.value)
  if (!files.length) {
    ElMessage.warning('请先上传文件')
    return
  }
  wordProgress.value = 0
  wordSubmitting.value = true
  try {
    const result = await uploadWordImportFiles(props.applicationType, files, (percent) => {
      wordProgress.value = percent
    })
    const taskId = typeof result === 'string' ? result : result?.taskId
    ElMessage.success('提交成功')
    wordProgress.value = 0
    if (taskId) {
      wordParsing.value = true
      startProgressPolling(taskId, 'word')
    }
  } finally {
    wordSubmitting.value = false
  }
}

const handleSubmitArchive = async () => {
  if (!props.applicationType) {
    ElMessage.warning('缺少挂单类型，请返回上一步选择')
    return
  }
  const files = collectRawFiles(archiveFileList.value)
  if (!files.length) {
    ElMessage.warning('请先上传文件')
    return
  }
  const file = files[0]
  if (!file) {
    ElMessage.warning('请先上传文件')
    return
  }
  archiveProgress.value = 0
  archiveSubmitting.value = true
  try {
    const result = await uploadWordImportArchive(props.applicationType, file, (percent) => {
      archiveProgress.value = percent
    })
    ElMessage.success('提交成功')
    const taskId = typeof result === 'string' ? result : result?.taskId
    archiveProgress.value = 0
    if (taskId) {
      archiveParsing.value = true
      startProgressPolling(taskId, 'archive')
    }
  } finally {
    archiveSubmitting.value = false
  }
}

const progressErrors = computed(() => progressData.value.errors || [])
const progressErrorMap = computed(() => {
  const map = new Map<string, string>()
  progressErrors.value.forEach((item) => {
    map.set(item.fileName, item.message)
  })
  return map
})

const stopProgressPolling = () => {
  if (progressTimer) {
    window.clearInterval(progressTimer)
    progressTimer = null
  }
}

const startProgressPolling = (taskId: string, mode: 'word' | 'archive') => {
  progressMode.value = mode
  progressData.value = {
    taskId,
    status: '',
    total: 0,
    processed: 0,
    successCount: 0,
    failCount: 0,
    errors: []
  }
  stopProgressPolling()
  const poll = async () => {
    try {
      const data = await getWordImportProgress(taskId)
      progressData.value = data
      if (data.status && ['SUCCESS', 'FAILED', 'FINISHED', 'DONE'].includes(data.status)) {
        stopProgressPolling()
        if (mode === 'word') {
          wordParsing.value = false
        } else {
          archiveParsing.value = false
        }
      }
    } catch (error) {
      stopProgressPolling()
      if (mode === 'word') {
        wordParsing.value = false
      } else {
        archiveParsing.value = false
      }
      ElMessage.error('获取解析进度失败')
    }
  }
  poll()
  progressTimer = window.setInterval(poll, 2000)
}

onBeforeUnmount(() => {
  stopProgressPolling()
})

const formatSize = (size?: number) => {
  if (!size && size !== 0) {
    return ''
  }
  if (size < 1024) {
    return `${size} B`
  }
  const kb = size / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

const getStatusLabel = (fileName: string) => {
  const hasError = progressErrorMap.value.has(fileName)
  if (hasError) return '解析失败'
  if (['SUCCESS', 'FAILED', 'FINISHED', 'DONE'].includes(progressData.value.status)) {
    return '解析成功'
  }
  return '解析中'
}

const wordFileStatus = (fileName: string) => (showWordResult.value ? getStatusLabel(fileName) : '')
const archiveFileStatus = (fileName: string) => (showArchiveResult.value ? getStatusLabel(fileName) : '')
const wordFileError = (fileName: string) =>
  showWordResult.value ? progressErrorMap.value.get(fileName) || '' : ''
const archiveFileError = (fileName: string) =>
  showArchiveResult.value ? progressErrorMap.value.get(fileName) || '' : ''
</script>

<style scoped>
.batch-import-panel {
  width: 100%;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #8a5d2e;
  margin-bottom: 16px;
}

.import-tabs {
  margin-top: 4px;
}

.import-uploader {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-box {
  border: 1px dashed #e5d8c6;
  border-radius: 16px;
  background: #faf6ef;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
}

.upload-box:hover {
  border-color: #a0733f;
  box-shadow: 0 10px 20px rgba(160, 115, 63, 0.12);
}

.upload-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f2e6d4;
  color: #a0733f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.upload-title {
  font-size: 16px;
  font-weight: 700;
  color: #6f4a1f;
}

.upload-desc {
  font-size: 13px;
  color: #8c7b67;
}

.upload-button {
  border-radius: 999px;
  padding: 6px 22px;
}

.upload-tip {
  font-size: 13px;
  color: #7b6a56;
}

.upload-list {
  margin-top: 24px;
  border: 1px solid #efe2cf;
  border-radius: 12px;
  background: #fffdf8;
  padding: 16px;
}

.submit-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.submit-progress {
  margin-top: 12px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #6f4a1f;
  margin-bottom: 12px;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #f0e2cf;
}

.list-progress {
  margin-bottom: 12px;
}

.list-progress-text {
  font-size: 12px;
  color: #8c7b67;
  margin-bottom: 6px;
}

.is-disabled {
  opacity: 0.7;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #6f4a1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 360px;
}

.file-size {
  font-size: 12px;
  color: #9d8a74;
}

.file-status {
  font-size: 12px;
  color: #8c7b67;
}

.file-error {
  font-size: 12px;
  color: #b3472f;
}
</style>
