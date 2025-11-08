import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TabItem {
  name: string
  path: string
  title: string
  closable: boolean
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([
    {
      name: 'Dashboard',
      path: '/dashboard',
      title: '首页',
      closable: false
    }
  ])
  const activeTab = ref('/dashboard')

  // 添加标签页
  const addTab = (route: RouteLocationNormalized) => {
    const { name, path, meta } = route
    const title = meta?.title as string || '未命名页面'
    
    const existTab = tabs.value.find(tab => tab.path === path)
    if (!existTab) {
      tabs.value.push({
        name: name as string,
        path,
        title,
        closable: true
      })
    }
    activeTab.value = path
  }

  // 移除标签页
  const removeTab = (targetPath: string) => {
    const targetIndex = tabs.value.findIndex(tab => tab.path === targetPath)
    if (targetIndex === -1) return

    const targetTab = tabs.value[targetIndex]
    if (!targetTab.closable) return

    tabs.value.splice(targetIndex, 1)

    // 如果关闭的是当前激活的标签页，需要切换到其他标签页
    if (activeTab.value === targetPath) {
      if (tabs.value.length > 0) {
        const nextTab = tabs.value[targetIndex] || tabs.value[targetIndex - 1]
        activeTab.value = nextTab.path
        return nextTab.path
      }
    }
  }

  // 关闭其他标签页
  const closeOtherTabs = (currentPath: string) => {
    tabs.value = tabs.value.filter(tab => !tab.closable || tab.path === currentPath)
    activeTab.value = currentPath
  }

  // 关闭所有标签页
  const closeAllTabs = () => {
    tabs.value = tabs.value.filter(tab => !tab.closable)
    if (tabs.value.length > 0) {
      activeTab.value = tabs.value[0].path
      return tabs.value[0].path
    }
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    closeOtherTabs,
    closeAllTabs
  }
})