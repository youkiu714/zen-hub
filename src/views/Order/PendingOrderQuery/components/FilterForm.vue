<template>
  <div class="filter-section">
    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        inline
        class="filter-form"
      >
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入姓名"
            clearable
            style="width: 100px"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="form.gender"
            placeholder="请选择性别"
            clearable
            style="width: 100px"
          >
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
          </el-select>
        </el-form-item>

        <el-form-item label="挂单次数" prop="orderCountRange">
          <el-select
            v-model="form.orderCountRange"
            placeholder="请选择挂单次数范围"
            clearable
            style="width: 100px"
          >
            <el-option label="1-5次" value="1-5" />
            <el-option label="6-10次" value="6-10" />
            <el-option label="10次以上" value="10+" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button
            type="success"
            :loading="exporting"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import type { FilterForm } from './types'

interface Props {
  exporting: boolean
}

interface Emits {
  (e: 'search'): void
  (e: 'reset'): void
  (e: 'export'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const form = reactive<FilterForm>({
  name: '',
  gender: '',
  orderCountRange: ''
})

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  form.name = ''
  form.gender = ''
  form.orderCountRange = ''
  emit('reset')
}

const handleExport = () => {
  emit('export')
}

// 暴露表单数据供父组件使用
defineExpose({
  form
})
</script>

<style scoped lang="scss">
.filter-section {
  margin-bottom: 24px;

  .filter-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .filter-form {
    .el-form-item {
      display: block;
      margin-right: 0;
      margin-bottom: 16px;
    }
  }
}
</style>