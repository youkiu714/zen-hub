// api/person-profiles.ts
import request from '@/utils/request'

// 人员档案查询接口定义
export interface PersonProfilesQuery {
  departmentCode?: string // 部组编码
  keyword?: string // 关键字（姓名/身份证号/手机号）
  pageNo?: number // 页码
  pageSize?: number // 每页数量
}

// 人员档案项
export interface PersonProfileVO {
  age?: number
  birthDate?: string
  departmentCode?: string
  ethnic?: string
  gender?: number
  idCardMasked?: string
  mobileMasked?: string
  name?: string
  personId?: number
  totalCount?: number
}

// 接口请求包装
export interface Request<T> {
  code?: number
  data?: T
  message?: string
  success?: boolean
  timestamp?: number
}

// 排序项
export interface OrderItem {
  asc?: boolean
  column?: string
}

// 分页响应数据
export interface IPagePersonProfileVO {
  asc?: string[]
  ascs?: string[]
  countId?: string
  current?: number
  desc?: string[]
  descs?: string[]
  hitCount?: boolean
  isSearchCount?: boolean
  maxLimit?: number
  optimizeCountSql?: boolean
  orders?: OrderItem[]
  pages?: number
  records?: PersonProfileVO[]
  searchCount?: boolean
  size?: number
  total?: number
}

// 获取人员档案列表
export function getPersonProfiles(query: PersonProfilesQuery) {
  return request.get<any, IPagePersonProfileVO>('/records/profiles', {
    params: query
  })
}

// 导出人员档案
export function exportPersonProfiles(query: Omit<PersonProfilesQuery, 'pageNo' | 'pageSize'>) {
  return request.get('/records/profiles/export', {
    params: query,
    responseType: 'blob'
  })
}