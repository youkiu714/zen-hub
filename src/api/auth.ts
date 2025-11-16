import request from '@/utils/request'
import type { LoginForm, User, ApiResponse } from '@/types'
import { DEV_CONFIG, MOCK_USERS, generateMockToken, mockDelay } from '@/utils/dev-tools'
import { log } from 'echarts/types/src/util/log.js';

// 登录接口 - 根据配置选择Mock或真实API
export const login = async (data: LoginForm): Promise<{ token: string; user: User }> => {
  // 如果在开发环境且启用了Mock模式
  if (import.meta.env.DEV && DEV_CONFIG.USE_MOCK_API) {
    console.log('🔧 使用Mock API模式登录')

    await mockDelay(1000) // 模拟网络延迟

    // 查找匹配的用户
    const mockUser = Object.values(MOCK_USERS).find(user => user.username === data.username)

    if (mockUser && data.password === '123456') {
      return {
        token: generateMockToken(mockUser.id),
        user: {
          id: Number(mockUser.id),
          username: mockUser.username,
          email: mockUser.email,
          avatar: mockUser.avatar,
          roles: mockUser.roles,
          permissions: mockUser.permissions
        }
      }
    } else {
      throw new Error('用户名或密码错误 (Mock模式)')
    }
  }

  // 使用真实API
  try {
    console.log('🌐 使用真实API登录:', {
      url: '/auth/login',
      data,
      环境: {
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        MODE: import.meta.env.MODE
      }
    })

    const response = await request({
      url: '/api/auth/login',
      method: 'post',
      data
    })

    console.log(response)

    // 标准化API响应格式
    if (response && response.token && response.userId) {
      return {
        token: response.token,
        user: {
          id: response.userId || 1,
          username: response.displayName || data.username,
          // email: response.user.email || '',
          // avatar: response.user.avatar || '',
          roles: response.roleCode || ['user'],
          permissions: response.permissions || [],
          department:response.departmentCode
        }
      }
    }

    throw new Error('登录响应格式异常')
  } catch (error: any) {
    console.error('登录失败:', error)
    throw new Error(error.message || '登录失败，请检查网络连接')
  }
}

// 获取用户信息 - 根据配置选择Mock或真实API
export const getUserInfo = async (): Promise<User> => {
  // 如果在开发环境且启用了Mock模式
  if (import.meta.env.DEV && DEV_CONFIG.USE_MOCK_API) {
    console.log('🔧 使用Mock API获取用户信息')

    await mockDelay(500) // 模拟网络延迟

    // 根据当前用户类型返回对应的Mock数据
    const mockUser = MOCK_USERS[DEV_CONFIG.DEFAULT_USER as keyof typeof MOCK_USERS] || MOCK_USERS.developer

    return {
      id: Number(mockUser.id),
      username: mockUser.username,
      email: mockUser.email,
      avatar: mockUser.avatar,
      roles: mockUser.roles,
      permissions: mockUser.permissions
    }
  }

  // 使用真实API
  try {
    console.log('🌐 使用真实API获取用户信息:', {
      url: '/auth/user'
    })

    const response = await request({
      url: '/auth/user',
      method: 'get'
    })

    // 标准化API响应格式
    if (response) {
      return {
        id: response.id || 1,
        username: response.username || 'unknown',
        email: response.email || '',
        avatar: response.avatar || '',
        roles: response.roles || ['user'],
        permissions: response.permissions || []
      }
    }

    throw new Error('获取用户信息响应格式异常')
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    throw new Error(error.message || '获取用户信息失败')
  }
}

// 刷新 token - 根据配置选择Mock或真实API
export const refreshToken = async (): Promise<{ token: string }> => {
  // 如果在开发环境且启用了Mock模式
  if (import.meta.env.DEV && DEV_CONFIG.USE_MOCK_API) {
    console.log('🔧 使用Mock API刷新token')

    await mockDelay(500) // 模拟网络延迟

    return {
      token: generateMockToken('refresh-' + Date.now())
    }
  }

  // 使用真实API
  try {
    console.log('🌐 使用真实API刷新token:', {
      url: '/auth/refresh'
    })

    const response = await request({
      url: '/api/auth/refresh',
      method: 'post'
    })

    if (response && response.token) {
      return {
        token: response.token
      }
    }

    throw new Error('刷新token响应格式异常')
  } catch (error: any) {
    console.error('刷新token失败:', error)
    throw new Error(error.message || '刷新token失败')
  }
}

// 登出 - 根据配置选择Mock或真实API
export const logout = async (): Promise<void> => {
  // 如果在开发环境且启用了Mock模式
  if (import.meta.env.DEV && DEV_CONFIG.USE_MOCK_API) {
    console.log('🔧 使用Mock API登出')
    await mockDelay(300) // 模拟网络延迟
    return
  }

  // 使用真实API
  try {
    console.log('🌐 使用真实API登出:', {
      url: '/api/auth/logout'
    })

    await request({
      url: '/aip/auth/logout',
      method: 'post'
    })
  } catch (error: any) {
    console.error('登出失败:', error)
    // 即使登出API失败，也不应该阻止前端清理状态
    // 所以这里不抛出错误，只记录日志
  }
}