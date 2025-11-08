<template>
  <div class="breadcrumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="item.path"
        :to="index === breadcrumbList.length - 1 ? undefined : item.path"
      >
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        {{ item.meta?.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 如果第一个不是首页，添加首页
  if (matched.length > 0 && matched[0].path !== '/dashboard') {
    matched.unshift({
      path: '/dashboard',
      meta: { title: '首页', icon: 'House' }
    } as any)
  }
  
  return matched
})
</script>

<style scoped lang="scss">
.breadcrumb {
  .el-breadcrumb {
    font-size: 14px;
    
    .el-icon {
      margin-right: 5px;
    }
  }
}
</style>