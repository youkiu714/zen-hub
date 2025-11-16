interface MockUser {
  id: string
  username: string
  email: string
  avatar: string
  roles: string[]
  permissions: string[]
}

// 预设的虚拟用户
export const MOCK_USERS: Record<string, MockUser> = {
  admin: {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@example.com',
    avatar: '',
    roles: ['admin', 'super-admin'],
    permissions: ['*']
  },
  developer: {
    id: 'dev-001',
    username: 'developer',
    email: 'dev@example.com',
    avatar: '',
    roles: ['developer'],
    permissions: ['read', 'write', 'delete']
  },
  user: {
    id: 'user-001',
    username: 'testuser',
    email: 'user@example.com',
    avatar: '',
    roles: ['user'],
    permissions: ['read']
  }
}

// 开发环境配置
export const DEV_CONFIG = {
  BYPASS_LOGIN: process.env.NODE_ENV === 'development',
  AUTO_LOGIN: process.env.NODE_ENV === 'development',
  DEFAULT_USER: 'developer', // admin, developer, user
  ENABLE_CONSOLE_LOGS: true,
  USE_MOCK_API: false // 新增：是否使用Mock API，false表示使用真实API
}

// 在控制台暴露全局函数（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.DEV_TOOLS = {
    MOCK_USERS,

    // 清除认证信息
    clearAuth: () => {
      localStorage.clear()
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      })
      console.log('✅ 已清除所有认证信息')
    }
  }
}