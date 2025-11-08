import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginForm } from '@/types'
import { login, getUserInfo as fetchUserInfo, logout as apiLogout } from '@/api/auth'
import { getToken, setToken, removeToken, setUserInfo, removeUserInfo } from '@/utils'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const user = ref<User | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // 登录
  const loginAction = async (loginForm: LoginForm) => {
    try {
      const { token: newToken, user: userInfo } = await login(loginForm)
      
      token.value = newToken
      user.value = userInfo
      roles.value = userInfo.roles
      permissions.value = userInfo.permissions
      
      setToken(newToken, loginForm.remember)
      setUserInfo(userInfo)
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const userInfo = await fetchUserInfo()
      user.value = userInfo
      roles.value = userInfo.roles
      permissions.value = userInfo.permissions
      setUserInfo(userInfo)
      return userInfo
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 登出
  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      token.value = ''
      user.value = null
      roles.value = []
      permissions.value = []
      removeToken()
      removeUserInfo()
    }
  }

  // 重置状态
  const resetState = () => {
    token.value = ''
    user.value = null
    roles.value = []
    permissions.value = []
    removeToken()
    removeUserInfo()
  }

  return {
    token,
    user,
    roles,
    permissions,
    loginAction,
    getUserInfo,
    logout,
    resetState
  }
})