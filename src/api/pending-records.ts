// api/pending-records.ts
import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import type {
  PendingRecordItem,
  PendingRecordDetail,
  PendingHistoryStats,
  PendingHistoryItem,
  PendingRecordsQuery,
  PendingRecordsResponse,
  PendingHistoryResponse
} from '@/types/pending-records'

// 获取挂单人信息列表
export function getPendingRecords(query: PendingRecordsQuery) {
  return request.get<ApiResponse<PendingRecordsResponse>>('/lodging/pending-records/list', {
    params: query
  })
}

// 获取挂单人详细信息
export function getPendingRecordDetail(id: number) {
  return request.get<ApiResponse<PendingRecordDetail>>(`/lodging/pending-records/detail/${id}`)
}

// 获取挂单历史记录
export function getPendingHistory(id: number) {
  return request.get<ApiResponse<PendingHistoryResponse>>(`/lodging/pending-records/history/${id}`)
}

// 导出挂单人信息
export function exportPendingRecords(query: Omit<PendingRecordsQuery, 'currentPage' | 'pageSize'>) {
  return request.get('/lodging/pending-records/export', {
    params: query,
    responseType: 'blob'
  })
}