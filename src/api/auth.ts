import request from '@/utils/request'
import type { LoginForm, User, ApiResponse } from '@/types'

// 登录
export const login = (data: LoginForm): Promise<{ token: string; user: User }> => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = (): Promise<User> => {
  return request({
    url: '/auth/user',
    method: 'get'
  })
}

// 刷新 token
export const refreshToken = (): Promise<{ token: string }> => {
  return request({
    url: '/auth/refresh',
    method: 'post'
  })
}

// 登出
export const logout = (): Promise<void> => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}