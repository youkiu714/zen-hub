// api/cancel-confirmation.ts
import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type {
  PendingCancelItem,
  CancelConfirmationForm,
  CancelConfirmationDetail,
  CancelConfirmationQuery,
  PendingCancelResponse
} from '@/types/cancel-confirmation'

// 获取待退单确认列表
export function getPendingCancelList(query: CancelConfirmationQuery) {
  return request.get<ApiResponse<PendingCancelResponse>>('/cancel-confirmation/pending', {
    params: query
  })
}

// 获取退单确认详情
export function getCancelConfirmationDetail(applicationId: string) {
  return request.get<ApiResponse<CancelConfirmationDetail>>(`/cancel-confirmation/detail/${applicationId}`)
}

// 处理退单确认
export function processCancelConfirmation(form: CancelConfirmationForm) {
  return request.post<ApiResponse<any>>('/cancel-confirmation/process', form)
}

// 批量处理退单确认
export function batchProcessCancelConfirmation(applicationIds: string[], action: 'approve' | 'reject', note?: string) {
  return request.post<ApiResponse<any>>('/cancel-confirmation/batch-process', {
    applicationIds,
    action,
    note
  })
}

// 导出退单确认记录
export function exportCancelConfirmationRecords(query: Omit<CancelConfirmationQuery, 'currentPage' | 'pageSize'>) {
  return request.get('/cancel-confirmation/export', {
    params: query,
    responseType: 'blob'
  })
}