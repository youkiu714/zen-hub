<template>
  <el-dialog
    v-model="visible"
    title="导出评价记录"
    width="500px"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="导出范围">
        <el-radio-group v-model="form.range">
          <el-radio label="current">当前页记录</el-radio>
          <el-radio label="filtered">筛选后记录</el-radio>
          <el-radio label="all">全部记录</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="导出格式">
        <el-radio-group v-model="form.format">
          <el-radio label="excel">Excel (.xlsx)</el-radio>
          <el-radio label="csv">CSV (.csv)</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport" :loading="exporting">
          确认导出
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { ExportForm } from '@/types/evaluation'

// Props
interface Props {
  visible: boolean
  form: ExportForm
  exporting: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  form: () => ({
    range: 'current',
    format: 'excel'
  }),
  exporting: false
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
  'confirm-export': []
}>()

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 方法
const handleClose = () => {
  emit('close')
}

const handleConfirmExport = () => {
  emit('confirm-export')
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>