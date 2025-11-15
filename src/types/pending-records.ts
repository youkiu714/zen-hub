// 挂单记录相关类型定义

// 挂单人信息列表项
export interface PendingRecordItem {
  id: number
  name: string
  gender: string
  idCard: string
  phone: string
  birthDate: string
  ethnic: string
  pendingCount: number
}

// 挂单人详细信息
export interface PendingRecordDetail {
  id: number
  name: string
  gender: string
  idCard: string
  phone: string
  birthDate: string
  ethnic: string
  marital: string
  education: string
  occupation: string
  pendingCount: number
  address: string
  emergencyContact: string
}

// 挂单历史记录统计
export interface PendingHistoryStats {
  totalCount: number
  totalDays: number
  thisYearCount: number
  violationCount: string
}

// 挂单历史记录项
export interface PendingHistoryItem {
  id: number
  pendingDate: string
  leaveDate: string
  duration: string
  roomNumber: string
  roomType: string
  bedNumber: string
  performance: string
  status: string
}

// 搜索和筛选参数
export interface PendingRecordsQuery {
  name?: string
  gender?: string
  pendingCountRange?: string
  currentPage: number
  pageSize: number
}

// 分页响应数据
export interface PendingRecordsResponse {
  total: number
  data: PendingRecordItem[]
}

// 挂单历史记录响应数据
export interface PendingHistoryResponse {
  stats: PendingHistoryStats
  records: PendingHistoryItem[]
}