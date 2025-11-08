import Cookies from 'js-cookie'

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

// Token 相关
export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY)
}

export const setToken = (token: string, remember = false): void => {
  const options = remember ? { expires: 7 } : undefined
  Cookies.set(TOKEN_KEY, token, options)
}

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY)
}

// 用户信息相关
export const getUserInfo = () => {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const setUserInfo = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const removeUserInfo = (): void => {
  localStorage.removeItem(USER_KEY)
}

// 权限检查
export const hasPermission = (permission: string, userPermissions: string[]): boolean => {
  return userPermissions.includes(permission) || userPermissions.includes('*')
}

export const hasRole = (role: string, userRoles: string[]): boolean => {
  return userRoles.includes(role) || userRoles.includes('admin')
}

// 工具函数
export const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(null, args), delay)
  }
}

export const throttle = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout | null = null
  return (...args: any[]) => {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(null, args)
        timer = null
      }, delay)
    }
  }
}