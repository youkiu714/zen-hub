import request from '@/utils/request'

// 退单记录查询参数
export interface CheckoutQueryParams {
  current?: number
  size?: number
  keyword?: string
  status?: number
  applicationType?: number
  startDate?: string
  endDate?: string
}

// 退单记录项
export interface CheckoutRecord {
  checkoutId: number
  applicationId: number
  applicationNumber: string
  applicantName: string
  gender: number
  age: number
  mobile: string
  idCardMasked: string
  applicationType: number
  checkinDate: string
  checkoutDate: string
  stayDays: number
  status: number
  performanceLevel: number
  actualCheckoutDate: string
}

// 退单记录列表响应
export interface CheckoutListResponse {
  total: number
  current: number
  records: CheckoutRecord[]
  searchCount: boolean
  pages: number
  size: number
}

// 获取退单记录列表
export const getCheckouts = (params: CheckoutQueryParams = {}) => {
  return request.get<CheckoutListResponse>('/checkouts', { params })
}