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

// 确认退单表单
export interface ConfirmCheckoutPayload {
  actualCheckoutDate: string
  performanceLevel: number
  performanceRemark?: string
  remark?: string
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

// 确认退单
export const confirmCheckout = (checkoutId: number, data: ConfirmCheckoutPayload) => {
  return request.post(`/checkouts/${checkoutId}/confirm`, data)
}

export type CancelConfirmationTabKey = 'pending' | 'refund-confirmation'

export const CANCEL_CONFIRMATION_MAP: Record<CancelConfirmationTabKey, string> = {
  pending: '搜索姓名、证件号或申请编号',
  'refund-confirmation': '搜索姓名、订单号或退单编号'
}


export interface PaginationParams {
  current: number
  pageSize: number
  total: number
}
