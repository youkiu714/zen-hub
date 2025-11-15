// 退单确认相关类型定义

// 待退单确认列表项
export interface PendingCancelItem {
  id: string
  applicationId: string
  applicantName: string
  idCard: string
  avatar: string
  roomInfo: {
    roomNumber: string
    bedNumber: string
    buildingName: string
  }
  checkinDate: string
  expectedCheckout: string
  actualCheckout?: string
  cancelReason: string
  cancelDate: string
  cancelStatus: 'pending' | 'approved' | 'rejected'
  requestedBy: string
  contactPhone: string
}

// 退单确认查询参数
export interface CancelConfirmationQuery {
  keyword?: string
  status?: string
  dateRange?: string[]
  currentPage: number
  pageSize: number
}

// 退单确认处理表单
export interface CancelConfirmationForm {
  applicationId: string
  confirmationAction: 'approve' | 'reject'
  rejectionReason?: string
  refundAmount?: number
  refundMethod?: string
  processNote?: string
}

// 退单确认详情
export interface CancelConfirmationDetail {
  applicationId: string
  applicantInfo: {
    name: string
    idCard: string
    phone: string
    avatar: string
  }
  bookingInfo: {
    checkinDate: string
    expectedCheckout: string
    actualCheckout?: string
    roomNumber: string
    bedNumber: string
    roomType: string
    totalAmount: number
    paidAmount: number
  }
  cancelInfo: {
    cancelReason: string
    cancelDate: string
    requestedBy: string
    contactPhone: string
  }
  status: 'pending' | 'approved' | 'rejected'
  processHistory?: ProcessHistory[]
}

// 处理历史记录
export interface ProcessHistory {
  id: string
  actionTime: string
  action: string
  operator: string
  note?: string
}

// 分页响应数据
export interface PendingCancelResponse {
  total: number
  data: PendingCancelItem[]
}

// 退单原因选项
export interface CancelReasonOption {
  value: string
  label: string
  description: string
}

// 退款方式选项
export interface RefundMethodOption {
  value: string
  label: string
  description: string
}