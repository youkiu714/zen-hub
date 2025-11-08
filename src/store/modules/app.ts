import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ThemeConfig } from '@/types'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const showTabs = ref(true)
  const showBreadcrumb = ref(true)
  const isDark = ref(false)
  const primaryColor = ref('#409EFF')
  const loading = ref(false)

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 设置主题
  const setTheme = (config: Partial<ThemeConfig>) => {
    if (config.isDark !== undefined) {
      isDark.value = config.isDark
      document.documentElement.classList.toggle('dark', config.isDark)
    }
    if (config.primaryColor) {
      primaryColor.value = config.primaryColor
      document.documentElement.style.setProperty('--el-color-primary', config.primaryColor)
    }
    if (config.sidebarCollapsed !== undefined) {
      sidebarCollapsed.value = config.sidebarCollapsed
    }
    if (config.showTabs !== undefined) {
      showTabs.value = config.showTabs
    }
    if (config.showBreadcrumb !== undefined) {
      showBreadcrumb.value = config.showBreadcrumb
    }
  }

  // 设置加载状态
  const setLoading = (status: boolean) => {
    loading.value = status
  }

  return {
    sidebarCollapsed,
    showTabs,
    showBreadcrumb,
    isDark,
    primaryColor,
    loading,
    toggleSidebar,
    setTheme,
    setLoading
  }
})