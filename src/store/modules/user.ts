import { defineStore } from 'pinia'
import type { User, LoginForm } from '@/types'
import { login } from '@/api/auth'
import {
  getToken,
  setToken,
  removeToken,
  setUserInfo,
  removeUserInfo,
  getUserInfo
} from '@/utils'

interface AuthState {
  token: string
  user: User | null
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): AuthState => {
    const cachedUser = getUserInfo()
    return {
      token: getToken() || '',
      user: cachedUser,
      roles: cachedUser?.roles || [],
      permissions: cachedUser?.permissions || []
    }
  },
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    /**
     * 调用登录接口并持久化令牌/用户信息
     */
    async loginAction(loginForm: LoginForm) {
      const { token, user } = await login(loginForm)
      this.persistAuthState(token, user, loginForm.remember)
      return { token, user }
    },

    /**
     * 将最新的认证数据同步到 Store 和本地存储
     */
    persistAuthState(token: string, user: User, remember?: boolean) {
      this.token = token
      this.user = user
      this.roles = user.roles || []
      this.permissions = user.permissions || []

      setToken(token, remember)
      setUserInfo(user)
    },

    /**
     * 从本地存储恢复认证状态
     */
    restoreAuthFromStorage() {
      const cachedToken = getToken()
      const cachedUser = getUserInfo()

      this.token = cachedToken || ''
      this.user = cachedUser
      this.roles = cachedUser?.roles || []
      this.permissions = cachedUser?.permissions || []
    },

    /**
     * 清空本地和 Store 中的认证信息
     */
    resetState() {
      this.token = ''
      this.user = null
      this.roles = []
      this.permissions = []
      removeToken()
      removeUserInfo()
    }
  }
})
