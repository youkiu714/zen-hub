import request from '@/utils/request'
import { Request, IPageApplicationListItemVO } from '@/types/application'
import type { ApplicationDetailVO } from '@/views/Order/PendingOrderManagement/components/types'

export function getApplications(params: {
  pageNo: number
  pageSize: number
  keyword?: string
  applicationType?: number
  departmentCode?: string
  status?: number
  checkinFrom?: string
  checkinTo?: string
}) {
  return request.get<IPageApplicationListItemVO, IPageApplicationListItemVO>(
    '/apply/applications',
    {
      params
    }
  )
}

export function getApplicationById(id: number) {
  return request.get<Request<ApplicationDetailVO>>(`/apply/applications/${id}`)
}

export function getVolunteerPerformanceById(id: number) {
  return request.get<Request<ApplicationDetailVO>>(`extensions/${id}/volunteer-performance`)
}

// 取消申请
export function cancelApplication(id: number) {
  return request.post<Request<any>>(`/apply/${id}/cancel`)
}

// 修改挂单信息
export function updateLodgingInfo(
  id: number,
  data: {
    lodging: {
      applicationType: number
      checkinDate: string
      checkoutDate: string
      shortStayReason: string
      departureDate: string
      returnDate: string
      recommenderComment: string
      departmentCode: string
    }
  }
) {
  return request.post<Request<any>>(`/apply/${id}/update-lodging`, data)
}

// 申请续住
export function applyRenew(params: {
  applicationId: number
  originalCheckoutDate: string
  requestedCheckoutDate: string
  reason: string
}) {
  return request.post<Request<any>>(`/extensions`, params)
}

// 申请退单
export function applyWithdraw(params: {
  applicationId: number
  originalCheckoutDate: string
  actualCheckoutDate: string
}) {
  return request.post<Request<any>>(`/checkouts`, params)
}
