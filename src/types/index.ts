// 用户相关类型定义
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

// 登录表单类型
export interface LoginForm {
  username: string
  password: string
  captcha: string
  remember: boolean
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 路由元信息类型
export interface RouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  roles?: string[]
  permissions?: string[]
  keepAlive?: boolean
  affix?: boolean
}

// 菜单项类型
export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  roles?: string[]
  permissions?: string[]
}

// 主题配置类型
export interface ThemeConfig {
  primaryColor: string
  isDark: boolean
  sidebarCollapsed: boolean
  showTabs: boolean
  showBreadcrumb: boolean
}