<template>
  <div class="layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="sidebar">
        <Sidebar />
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <!-- 顶部导航 -->
        <el-header class="header">
          <Header />
        </el-header>

        <!-- 标签页 -->
        <div v-if="showTabs" class="tabs-container">
          <Tabs />
        </div>

        <!-- 面包屑 -->
        <div v-if="showBreadcrumb" class="breadcrumb-container">
          <Breadcrumb />
        </div>

        <!-- 主内容 -->
        <el-main class="main">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 全局加载 -->
    <el-loading
      v-if="loading"
      element-loading-text="加载中..."
      element-loading-background="rgba(0, 0, 0, 0.8)"
      fullscreen
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Tabs from './Tabs.vue'
import Breadcrumb from './Breadcrumb.vue'

const appStore = useAppStore()

const sidebarWidth = computed(() => 
  appStore.sidebarCollapsed ? '64px' : '200px'
)

const showTabs = computed(() => appStore.showTabs)
const showBreadcrumb = computed(() => appStore.showBreadcrumb)
const loading = computed(() => appStore.loading)

// 缓存的视图组件
const cachedViews = computed(() => [])
</script>

<style scoped lang="scss">
.layout {
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  height: 100vh;
}

.sidebar {
  background: #304156;
  transition: width 0.3s;
  height: 100vh;
  overflow-y: auto;
}

.main-container {
  height: 100vh;
  overflow: hidden;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 60px;
  flex-shrink: 0;
}

.tabs-container {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  flex-shrink: 0;
}

.breadcrumb-container {
  background: #fdf6e3; // #f5f5f5
  padding: 10px 20px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.main {
  background: #fdf6e3; // #f5f5f5
  padding: 0px;
  padding-bottom: 0px;
  overflow-y: auto;
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>