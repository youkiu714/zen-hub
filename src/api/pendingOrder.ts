import request from '@/utils/request'
import type { LoginForm, User, ApiResponse, OrderItem,  ApplicationSubmitRequest} from '@/types'

// 挂单申请相关类型定义
export interface PendingOrderRecord {
  id: number
  personId: number
  applicationType: number
  checkinDate: string
  checkoutDate: string
  specialRequest: string
  recommenderName: string
  recommenderPhone: string
  recommenderRelation: string
  recommenderComment: string
  status: number
  reviewStatus: number
  createdBy?: number
  updatedBy?: number
  isDeleted: number
  createdAt?: string
  updatedAt?: string
  personSnapshot: string
  practiceSnapshot: string
}

export interface PersonSnapshot {
  city: string
  name: string
  major: string
  ethnic: string
  gender: number // 1: 男, 2: 女
  idCard: string
  mobile: string
  school: string
  skills: string
  weChat: string
  address: string
  marital: string
  photoUrl?: string
  province: string
  education: string
  occupation: string
  diseaseHistory: string
  emergencyContacts: EmergencyContact[]
  infectiousHistory: string
  medicationHistory: string
}

export interface EmergencyContact {
  sortNo: number
  contactName: string
  contactPhone: string
}

export interface PracticeSnapshot {
  visitRecords: string
  refugeTakenDate: string
  yearsOfPractice: number
  hasTakenPrecepts: boolean
  pastPracticeExperience: string
  currentPracticeExperience: string
}

export interface PendingOrderQueryParams {
  name?: string
  mobile?: string
  status?: number
  reviewStatus?: number
  startDate?: string
  endDate?: string
  current?: number
  size?: number
}

export interface PendingOrderResponse {
  code: number
  message: string
  data: {
    records: PendingOrderRecord[]
    total: number
    size: number
    current: number
    pages: number
  }
  timestamp: number
  success: boolean
}

export interface ApprovalRequest {
  id: number
  status: number // 20: 通过, 30: 拒绝
  comment?: string
}

// API 接口定义
export const pendingOrderApi = {
  // 获取挂单申请列表
  getList(params: PendingOrderQueryParams): Promise<PendingOrderResponse> {
    return request({
      url: '/pending-order/list',
      method: 'get',
      params
    })
  },

  // 获取挂单申请详情
  getDetail(id: number): Promise<{ code: number; message: string; data: PendingOrderRecord }> {
    return request({
      url: `/pending-order/${id}`,
      method: 'get'
    })
  },

  // 审核挂单申请
  approve(data: ApprovalRequest): Promise<{ code: number; message: string }> {
    return request({
      url: '/pending-order/approve',
      method: 'post',
      data
    })
  },

  // 拒绝挂单申请
  reject(data: ApprovalRequest): Promise<{ code: number; message: string }> {
    return request({
      url: '/pending-order/reject',
      method: 'post',
      data
    })
  },

  // 批量审核
  batchApprove(ids: number[], status: number): Promise<{ code: number; message: string }> {
    return request({
      url: '/pending-order/batch-approve',
      method: 'post',
      data: { ids, status }
    })
  },

  // 导出挂单申请列表
  export(params: PendingOrderQueryParams): Promise<Blob> {
    return request({
      url: '/pending-order/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 删除挂单申请
  delete(id: number): Promise<{ code: number; message: string }> {
    return request({
      url: `/pending-order/${id}`,
      method: 'delete'
    })
  },

  // 批量删除
  batchDelete(ids: number[]): Promise<{ code: number; message: string }> {
    return request({
      url: '/pending-order/batch-delete',
      method: 'post',
      data: { ids }
    })
  }
}

// 工具函数：解析 JSON 字符串
export const parsePersonSnapshot = (snapshot: string): PersonSnapshot => {
  try {
    return JSON.parse(snapshot)
  } catch (error) {
    console.error('解析 personSnapshot 失败:', error)
    return {} as PersonSnapshot
  }
}

export const parsePracticeSnapshot = (snapshot: string): PracticeSnapshot => {
  try {
    return JSON.parse(snapshot)
  } catch (error) {
    console.error('解析 practiceSnapshot 失败:', error)
    return {} as PracticeSnapshot
  }
}

// 工具函数：状态映射
export const getStatusType = (status: number): string => {
  const statusMap = {
    10: 'warning', // 待审核
    20: 'success', // 已通过
    30: 'danger'   // 已拒绝
  }
  return statusMap[status] || 'info'
}

export const getStatusText = (status: number): string => {
  const statusMap = {
    10: '待审核',
    20: '已通过',
    30: '已拒绝'
  }
  return statusMap[status] || '未知'
}

export const getReviewStatusType = (status: number): string => {
  return getStatusType(status)
}

export const getReviewStatusText = (status: number): string => {
  return getStatusText(status)
}

export const getGenderText = (gender: number): string => {
  return gender === 1 ? '男' : '女'
}


import type { OrderListResponse } from '@/types/order';

export const applications = (data: ApplicationSubmitRequest): Promise<{
  code: number
  message: string
  data: any
  success: boolean
  timestamp: number
}> => {
  return request({
    url: '/api/apply/applications',
    method: 'post',
    data
  })
}