import request from '@/utils/request'
import type { LoginForm, User, ApiResponse } from '@/types'
import { DEV_CONFIG, MOCK_USERS, generateMockToken, mockDelay } from '@/utils/dev-tools'

// 登录接口
export const login = async (data: LoginForm): Promise<{ token: string; user: User }> => {
  try {
    const response = await request({
      url: '/auth/login',
      method: 'post',
      data
    })

    if (response && response.token && response.userId) {
      return {
        token: response.token,
        user: {
          id: response.userId,
          username: response.displayName || data.username,
          email: '',
          avatar: '',
          roles: response.roleCode || ['user'],
          permissions: response.permissions || []
        }
      }
    }

    throw new Error('登录响应格式异常')
  } catch (error: any) {
    throw new Error(error.message || '登录失败')
  }
}

// 获取用户信息
export const getUserInfo = async (): Promise<User> => {
  try {
    const response = await request({
      url: '/auth/user',
      method: 'get'
    })

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
    throw new Error(error.message || '获取用户信息失败')
  }
}

// 刷新token
export const refreshToken = async (): Promise<{ token: string }> => {
  try {
    const response = await request({
      url: '/auth/refresh',
      method: 'post'
    })

    if (response && response.token) {
      return {
        token: response.token
      }
    }

    throw new Error('刷新token响应格式异常')
  } catch (error: any) {
    throw new Error(error.message || '刷新token失败')
  }
}

// 退出登录接口
export const logout = async (token?: string): Promise<void> => {
  try {
    await request({
      url: '/auth/logout',
      headers: token ? {'X-Auth-Token': token} : {},
      method: 'post'
    })
  } catch (error) {
    // 即使API失败，也不抛出错误，因为前端仍然需要清理状态
    // 这样确保即使后端有问题，用户也能正常退出
  }
}