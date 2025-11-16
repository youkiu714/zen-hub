import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginForm } from '@/types'
import { login } from '@/api/auth'
import { getToken, setToken, removeToken, setUserInfo, removeUserInfo } from '@/utils'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const user = ref<User | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  const loginAction = async (loginForm: LoginForm) => {
    try {
      const { token: newToken, user: userInfo } = await login(loginForm)

      console.log('newToken:', newToken)
      console.log('userInfo:', userInfo)

      token.value = newToken
      user.value = userInfo
      roles.value = userInfo.roles || []
      permissions.value = userInfo.permissions || []

      setToken(newToken, loginForm.remember)
      setUserInfo(userInfo)
      
      ElMessage.success('登录成功')
      
      // 登录成功后跳转
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

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
    resetState
  }
})
