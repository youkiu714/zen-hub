interface MockUser {
  id: string
  username: string
  email: string
  avatar: string
  roles: string[]
  permissions: string[]
}


// 开发环境配置
export const DEV_CONFIG = {
  BYPASS_LOGIN: process.env.NODE_ENV === 'development',
  AUTO_LOGIN: process.env.NODE_ENV === 'development',
  DEFAULT_USER: 'developer',
  ENABLE_CONSOLE_LOGS: true,
  USE_MOCK_API: false
}