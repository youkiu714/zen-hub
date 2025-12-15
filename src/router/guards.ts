import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/store/modules/user'
import { useTabsStore } from '@/store/modules/tabs'

NProgress.configure({ showSpinner: false })

// 白名单路由（无需登录）
const whiteList = ['/login', '/404', '/403', '/500'] // '/', '/dashboard', 

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    const userStore = useUserStore()
    const isAuthenticated = userStore.isAuthenticated

    // console.log('路由守卫:', { to: to.path, from: from.path, isAuthenticated })

    if (isAuthenticated) {
      if (to.path === '/login') {
        // 检查是否是强制登录（401过期后跳转）
        if (to.query.force === '1') {
          console.log('检测到force参数，允许访问登录页')
          next()
        } else {
          // 已登录，重定向到首页
          console.log('用户已登录但访问登录页，重定向到首页')
          next({ path: '/' })
          NProgress.done()
        }
      } else {
        // 有token，直接放行
        next()
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        console.log('用户未登录但访问白名单路由，放行:', to.path)
        next()
      } else {
        // 重定向到登录页
        console.log('用户未登录，重定向到登录页')
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })

  router.afterEach((to) => {
    NProgress.done()

    // 设置页面标题
    const title = to.meta?.title as string
    if (title) {
      document.title = `${title} - 挂单申请系统`
    }

    // 添加标签页
    const tabsStore = useTabsStore()
    if (to.meta && !to.meta.hidden && to.path !== '/login') {
      tabsStore.addTab(to)
    }
  })

  // 错误处理
  router.onError((error) => {
    NProgress.done()
  })
}
