import request from '@/utils/request'
import type { LoginForm, User, ApiResponse } from '@/types'

// 登录请求参数类型
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  token: string
  user: User
}

// Mock 用户数据
const mockUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  avatar: '',
  roles: ['admin'],
  permissions: ['dashboard', 'user:read', 'user:write', 'system:manage']
}

// Mock token
const mockToken = 'mock-jwt-token-' + Date.now()

export const loginApi = (data: LoginRequest): Promise<LoginResponse> => {
  return request({
    url: '/api/auth/login',
    method: 'POST',
    data
  })
}

// 登录 - 统一使用mock模式
export const login = async (data: LoginForm): Promise<{ token: string; user: User }> => {
  console.log('当前环境:', {
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    MODE: import.meta.env.MODE
  })

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 简单的用户名密码验证
  if (data.username === 'admin' && data.password === '123456') {
    return {
      token: mockToken,
      user: mockUser
    }
  } else {
    throw new Error('用户名或密码错误')
  }
}

// 获取用户信息 - 统一使用mock模式
export const getUserInfo = async (): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockUser
}

// 刷新 token - 统一使用mock模式
export const refreshToken = async (): Promise<{ token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    token: 'mock-jwt-token-' + Date.now()
  }

  // TODO: 后续可以替换为真实API
  // return request({
  //   url: '/auth/refresh',
  //   method: 'post'
  // })
}

// 登出 - 统一使用mock模式
export const logout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return

  // TODO: 后续可以替换为真实API
  // return request({
  //   url: '/auth/logout',
  //   method: 'post'
  // })
}