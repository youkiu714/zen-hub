import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

// 基础路由（无需权限）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      hidden: true
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限',
      hidden: true
    }
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '服务器错误',
      hidden: true
    }
  }
]

// 动态路由（需要权限）
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/Layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'House',
          affix: true
        }
      },
      // 对接人申请界面子菜单 - 暂时指向现有组件
      {
        path: '/contact-application/pending-management',
        name: 'PendingManagement',
        component: () => import('@/views/Order/PendingOrderManagement/index.vue'),
        meta: {
          title: '挂单管理',
          icon: 'Document'
        }
      },
      {
        path: '/contact-application/pending-application',
        name: 'PendingApplication',
        component: () => import('@/views/Order/OrderApplication/index.vue'),
        meta: {
          title: '挂单申请',
          icon: 'Plus'
        }
      },
      // 客堂管理界面子菜单
      {
        path: '/hall-management/pending-review',
        name: 'PendingOrderReview',
        component: () => import('@/views/Order/ReviewList/index.vue'), // @/views/Order/PendingOrderReview.vue
        meta: {
          title: '挂单审核',
          icon: 'Check'
        }
      },
      {
        path: '/hall-management/renewal-review',
        name: 'RenewalReview',
        component: () => import('@/views/Order/RenewalReview/index.vue'),
        meta: {
          title: '续单审核',
          icon: 'Refresh'
        }
      },
      {
        path: '/hall-management/check-in-registration',
        name: 'CheckInRegistration',
        component: () => import('@/views/Order/CheckInManagement/index.vue'),
        meta: {
          title: '入住管理',
          icon: 'House'
        }
      },
      {
        path: '/hall-management/bed-change-application',
        name: 'BedChangeApplication',
        component: () => import('@/views/Order/BedChangeApplication/index.vue'),
        meta: {
          title: '换床申请',
          icon: 'Operation'
        }
      },
      {
        path: '/hall-management/cancel-confirmation',
        name: 'CancelConfirmation',
        component: () => import('@/views/Order/CancelConfirmation/index.vue'),
        meta: {
          title: '退单确认',
          icon: 'Close'
        }
      },
      {
        path: '/hall-management/evaluation-management',
        name: 'EvaluationManagement',
        component: () => import('@/views/Order/ReviewManagement/index.vue'),
        meta: {
          title: '评价管理',
          icon: 'Star'
        }
      },
      {
        path: '/hall-management/pending-records',
        name: 'PendingOrderQuery',
        component: () => import('@/views/Order/PendingRecords/index.vue'),
        meta: {
          title: '挂单记录',
          icon: 'Document'
        }
      },
      {
        path: '/hall-management/assignment-management',
        name: 'AssignmentManagement',
        component: () => import('@/views/Order/AssignmentManagement/index-qwen.vue'),
        meta: {
          title: '挂单分床',
          icon: 'House'
        }
      },
      // 住宿管理界面子菜单 - 暂时指向现有组件
      {
        path: '/accommodation-management/room-bed-management',
        name: 'RoomBedManagement',
        component: () => import('@/views/Room/Management/index.vue'),
        meta: {
          title: '房间及床位管理',
          icon: 'List'
        }
      },
      {
        path: '/accommodation-management/room-bed-edit',
        name: 'RoomBedEdit',
        component: () => import('@/views/Room/List/index.vue'),
        meta: {
          title: '房间及床位编辑',
          icon: 'Edit'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...asyncRoutes],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 设置路由守卫
setupRouterGuards(router)

export default router
