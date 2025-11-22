/**
 * 入住管理相关类型定义
 */

// ==================== 基础类型 ====================

export type CheckInStatus = 'pending' | 'checked-in' | 'checked-out'
export type OrderType = '短住' | '团单' | '直通车'
export type RoomType = '标准间' | '豪华间' | '套房' | '总统套房'

// ==================== 客人信息 ====================

export interface GuestInfo {
  id: string
  name: string
  idCard: string
  avatar?: string
  phone?: string
  email?: string
}

// ==================== 房间信息 ====================

export interface RoomInfo {
  roomNumber?: string
  roomType?: RoomType
  bedNumber?: string
  capacity?: number
}

// ==================== 入住信息 ====================

export interface CheckInInfo {
  checkInDate: string
  checkInTime: string
  checkOutDate: string
  checkOutTime: string
  orderType: OrderType
  days?: number
  stayedDays?: number
  remainingDays?: number
}

// ==================== 订单信息 ====================

export interface OrderInfo {
  orderId: string
  orderDate: string
  paymentMethod?: string
  totalAmount?: string
}

// ==================== 完整的入住记录 ====================

export interface CheckInRecord {
  id: string
  guest: GuestInfo
  room: RoomInfo
  checkIn: CheckInInfo
  order?: OrderInfo
  status: CheckInStatus
  createdAt: string
  updatedAt: string
}

// ==================== 待入住记录 ====================

export interface PendingCheckInRecord extends CheckInRecord {
  status: 'pending'
}

// ==================== 已入住记录 ====================

export interface CheckedInRecord extends CheckInRecord {
  status: 'checked-in'
  isUrgent?: boolean // 是否紧急（需要续住）
}

// ==================== 已退住记录 ====================

export interface CheckedOutRecord extends CheckInRecord {
  status: 'checked-out'
  actualCheckOutDate: string
  actualCheckOutTime: string
  totalDays: number
  evaluationStatus?: 'pending' | 'completed'
}

// ==================== API 请求参数 ====================

export interface CheckInListRequest {
  page: number
  pageSize: number
  keyword?: string
  roomType?: RoomType
  status?: CheckInStatus
  orderType?: OrderType
}

export interface PendingCheckInRequest extends CheckInListRequest {
  status: 'pending'
}

export interface CheckedInRequest extends CheckInListRequest {
  status: 'checked-in'
  stayDaysRange?: '1-3' | '4-7' | '8-14' | '15+'
}

export interface CheckedOutRequest extends CheckInListRequest {
  status: 'checked-out'
}

// ==================== API 响应 ====================

export interface CheckInListResponse<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CheckInApiResponse<T> {
  code: number
  message: string
  data: CheckInListResponse<T>
  success: boolean
  timestamp: number
}

// ==================== 操作表单类型 ====================

export interface CheckInFormData {
  guestName: string
  idCard: string
  mobile: string
  roomNumber?: string
  bedType?: string
  checkInDate: string
  checkOutDate: string
  orderType: OrderType
}

export interface CheckOutFormData {
  checkOutDate: string
  checkOutTime: string
  reason: string
  roomStatus: 'normal' | 'damaged' | 'lost'
  notes?: string
}

export interface RenewalFormData {
  originalCheckOutDate: string
  requestedCheckoutDate: string
  additionalDays: number
  notes?: string
}

export interface BedAssignmentFormData {
  roomNumber: string
  bedType: string
  status: 'confirmed' | 'pending'
}

export interface EvaluationFormData {
  rating: number
  roomCondition: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'
  ruleCompliance: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'
  notes?: string
}

export interface LostItemNotificationFormData {
  email: string
  phone: string
  itemName: string
  message: string
}

// ==================== 组件 Props 类型 ====================

export interface CheckInTableColumn {
  key: string
  label: string
  width?: number
  minWidth?: number
  sortable?: boolean
}

export interface CheckInModalProps {
  title: string
  visible: boolean
  data?: any
  onConfirm?: (data: any) => void
  onCancel?: () => void
}

// ==================== 通用类型 ====================

export interface PaginationParams {
  current: number
  pageSize: number
  total: number
}

export interface FilterOptions {
  keyword: string
  roomType?: RoomType
  orderType?: OrderType
  status?: CheckInStatus
}

export interface TableAction {
  key: string
  label: string
  icon?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  handler: (row: any) => void
}

// ==================== 兼容旧版本类型 ====================

// 保留原有的类型定义以保持兼容性
export interface PendingCheckinRequest {
  applicationType?: number;
  keyword?: string;
  pageNo: number;
  pageSize: number;
  [property: string]: any;
}

export interface PendingCheckinItemVO {
  applicationId?: number;
  /**
   * 申请类型（短住/团体…）
   */
  applicationType?: number;
  /**
   * 申请类型名（可选）
   */
  applicationTypeName?: string;
  /**
   * 挂单天数（预计退房 - 预计入住）
   */
  days?: number;
  /**
   * 预计入住日期（取申请单或预定记录）
   */
  expectedCheckinDate?: string;
  idCardMasked?: string;
  name?: string;
  personId?: number;
  /**
   * 始终为 "待入住"
   */
  statusDesc?: string;
  [property: string]: any;
}

export interface PendingCheckinPageResponse {
  asc?: string[];
  ascs?: string[];
  countId?: string;
  current?: number;
  desc?: string[];
  descs?: string[];
  hitCount?: boolean;
  isSearchCount?: boolean;
  maxLimit?: number;
  optimizeCountSql?: boolean;
  orders?: OrderItem[];
  pages?: number;
  records?: PendingCheckinItemVO[];
  searchCount?: boolean;
  size?: number;
  total?: number;
  [property: string]: any;
}

export interface PendingCheckinResponse {
  code?: number;
  data?: PendingCheckinPageResponse;
  message?: string;
  success?: boolean;
  timestamp?: number;
  [property: string]: any;
}

export interface InhouseRequest {
  keywordOrRoomNo?: string;
  pageNo: number;
  pageSize: number;
  stayBucket?: number;
  [property: string]: any;
}

export interface InhouseItemVO {
  applicationId?: number;
  bedNo?: string;
  bedStayId?: number;
  /**
   * 实际入住时间
   */
  checkinAt?: string;
  expectedCheckoutAt?: string;
  name?: string;
  personId?: number;
  roomNo?: string;
  /**
   * 已住天数（now - checkinAt）
   */
  stayedDays?: number;
  [property: string]: any;
}

export interface InhousePageResponse {
  asc?: string[];
  ascs?: string[];
  countId?: string;
  current?: number;
  desc?: string[];
  descs?: string[];
  hitCount?: boolean;
  isSearchCount?: boolean;
  maxLimit?: number;
  optimizeCountSql?: boolean;
  orders?: OrderItem[];
  pages?: number;
  records?: InhouseItemVO[];
  searchCount?: boolean;
  size?: number;
  total?: number;
  [property: string]: any;
}

export interface InhouseResponse {
  code?: number;
  data?: InhousePageResponse;
  message?: string;
  success?: boolean;
  timestamp?: number;
  [property: string]: any;
}

export interface OrderItem {
  asc?: boolean;
  column?: string;
  [property: string]: any;
}

export interface PendingCheckinColumn {
  prop: keyof PendingCheckinItemVO;
  label: string;
  width?: string | number;
  minWidth?: string | number;
}

export interface InhouseColumn {
  prop: keyof InhouseItemVO;
  label: string;
  width?: string | number;
  minWidth?: string | number;
}

// ==================== 入住登记详情相关类型 ====================

/**
 * 入住登记详情数据
 * 根据 C:\share\入住管理\入住登记页详情.md 定义
 */
export interface CheckinDetailVO {
  /**
   * 申请ID
   */
  applicationId?: number;

  /**
   * 人员ID
   */
  personId?: number;

  /**
   * 姓名
   */
  name?: string;

  /**
   * 身份证号（脱敏）
   */
  idCardMasked?: string;

  /**
   * 申请类型
   */
  applicationType?: number;

  /**
   * 申请类型名称
   */
  applicationTypeName?: string;

  /**
   * 手机号
   */
  mobile?: string;

  /**
   * 房间号
   */
  roomNo?: string;

  /**
   * 床号
   */
  bedNo?: string;

  /**
   * 实际入住时间（前端可编辑）
   */
  actualCheckinAt?: string;

  /**
   * 预定退房时间
   */
  expectedCheckoutAt?: string;

  [property: string]: any;
}

/**
 * 入住登记详情响应
 */
export interface CheckinDetailResponse {
  /**
   * 业务码：约定 0=成功，非0=失败
   */
  code?: number;

  /**
   * 返回数据
   */
  data?: CheckinDetailVO;

  /**
   * 提示信息
   */
  message?: string;

  /**
   * 时间戳（毫秒）
   */
  timestamp?: number;

  /**
   * 请求是否成功
   */
  success?: boolean;

  [property: string]: any;
}

// ==================== 确认入住相关类型 ====================

/**
 * 确认入住请求参数
 * 根据 C:\share\入住管理\待入住\确认入住接口.md 定义
 */
export interface CheckinConfirmRequest {
  /**
   * 实际入住时间；不填默认 now
   */
  actualCheckinAt?: string;

  /**
   * 分床时生成的预定记录ID（必填）
   */
  bedStayId: number;

  /**
   * 备注（可选）
   */
  remark?: string;

  [property: string]: any;
}

/**
 * 确认入住响应
 */
export interface CheckinConfirmResponse {
  /**
   * 业务码：约定 0=成功，非0=失败
   */
  code?: number;

  /**
   * 返回数据
   */
  data?: null;

  /**
   * 提示信息
   */
  message?: string;

  /**
   * 时间戳（毫秒）
   */
  timestamp?: number;

  /**
   * 请求是否成功
   */
  success?: boolean;

  [property: string]: any;
}