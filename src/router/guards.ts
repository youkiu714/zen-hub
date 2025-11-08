import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/store/modules/user'
import { useTabsStore } from '@/store/modules/tabs'
import { getToken } from '@/utils'

// 配置 NProgress
NProgress.configure({ showSpinner: false })

// 白名单路由（无需登录）
const whiteList = ['/login', '/404', '/403', '/500']

export function setupRouterGuards(router: Router) {
  // 前置守卫
  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    const userStore = useUserStore()
    const token = getToken()

    if (token) {
      if (to.path === '/login') {
        // 已登录，重定向到首页
        next({ path: '/' })
        NProgress.done()
      } else {
        // 检查是否有用户信息
        if (!userStore.user) {
          try {
            await userStore.getUserInfo()
            next()
          } catch (error) {
            // 获取用户信息失败，清除 token 并重定向到登录页
            userStore.resetState()
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        } else {
          next()
        }
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })

  // 后置守卫
  router.afterEach((to) => {
    NProgress.done()

    // 设置页面标题
    const title = to.meta?.title as string
    if (title) {
      document.title = `${title} - Vue3 Admin System`
    }

    // 添加标签页
    const tabsStore = useTabsStore()
    if (to.meta && !to.meta.hidden && to.path !== '/login') {
      tabsStore.addTab(to)
    }
  })

  // 错误处理
  router.onError((error) => {
    console.error('Router error:', error)
    NProgress.done()
  })
}