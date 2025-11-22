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