<template>
  <!-- 有子菜单的情况 -->
  <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </template>
    
    <template v-for="child in item.children" :key="child.path">
      <SidebarItem :item="child" />
    </template>
  </el-sub-menu>
  
  <!-- 没有子菜单的情况 -->
  <el-menu-item v-else :index="item.path">
    <el-icon v-if="item.meta?.icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <template #title>
      <span>{{ item.meta?.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup lang="ts">
interface MenuItem {
  path: string
  name: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
  }
  children?: MenuItem[]
}

defineProps<{
  item: MenuItem
}>()
</script>