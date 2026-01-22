// 申请状态枚举
// 用于筛选的状态枚举
export enum ApplicationStatus {
  DRAFT = 0, // 草稿
  PENDING_REVIEW = 10, // 申请中
  WAITING_CHECKIN = 20, // 待入住
  CHECKED_IN = 30, // 入住中
  CHECKED_OUT = 40, // 已退住
RENEWAL_REVIEW_SUCCESS = 50, // 续住审核通过
  RENEWAL_REVIEW_REJECTED = 60, // 续住审核拒绝
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
  [ApplicationStatus.RENEWAL_REVIEW_SUCCESS]: '续住审核通过',
  [ApplicationStatus.RENEWAL_REVIEW_REJECTED]: '续住审核拒绝',
  [ApplicationStatus.CANCELED]: '已取消'
}

// 申请状态选项列表（用于下拉框等）
export const APPLICATION_STATUS_OPTIONS = [
  { code: ApplicationStatus.DRAFT, name: '草稿' },
  { code: ApplicationStatus.PENDING_REVIEW, name: '申请中' },
  { code: ApplicationStatus.WAITING_CHECKIN, name: '待入住' },
  { code: ApplicationStatus.CHECKED_IN, name: '入住中' },
  { code: ApplicationStatus.CHECKED_OUT, name: '已退住' },
  { code: ApplicationStatus.REJECTED, name: '未通过' },
  { code: ApplicationStatus.RENEWAL_REVIEW_SUCCESS, name: '续住审核通过' },
  { code: ApplicationStatus.RENEWAL_REVIEW_REJECTED, name: '续住审核拒绝' },
  { code: ApplicationStatus.CANCELED, name: '已取消' }
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

// 部门常量定义
export const DEPARTMENT = {
  PROJECT: 'PROJECT',
  READING: 'READING',
  COMPILATION: 'COMPILATION',
  NOTDEPARTMENT: 'NOTDEPARTMENT'
} as const

// 部门文字映射
export const DepartmentMap: Record<string, string> = {
  [DEPARTMENT.PROJECT]: '项目部',
  [DEPARTMENT.READING]: '教化部',
  [DEPARTMENT.COMPILATION]: '汇编',
  [DEPARTMENT.NOTDEPARTMENT]: '无部组'
}

export const DepartmentMapColor: Record<string, { name: string, className: string }> = {
  [DEPARTMENT.PROJECT]: { name: '项目部', className: 'g-green' },
  [DEPARTMENT.READING]: { name: '教化部', className: 'g-blue' },
  [DEPARTMENT.COMPILATION]: { name: '汇编', className: 'g-purple' },
  [DEPARTMENT.NOTDEPARTMENT]: { name: '无部组', className: 'g-gray' },
}

export const departmentOptions = [
  {
    label: '项目部',
    value: DEPARTMENT.PROJECT
  },
  {
    label: '教化部',
    value: DEPARTMENT.READING
  },
  {
    label: '汇编',
    value: DEPARTMENT.COMPILATION
  },
  {
    label: '无部组',
    value: DEPARTMENT.NOTDEPARTMENT
  }
]
export const mealOptions = [
  {
    label: '不用斋',
    value: 0
  },
  {
    label: '早斋',
    value: 1
  },
  {
    label: '午斋',
    value: 2
  },
  {
    label: '药石',
    value: 3
  }
]

// 申请类型常量定义
export const APPLICATION_TYPE = {
  SHORT_STAY: 1, // 短住
  DIRECT_BUS: 2, // 团体
  MONK_RELATIVE: 3, // 直通车
  SPECIAL_GUEST: 4 // 特殊客人
} as const

export const ApplicationTypeMap: Record<number, string> = {
  [APPLICATION_TYPE.SHORT_STAY]: '短住',
  [APPLICATION_TYPE.DIRECT_BUS]: '团体',
  [APPLICATION_TYPE.MONK_RELATIVE]: '直通车',
  [APPLICATION_TYPE.SPECIAL_GUEST]: '特殊客人'
}

export const applicationTypeOptions = [
  {
    label: '短住',
    value: APPLICATION_TYPE.SHORT_STAY
  },
  {
    label: '团体',
    value: APPLICATION_TYPE.DIRECT_BUS
  },
  {
    label: '直通车',
    value: APPLICATION_TYPE.MONK_RELATIVE
  },
  {
    label: '特殊客人',
    value: APPLICATION_TYPE.SPECIAL_GUEST
  }
]

export const preceptsOptions = [
  { label: 1, text: '无' },
  { label: 2, text: '居士五戒' },
  { label: 3, text: '八戒' },
  { label: 4, text: '菩萨戒' }
]

// 在寺表现评价
export const performanceOptions = [
  { label: '优秀', value: 1 },
  { label: '良好', value: 2 },
  { label: '一般', value: 3 },
  { label: '需改进', value: 4 }
]

