<!--
 * @Author: zhaoziying zhaoziying@kuaishou.com
 * @Date: 2026-02-01 01:35:51
 * @LastEditors: zhaoziying zhaoziying@kuaishou.com
 * @LastEditTime: 2026-02-01 01:37:54
 * @FilePath: /zen-hub/src/views/Application/components/ApplicationBreadcrumb.vue
 * @Description: 
 * 
 * Copyright (c) 2026 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="breadcrumb-header">
    <div class="breadcrumb-left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in items" :key="item.label" :to="item.to">
          <span v-if="!item.to || index === items.length - 1">{{ item.label }}</span>
          <span v-else>{{ item.label }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

type BreadcrumbItem = {
  label: string
  to?: RouteLocationRaw
}

const props = defineProps<{
  items: BreadcrumbItem[]
  backTo?: RouteLocationRaw
}>()

const router = useRouter()

const handleBack = () => {
  if (props.backTo) {
    router.push(props.backTo)
    return
  }
  router.back()
}
</script>

<style scoped>
.breadcrumb-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.breadcrumb-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8b4513;
}

.back-button {
  font-weight: 600;
}

:deep(.el-breadcrumb__inner) {
  color: #8b4513;
  font-weight: 600;
}
</style>
