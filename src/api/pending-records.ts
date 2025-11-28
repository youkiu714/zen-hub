// api/pending-records.ts
import request from '@/utils/request'

// 挂单记录查询接口定义
export interface PendingRecordsQuery {
  departmentCode?: string // 部组编码
  endDate?: string // 结束日期，匹配入住日期
  keyword?: string // 关键字，支持姓名、手机号模糊搜索
  pageNo?: number // 页码
  pageSize?: number // 每页数量
  startDate?: string // 开始日期，匹配入住日期
}

// 挂单记录项
export interface LodgingRecordVO {
  applicationId?: number
  bedChangeCount?: number
  checkinDate?: string
  checkoutDate?: string
  departmentCode?: string
  extensionCount?: number
  mobileMasked?: string
  name?: string
  personId?: number
  stayDays?: number
}

// 接口请求包装
export interface Request<T> {
  code?: number
  data?: T
  message?: string
  success?: boolean
  timestamp?: number
}

// 分页响应数据
export interface IPageLodgingRecordVO {
  records?: LodgingRecordVO[]
  total?: number
  size?: number
  current?: number
  pages?: number
}

// 获取挂单记录列表
export function getPendingRecords(query: PendingRecordsQuery) {
  return request.get<any, IPageLodgingRecordVO>('/records/lodgings', {
    params: query
  })
}

// 导出挂单记录
export function exportPendingRecords(query: Omit<PendingRecordsQuery, 'pageNo' | 'pageSize'>) {
  return request.get('/records/lodgings/export', {
    params: query,
    responseType: 'blob'
  })
}