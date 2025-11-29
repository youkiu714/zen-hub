export type CheckinTabKey = 'pending' | 'checked-in' | 'checked-out'

export interface CheckinTab {
  key: CheckinTabKey
  label: string
}

export const CHECKIN_TABS: CheckinTab[] = [
  { key: 'pending', label: '待入住' },
  { key: 'checked-in', label: '已入住' },
  // { key: 'checked-out', label: '已退住' }
]

export const SEARCH_PLACEHOLDER_MAP: Record<CheckinTabKey, string> = {
  pending: '搜索姓名、证件号或申请编号',
  'checked-in': '搜索姓名、房间号或住宿ID',
  'checked-out': '搜索姓名或订单号'
}

export const ROOM_TYPE_OPTIONS = [
  { label: '所有房间类型', value: '' },
  { label: '标准间', value: '标准间' },
  { label: '豪华间', value: '豪华间' },
  { label: '套房', value: '套房' },
  { label: '总统套房', value: '总统套房' }
]

export const STATUS_OPTIONS = [
  { label: '所有状态', value: '' },
  { label: '已预订', value: '已预订' },
  { label: '已确认', value: '已确认' },
  { label: '已取消', value: '已取消' }
]

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const ORDER_TYPE_TAG_MAP: Record<string, 'primary' | 'warning' | 'success' | 'info'> = {
  短住: 'primary',
  团单: 'warning',
  直通车: 'success'
}

export const getOrderTypeTagType = (type: string) => ORDER_TYPE_TAG_MAP[type] || 'info'

export const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-'
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateTimeStr
  }
}

export const createCheckInForm = () => ({
  name: '',
  idCard: '',
  mobile: '',
  applicationTypeName: '',
  applicationId: '',
  roomNumber: '',
  bedNumber: '',
  actualCheckinDate: '',
  expectedCheckoutDate: '',
  remark: '',
  registeredBy: '客堂义工',
  registrationTime: '',
  bedStayId: undefined as number | undefined,
  actualCheckinAt: undefined as string | undefined
})
