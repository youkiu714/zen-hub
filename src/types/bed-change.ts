// 换床申请相关类型定义

// 可申请换床列表项
export interface AvailableForChangeItem {
  id: string
  name: string
  idCard: string
  avatar: string
  roomInfo: {
    roomNumber: string
    bedNumber: string
    buildingName: string
  }
  checkinDate: string
  expectedCheckout: string
  status: string
}

// 已申请换床列表项
export interface AppliedChangeItem {
  applicationId: string
  applicantName: string
  idCard: string
  avatar: string
  originalBed: {
    roomNumber: string
    bedNumber: string
  }
  applicationDate: string
  changeReason: string
  applicationStatus: 'pending' | 'approved' | 'rejected'
  newBed?: {
    roomNumber: string
    bedNumber: string
  }
}

// 换床申请表单数据
export interface BedChangeApplication {
  applicantId: string
  applicantName: string
  currentBed: {
    roomNumber: string
    bedNumber: string
    buildingName: string
  }
  newRoomType: string
  preferredBedType: 'upper' | 'lower'
  changeReason: 'health' | 'relative' | 'environment' | 'other'
  otherReason?: string
  additionalInfo?: string
}

// 查询参数
export interface BedChangeQuery {
  keyword?: string
  roomType?: string
  currentPage: number
  pageSize: number
}

// 分页响应数据
export interface AvailableForChangeResponse {
  total: number
  data: AvailableForChangeItem[]
}

export interface AppliedChangeResponse {
  total: number
  data: AppliedChangeItem[]
}

// 房间类型选项
export interface RoomTypeOption {
  value: string
  label: string
}

// 换床原因选项
export interface ChangeReasonOption {
  value: string
  label: string
  description: string
}