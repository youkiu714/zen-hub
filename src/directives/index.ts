import type { App, Directive } from 'vue'
import { useUserStore } from '@/store/modules/user'

// 权限指令
const permission: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions

    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = value.some(permission => permissions.includes(permission))
      if (!hasPermission) {
        el.style.display = 'none'
      }
    }
  },
  updated(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions

    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = value.some(permission => permissions.includes(permission))
      el.style.display = hasPermission ? '' : 'none'
    }
  }
}

// 角色指令
const role: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const roles = userStore.roles

    if (value && value instanceof Array && value.length > 0) {
      const hasRole = value.some(role => roles.includes(role))
      if (!hasRole) {
        el.style.display = 'none'
      }
    }
  },
  updated(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const roles = userStore.roles

    if (value && value instanceof Array && value.length > 0) {
      const hasRole = value.some(role => roles.includes(role))
      el.style.display = hasRole ? '' : 'none'
    }
  }
}

export function setupDirectives(app: App) {
  app.directive('permission', permission)
  app.directive('role', role)
}