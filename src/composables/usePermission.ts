import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()

  const permissions = computed(() => userStore.permissions)
  const roles = computed(() => userStore.roles)

  // 检查权限
  const hasPermission = (permission: string | string[]): boolean => {
    if (!permissions.value.length) return false
    
    if (typeof permission === 'string') {
      return permissions.value.includes(permission) || permissions.value.includes('*')
    }
    
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.value.includes(p)) || permissions.value.includes('*')
    }
    
    return false
  }

  // 检查角色
  const hasRole = (role: string | string[]): boolean => {
    if (!roles.value.length) return false
    
    if (typeof role === 'string') {
      return roles.value.includes(role) || roles.value.includes('admin')
    }
    
    if (Array.isArray(role)) {
      return role.some(r => roles.value.includes(r)) || roles.value.includes('admin')
    }
    
    return false
  }

  // 检查是否有任一权限
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission))
  }

  // 检查是否有任一角色
  const hasAnyRole = (roleList: string[]): boolean => {
    return roleList.some(role => hasRole(role))
  }

  return {
    permissions,
    roles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAnyRole
  }
}