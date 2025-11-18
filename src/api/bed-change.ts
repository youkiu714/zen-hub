// api/bed-change.ts
import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type {
  AvailableForChangeItem,
  AppliedChangeItem,
  BedChangeApplication,
  BedChangeQuery,
  AvailableForChangeResponse,
  AppliedChangeResponse
} from '@/types/bed-change'

// 获取可申请换床列表
export function getAvailableForChange(query: BedChangeQuery) {
  return request.get<ApiResponse<AvailableForChangeResponse>>('/bed-change/available', {
    params: query
  })
}

// 获取已申请换床列表
export function getAppliedChange(query: BedChangeQuery) {
  return request.get<ApiResponse<AppliedChangeResponse>>('/bed-change/applied', {
    params: query
  })
}

// 提交换床申请
export function submitBedChangeApplication(application: BedChangeApplication) {
  return request.post<ApiResponse<any>>('/bed-change/apply', application)
}

// 取消换床申请
export function cancelBedChangeApplication(applicationId: string) {
  return request.post<ApiResponse<any>>(`/bed-change/cancel/${applicationId}`)
}

// 获取申请详情
export function getBedChangeDetail(applicationId: string) {
  return request.get<ApiResponse<any>>(`/bed-change/detail/${applicationId}`)
}