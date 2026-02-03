<template>
  <div class="entry-method-panel">
    <div class="panel-title">请选择挂单方式</div>
    <div class="method-cards">
      <div class="method-card" @click="handleSelect('manual')">
        <div class="method-icon">
          <el-icon><EditPen /></el-icon>
        </div>
        <div class="method-content">
          <div class="method-title">手动填表</div>
          <div class="method-desc">逐项填写人员信息，适合小批量挂单。</div>
        </div>
      </div>
      <div class="method-card" @click="handleSelect('batch')">
        <div class="method-icon">
          <el-icon><UploadFilled /></el-icon>
        </div>
        <div class="method-content">
          <div class="method-title">批量导入</div>
          <div class="method-desc">通过模板一次导入多条挂单人员信息。</div>
        </div>
      </div>
      <div class="method-card" @click="handleSelect('existing')">
        <div class="method-icon">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="method-content">
          <div class="method-title">从已有挂单人员导入</div>
          <div class="method-desc">复用历史挂单记录，快速完成申请。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditPen, UploadFilled, UserFilled } from '@element-plus/icons-vue'

type EntryMethodKey = 'manual' | 'batch' | 'existing'

const emit = defineEmits<{
  (e: 'select', method: EntryMethodKey): void
}>()

const handleSelect = (method: EntryMethodKey) => {
  emit('select', method)
}
</script>

<style scoped>
.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #8a5d2e;
  margin-bottom: 16px;
}

.method-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid #e6d8c5;
  background: #fffdf8;
  transition: all 0.2s ease;
  cursor: pointer;
}

.method-card:hover {
  border-color: #a0733f;
  box-shadow: 0 10px 24px rgba(160, 115, 63, 0.15);
  transform: translateY(-2px);
}

.method-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f3e7d8;
  color: #a0733f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.method-title {
  font-size: 16px;
  font-weight: 700;
  color: #6f4a1f;
}

.method-desc {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #7b6a56;
}
</style>
