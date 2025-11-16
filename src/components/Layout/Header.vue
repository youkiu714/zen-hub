<template>
  <div class="header">
    <div class="header-left">
      <el-button
        type="text"
        class="collapse-btn"
        @click="toggleSidebar"
      >
        <el-icon>
          <Expand v-if="sidebarCollapsed" />
          <Fold v-else />
        </el-icon>
      </el-button>
    </div>
    
    <div class="header-right">
      <!-- 主题切换 -->
      <!-- <el-tooltip content="主题切换" placement="bottom">
        <el-button
          type="text"
          class="header-btn"
          @click="toggleTheme"
        >
          <el-icon>
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </el-button>
      </el-tooltip>
       -->
      <!-- 全屏 -->
      <el-tooltip content="全屏" placement="bottom">
        <el-button
          type="text"
          class="header-btn"
          @click="toggleFullscreen"
        >
          <el-icon>
            <FullScreen />
          </el-icon>
        </el-button>
      </el-tooltip>
      
      <!-- 用户菜单 -->
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="user?.avatar">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="username">{{ user?.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const isDark = computed(() => appStore.isDark)
const user = computed(() => userStore.user)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const toggleTheme = () => {
  appStore.setTheme({ isDark: !isDark.value })
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
  }
}
</script>

<style scoped lang="scss">
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    .collapse-btn {
      font-size: 18px;
      color: #333;
      margin-left: 10px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .header-btn {
      font-size: 18px;
      color: #333;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      .username {
        font-size: 14px;
        color: #333;
      }
    }
  }
}
</style>