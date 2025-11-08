<template>
  <div class="tabs">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-remove="removeTab"
      @tab-click="handleTabClick"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.path"
        :label="tab.title"
        :name="tab.path"
        :closable="tab.closable"
      />
    </el-tabs>
    
    <!-- 右键菜单 -->
    <el-dropdown
      trigger="contextmenu"
      @command="handleContextMenu"
    >
      <span></span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <el-icon><Refresh /></el-icon>
            刷新页面
          </el-dropdown-item>
          <el-dropdown-item command="closeOthers">
            <el-icon><Close /></el-icon>
            关闭其他
          </el-dropdown-item>
          <el-dropdown-item command="closeAll">
            <el-icon><CircleClose /></el-icon>
            关闭所有
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/store/modules/tabs'
import type { TabsPaneContext } from 'element-plus'

const router = useRouter()
const tabsStore = useTabsStore()

const tabs = computed(() => tabsStore.tabs)
const activeTab = computed({
  get: () => tabsStore.activeTab,
  set: (value: string) => {
    tabsStore.activeTab = value
  }
})

const removeTab = (targetPath: string) => {
  const nextPath = tabsStore.removeTab(targetPath)
  if (nextPath) {
    router.push(nextPath)
  }
}

const handleTabClick = (tab: TabsPaneContext) => {
  const path = tab.paneName as string
  router.push(path)
}

const handleContextMenu = (command: string) => {
  switch (command) {
    case 'refresh':
      window.location.reload()
      break
    case 'closeOthers':
      tabsStore.closeOtherTabs(activeTab.value)
      break
    case 'closeAll':
      const nextPath = tabsStore.closeAllTabs()
      if (nextPath) {
        router.push(nextPath)
      }
      break
  }
}
</script>

<style scoped lang="scss">
.tabs {
  .el-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      border-bottom: none;
      
      .el-tabs__nav {
        border: none;
      }
      
      .el-tabs__item {
        border: 1px solid #e4e7ed;
        margin-right: 5px;
        border-radius: 4px 4px 0 0;
        
        &.is-active {
          background: #409EFF;
          color: #fff;
          border-color: #409EFF;
        }
      }
    }
  }
}
</style>