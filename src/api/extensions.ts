import service from '@/utils/request'

// 续单审核参数
export interface ExtensionReviewParams {
  pass: boolean
  comment: string
  scoreRules: number
  scorePractice: number
  scoreBehavior: number
  scoreRemark: string
  adjustCheckoutDate?: string
}

// 续单审核接口
export const reviewExtension = (id: number, params: ExtensionReviewParams) => {
  return service.post(`/extensions/${id}/review`, params)
}


// 续单审核列表参数接口
export interface ExtensionReviewListParams {
  status?: number
  applicationType?: number
  keyword?: string
  startDate?: string
  endDate?: string
  pageNo: number
  pageSize: number
}

// 续单审核列表项接口
export interface ExtensionReviewItem {
  id: number
  applicationId: number
  applicantName: string
  idCardMasked: string
  gender: number
  applicationType: number
  originalCheckoutDate: string
  requestedCheckoutDate: string
  stayDays: number
  status: number
  checkinDate: string
  checkoutDate: string
  mobile: string
  departmentCode: string
}

// 续单审核列表响应接口
export interface ExtensionReviewListResponse {
  code: number
  message: string
  data: {
    total: number
    current: number
    records: ExtensionReviewItem[]
    searchCount: boolean
    pages: number
    size: number
  }
  timestamp: number
  success: boolean
}

// 获取续单审核列表
export const getExtensionReviews = (params: ExtensionReviewListParams): Promise<ExtensionReviewListResponse> => {
  // 添加时间戳防止缓存
  const requestParams = {
    ...params,
  }
  
  console.log('API请求参数:', requestParams)
  console.log('请求URL:', '/extensions/reviews')
  
  return service.get('/extensions/reviews', { 
    params: requestParams,
    // 禁用缓存
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
}

