// 申请状态枚举
// 用于筛选的状态枚举
export enum ApplicationStatus {
  DRAFT = 0, // 草稿
  PENDING_REVIEW = 10, // 申请中
  WAITING_CHECKIN = 20, // 待入住
  CHECKED_IN = 30, // 入住中
  CHECKED_OUT = 40, // 已退住
  REJECTED = 70, // 未通过
  CANCELED = 90 // 已取消
}

// 申请状态文案映射
export const APPLICATION_STATUS_MAP: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: '草稿',
  [ApplicationStatus.PENDING_REVIEW]: '申请中',
  [ApplicationStatus.WAITING_CHECKIN]: '待入住',
  [ApplicationStatus.CHECKED_IN]: '入住中',
  [ApplicationStatus.CHECKED_OUT]: '已退住',
  [ApplicationStatus.REJECTED]: '未通过',
  [ApplicationStatus.CANCELED]: '已取消'
}

// 申请状态选项列表（用于下拉框等）
export const APPLICATION_STATUS_OPTIONS = [
  { code: ApplicationStatus.DRAFT, name: '草稿' },
  { code: ApplicationStatus.PENDING_REVIEW, name: '申请中' },
  { code: ApplicationStatus.WAITING_CHECKIN, name: '待入住' },
  { code: ApplicationStatus.CHECKED_IN, name: '入住中' },
  { code: ApplicationStatus.CHECKED_OUT, name: '已退住' },
  { code: ApplicationStatus.REJECTED, name: '未通过' }
]

// 获取状态文案的工具函数
export const getApplicationStatusText = (status: ApplicationStatus | number): string => {
  return APPLICATION_STATUS_MAP[status as ApplicationStatus] || '未知状态'
}

// 获取状态样式类型（用于 Element Plus 的 tag 组件）
export const getApplicationStatusType = (
  status: ApplicationStatus | number
): 'primary' | 'warning' | 'danger' | 'info' | 'success' => {
  switch (status) {
    case ApplicationStatus.CHECKED_IN:
      return 'success'
    case ApplicationStatus.PENDING_REVIEW:
      return 'warning'
    case ApplicationStatus.REJECTED:
      return 'danger'
    case ApplicationStatus.WAITING_CHECKIN:
      return 'primary'
    default:
      return 'info'
  }
}
