<template>
  <div class="search-filter">
    <el-row :gutter="16">
      <el-col :span="5">
        <el-select v-model="filters.applicationType" placeholder="全部申请类型" clearable>
          <el-option label="全部申请类型" value="" />
          <el-option label="短住" value="short_stay" />
          <el-option label="直通车" value="express" />
          <el-option label="僧亲" value="monk_family" />
          <el-option label="团队挂单" value="team" />
          <el-option label="特殊客人" value="special" />
        </el-select>
      </el-col>

      <el-col :span="5">
        <el-select v-model="filters.dateRange" placeholder="全部日期" clearable>
          <el-option label="全部日期" value="" />
          <el-option label="今天" value="today" />
          <el-option label="本周" value="this_week" />
          <el-option label="本月" value="this_month" />
          <el-option label="本季度" value="this_quarter" />
        </el-select>
      </el-col>

      <el-col :span="8">
        <el-input
          v-model="filters.searchKeyword"
          placeholder="输入申请人姓名或身份证号"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </el-col>

      <el-col :span="6">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FilterOptions } from '../types'

interface Emits {
  (e: 'filter-change', filters: FilterOptions): void
}

const emit = defineEmits<Emits>()

const filters = reactive<FilterOptions>({
  applicationType: '',
  dateRange: '',
  searchKeyword: ''
})

const handleSearch = () => {
  emit('filter-change', { ...filters })
}

const handleReset = () => {
  filters.applicationType = ''
  filters.dateRange = ''
  filters.searchKeyword = ''
  emit('filter-change', { ...filters })
}

// 监听筛选条件变化
watch(
  () => [filters.applicationType, filters.dateRange],
  () => {
    if (filters.searchKeyword) {
      emit('filter-change', { ...filters })
    }
  }
)
</script>

<style scoped lang="scss">
.search-filter {
  margin-bottom: 16px;

  .el-row {
    align-items: center;
  }

  .el-select,
  .el-input {
    width: 100%;
  }
}
</style>