/**
 * 开发者工具 - 用于开发环境的便捷功能
 */

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
  ENABLE_CONSOLE_LOGS: true
}

// 生成虚拟token
export const generateMockToken = (userId: string): string => {
  return `mock-token-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 快速登录函数
export const quickLogin = (userType: keyof typeof MOCK_USERS = 'developer') => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ 此功能仅在开发环境可用')
    return
  }

  const mockUser = MOCK_USERS[userType]
  const mockToken = generateMockToken(mockUser.id)

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log(`🚀 快速登录 - 用户类型: ${userType}`)
    console.log('👤 用户信息:', mockUser)
    console.log('🔑 Token:', mockToken)
  }

  return {
    user: mockUser,
    token: mockToken
  }
}

// 模拟API延迟
export const mockDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 在控制台暴露全局函数（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.DEV_TOOLS = {
    quickLogin,
    MOCK_USERS,
    generateMockToken,
    mockDelay,

    // 便捷登录方法
    loginAsAdmin: () => quickLogin('admin'),
    loginAsDev: () => quickLogin('developer'),
    loginAsUser: () => quickLogin('user'),

    // 清除认证信息
    clearAuth: () => {
      localStorage.clear()
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      })
      console.log('✅ 已清除所有认证信息')
    }
  }

  console.log(`
🛠️  开发者工具已加载！

使用方法：
- window.DEV_TOOLS.loginAsAdmin()  // 以管理员身份登录
- window.DEV_TOOLS.loginAsDev()    // 以开发者身份登录
- window.DEV_TOOLS.loginAsUser()   // 以普通用户身份登录
- window.DEV_TOOLS.clearAuth()     // 清除认证信息

当前用户类型: ${DEV_CONFIG.DEFAULT_USER}
自动登录: ${DEV_CONFIG.AUTO_LOGIN ? '✅' : '❌'}
  `)
}