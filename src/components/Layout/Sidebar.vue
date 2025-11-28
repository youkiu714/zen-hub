<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="logo">
      <span v-if="!sidebarCollapsed" class="logo-text">挂单管理系统</span>
    </div>
    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :collapse="sidebarCollapsed"
      :unique-opened="false"
      :default-openeds="defaultOpeneds"
      background-color="#ffffff"
      text-color="#1a1c1f"
      active-text-color="#326bfb"
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

// 获取所有有子菜单的父菜单路径，用于默认展开
const defaultOpeneds = computed(() => {
  return menuList.value
    .filter((item) => item.children && item.children.length > 0)
    .map((item) => item.path)
})

// 菜单数据 (保留 icon 属性)
const menuList = ref([
  //   {
  //     path: '/dashboard',
  //     name: 'Dashboard',
  //     meta: {
  //       title: '首页',
  //       icon: 'House'
  //     }
  //   },
  {
    path: '/contact-application',
    name: 'ContactApplication',
    meta: {
      title: '对接人申请界面',
      icon: 'UserFilled'
    },
    children: [
      {
        path: '/contact-application/pending-management',
        name: 'PendingManagement',
        meta: {
          title: '挂单管理',
          icon: 'Document'
        }
      },
      {
        path: '/contact-application/pending-application',
        name: 'PendingApplication',
        meta: {
          title: '挂单申请',
          icon: 'Plus'
        }
      }
    ]
  },
  {
    path: '/hall-management',
    name: 'HallManagement',
    meta: {
      title: '客堂管理界面',
      icon: 'OfficeBuilding'
    },
    children: [
      {
        path: '/hall-management/pending-review',
        name: 'PendingOrderReview',
        meta: {
          title: '挂单审核',
          icon: 'Check'
        }
      },
      {
        path: '/hall-management/renewal-review',
        name: 'RenewalReview',
        meta: {
          title: '续单审核',
          icon: 'Refresh'
        }
      },
      {
        path: '/hall-management/check-in-registration',
        name: 'CheckInRegistration',
        meta: {
          title: '入住登记',
          icon: 'House'
        }
      },
      {
        path: '/hall-management/bed-change-application',
        name: 'BedChangeApplication',
        meta: {
          title: '换床申请',
          icon: 'Operation'
        }
      },
      {
        path: '/hall-management/cancel-confirmation',
        name: 'CancelConfirmation',
        meta: {
          title: '退单确认',
          icon: 'Close'
        }
      },
      {
        path: '/hall-management/evaluation-management',
        name: 'EvaluationManagement',
        meta: {
          title: '评价管理',
          icon: 'Star'
        }
      },
      {
        path: '/hall-management/pending-records',
        name: 'PendingOrderQuery',
        meta: {
          title: '挂单记录',
          icon: 'Document'
        }
      }
    ]
  },
  {
    path: '/accommodation-management',
    name: 'AccommodationManagement',
    meta: {
      title: '住宿管理界面',
      icon: 'School'
    },
    children: [
      {
        path: '/hall-management/assignment-management',
        name: 'AssignmentManagement',
        meta: {
          title: '挂单分床',
          icon: 'House'
        }
      },
      {
        path: '/accommodation-management/room-bed-management',
        name: 'RoomBedManagement',
        meta: {
          title: '房间及床位管理',
          icon: 'List'
        }
      },
      {
        path: '/accommodation-management/room-bed-edit',
        name: 'RoomBedEdit',
        meta: {
          title: '房间及床位编辑',
          icon: 'Edit'
        }
      }
    ]
  },
  {
    path: '/person-management',
    name: 'PersonManagement',
    meta: {
      title: '人员管理界面',
      icon: 'School'
    },
    children: [
      {
        path: '/person-management/list',
        name: 'personManagementList',
        meta: {
          title: '人员管理',
          icon: 'List'
        }
      }
    ]
  }
])
</script>

<style scoped lang="scss">
.sidebar {
  height: 100%;
  background-color: #ffffff !important;
  border-right: 1px solid #e6e8eb;
  box-sizing: border-box;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff !important;
    // border-bottom: 1px solid #e6e8eb;

    .logo-img {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }

    .logo-text {
      color: #303133;
      font-size: 16px;
      font-weight: bold;
    }
  }

  :deep(.el-menu--collapse) {
    width: auto !important;
    .el-sub-menu__title {
      display: flex;
      justify-content: center;
      padding: 0;
    }
  }
  :deep(.el-menu-tooltip__trigger) {
    display: flex;
    justify-content: center;
    padding: 0;
  }
  :deep(.el-menu) {
    background-color: #ffffff !important;
    border-right: none;
    // height: calc(100vh - 60px);
    overflow-y: auto;

    // 主菜单项样式
    .el-menu-item {
      background-color: #ffffff !important;
      color: #303133 !important;
      font-weight: 600;
      height: auto;
      min-height: 48px; // 减小高度
      line-height: 1.2;
      padding: 8px 20px; // 减小上下内边距
      box-shadow: none;
      transform: none;

      &:hover,
      &.is-active {
        color: #409eff !important; // #409EFF
        box-shadow: none !important;
      }
    }

    // 子菜单样式
    .el-sub-menu {
      .el-sub-menu__title {
        background-color: #ffffff !important;
        color: #303133 !important;
        font-weight: 600;
        height: auto;
        min-height: 48px; // 减小高度
        line-height: 1.2;
        box-shadow: none;
        transform: none;
        // display: flex;
        // justify-content: center;

        &:hover,
        &.is-opened {
          color: #409eff !important; // #409EFF
        }
      }

      // 子菜单容器
      .el-menu {
        // background-color: #fafbfc !important;
        height: auto !important;
        min-height: auto !important;
        overflow: visible;

        // 子菜单项
        .el-menu-item {
          color: #303133 !important;
          padding-left: 20px !important; // 减小缩进
          //   border-bottom: 1px solid #f0f2f5;
          font-weight: 500;
          height: auto;
          min-height: 40px; // 减小高度
          line-height: 1.2;
          padding-top: 6px; // 减小上下内边距
          padding-bottom: 6px; // 减小上下内边距

          &:hover,
          &.is-active {
            // 统一悬停和选中状态的样式，并显式移除边框和阴影
            background-color: #e6f7ff !important; // #e6f7ff
            color: #409eff !important;
            border: none !important; // 显式移除边框
            box-shadow: none !important; // 显式移除阴影
            outline: none !important; // 显式移除焦点轮廓
            position: relative;

            &::before {
              // 移除左侧蓝色竖条
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 0;
              background-color: transparent;
            }
          }
        }
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c0c4cc;
      border-radius: 3px;
      border: 1px solid #f5f7fa;
      transition: all 0.3s ease;

      &:hover {
        background: #909399;
      }
    }
  }
}
</style>

<style lang="scss">
.el-menu {
  background-color: #ffffff !important;
  border-right: none;
  // height: calc(100vh - 60px);
  overflow-y: auto;

  // 主菜单项样式
  .el-menu-item {
    background-color: #ffffff !important;
    color: #303133 !important;
    font-weight: 600;
    height: auto;
    min-height: 48px; // 减小高度
    line-height: 1.2;
    padding: 8px 20px; // 减小上下内边距
    box-shadow: none;
    transform: none;

    &:hover,
    &.is-active {
      color: #409eff !important; // #409EFF
      box-shadow: none !important;
      background-color: #e6f7ff !important;
    }
  }

  // 子菜单样式
  .el-sub-menu {
    .el-sub-menu__title {
      background-color: #ffffff !important;
      color: #303133 !important;
      font-weight: 600;
      height: auto;
      min-height: 48px; // 减小高度
      line-height: 1.2;
      box-shadow: none;
      transform: none;
      // display: flex;
      // justify-content: center;

      &:hover,
      &.is-opened {
        color: #409eff !important; // #409EFF
      }
    }

    // 子菜单容器
    .el-menu {
      // background-color: #fafbfc !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible;

      // 子菜单项
      .el-menu-item {
        color: #303133 !important;
        padding-left: 20px !important; // 减小缩进
        //   border-bottom: 1px solid #f0f2f5;
        font-weight: 500;
        height: auto;
        min-height: 40px; // 减小高度
        line-height: 1.2;
        padding-top: 6px; // 减小上下内边距
        padding-bottom: 6px; // 减小上下内边距

        &:hover,
        &.is-active {
          // 统一悬停和选中状态的样式，并显式移除边框和阴影
          background-color: #e6f7ff !important; // #e6f7ff
          color: #409eff !important;
          border: none !important; // 显式移除边框
          box-shadow: none !important; // 显式移除阴影
          outline: none !important; // 显式移除焦点轮廓
          position: relative;
          &::before {
            // 移除左侧蓝色竖条
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 0;
            background-color: transparent;
          }
        }
      }
    }
  }
}
</style>
