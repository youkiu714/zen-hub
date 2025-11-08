<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="logo">
      <span v-if="!sidebarCollapsed" class="logo-text">Admin System</span>
    </div>
    
    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="sidebarCollapsed"
      :unique-opened="true"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
    >
      <template v-for="item in menuList" :key="item.path">
        <SidebarItem :item="item" />
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const appStore = useAppStore()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

// 模拟菜单数据
const menuList = ref([
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: {
      title: '首页',
      icon: 'House'
    }
  },
  {
    path: '/system',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'Setting'
    },
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        meta: {
          title: '用户管理',
          icon: 'User'
        }
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        meta: {
          title: '角色管理',
          icon: 'UserFilled'
        }
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        meta: {
          title: '菜单管理',
          icon: 'Menu'
        }
      }
    ]
  }
])
</script>

<style scoped lang="scss">
.sidebar {
  height: 100%;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2b2f3a;
    border-bottom: 1px solid #1f2d3d;
    
    .logo-img {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }
    
    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .el-menu {
    border-right: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #304156;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #48576a;
      border-radius: 2px;
    }
  }
}
</style>