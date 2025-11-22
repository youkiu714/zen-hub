// api/pending-records.ts
import request from '@/utils/request'

// 挂单记录查询接口定义
export interface PendingRecordsQuery {
  gender?: number // 性别（1男 2女）
  keyword?: string // 关键字（姓名/身份证/手机号）
  pageNo?: number // 页码
  pageSize?: number // 每页数量
  visitRange?: string // 挂单次数范围：1-5/6-10/10+
}

// 客人记录项
export interface GuestRecordVO {
  personId?: number
  name?: string
  gender?: number
  idCard?: string
  mobile?: string
  birthDate?: string
  ethnic?: string
  totalCount?: number
  statusName?: string
}

// 分页响应数据
export interface IPageGuestRecordVO {
  records?: GuestRecordVO[]
  total?: number
  size?: number
  current?: number
  pages?: number
}

// 获取挂单记录列表
export function getPendingRecords(query: PendingRecordsQuery) {
  return request.get<any, IPageGuestRecordVO>('/records/guests', {
    params: query
  })
}

// 导出挂单人信息
export function exportPendingRecords(query: Omit<PendingRecordsQuery, 'pageNo' | 'pageSize'>) {
  return request.get('/records/guests/export', {
    params: query,
    responseType: 'blob'
  })
}