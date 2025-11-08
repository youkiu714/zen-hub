import request from '@/utils/request'
import type { MenuItem } from '@/types'

// 获取菜单列表
export const getMenuList = (): Promise<MenuItem[]> => {
  return request({
    url: '/menu/list',
    method: 'get'
  })
}

// 获取用户菜单
export const getUserMenus = (): Promise<MenuItem[]> => {
  return request({
    url: '/menu/user',
    method: 'get'
  })
}