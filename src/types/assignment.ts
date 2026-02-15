// types/assignment.ts

export interface ChangeInfo {
    changeId?:           number;
    currentBedNo?:       string;
    currentBedTypeName?: string;
    currentRoomNo?:      string;
    reasonName?:         string;
    reasonRemark?:       string;
    [property: string]: any;
}

export interface AssignmentListItemVO {
  age?: number;
  applicationId?: number;
  applyDate?: string;
  /**
   * 1男 2女
   */
  gender?: number;
  /**
   * 分组（如果暂未有字段，可置空或预留）
   */
  groupName?: string;

  idCardMasked?: string;
  name?: string;
  personId?: number;
  checkinDate?: string;
  checkoutDate?: string;
  /**
   * 入住时长（checkout - checkin）
   */
  stayDays?: number;
  /**
   * 新住/换床
   */
  typeName?: string;
  changeInfo?: ChangeInfo;
  [property: string]: any;
}

export interface IPageAssignmentListItemVO {
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
  records?: AssignmentListItemVO[];
  searchCount?: boolean;
  size?: number;
  total?: number;
  [property: string]: any;
}

export interface OrderItem {
  asc?: boolean;
  column?: string;
  [property: string]: any;
}

export interface AssignmentRequest {
  keyword?: string;
  pageNo: number;
  pageSize: number;
  [property: string]: any;
}

export interface AssignmentResponse {
  /**
   * 业务码：约定 0=成功，非0=失败
   */
  code?: number;
  /**
   * 返回数据
   */
  data?: IPageAssignmentListItemVO;
  /**
   * 提示信息
   */
  message?: string;
  success?: boolean;
  /**
   * 时间戳（毫秒）
   */
  timestamp?: number;
  [property: string]: any;
}

// 性别枚举
export enum Gender {
  MALE = 1,
  FEMALE = 2
}

// 性别标签映射
export const GENDER_MAP: Record<Gender, { label: string; color: string }> = {
  [Gender.MALE]: { label: '男', color: '#409EFF' },
  [Gender.FEMALE]: { label: '女', color: '#F56C6C' }
};

// 类型标签映射
export const TYPE_MAP: Record<string, { label: string; color: string }> = {
  '新住': { label: '新住', color: '#67C23A' },
  '换床': { label: '换床', color: '#E6A23C' }
};

// 楼层相关类型
export interface FloorRequest {
  gender?: number;
}

export interface FloorResponse {
  code?: number;
  data?: number[];
  message?: string;
  success?: boolean;
  timestamp?: number;
}

// 房间相关类型
export interface RoomRequest {
  floor: number;
  gender?: number;
  start?: string;
  end?: string;
}

export interface RoomResponse {
  code?: number;
  data?: RoomBriefVO[];
  message?: string;
  success?: boolean;
  timestamp?: number;
}

export interface RoomBriefVO {
  capacity?: number;
  full?: boolean;
  occupiedCount?: number;
  roomId?: number;
  roomNo?: string;
}

// 床位相关类型
export interface BedRequest {
  roomId: number;
  start: string;
  end: string;
}

export interface BedResponse {
  code?: number;
  data?: Bed[];
  message?: string;
  success?: boolean;
  timestamp?: number;
}

export interface Bed {
  bedNo?: string;
  bedType?: number;
  createdAt?: string;
  deleted?: number;
  id?: number;
  roomId?: number;
  status?: number;
  updatedAt?: string;
}

// 分配床位请求类型
export interface AllocateBedRequest {
  applicationId?: number;
  bedId?: number;
  checkinAt?: string;
  checkoutAt?: string;
  remark?: string;
  type?: number;
  bedChangeId?: number;
}

export interface AllocateBedResponse {
  code?: number;
  data?: number;
  message?: string;
  success?: boolean;
  timestamp?: number;
}

// 床位状态枚举
export enum BedStatus {
  AVAILABLE = 0,  // 空闲
  OCCUPIED = 1,   // 占用
  LOCKED = 2,     // 锁定
  CLEANING = 3    // 待打扫
}

// 床位类型枚举
export enum BedType {
  UPPER = 1,  // 上铺
  LOWER = 2   // 下铺
}

// 床位状态标签映射
export const BED_STATUS_MAP: Record<BedStatus, { label: string; color: string }> = {
  [BedStatus.AVAILABLE]: { label: '空闲', color: '#67C23A' },
  [BedStatus.OCCUPIED]: { label: '占用', color: '#F56C6C' },
  [BedStatus.LOCKED]: { label: '锁定', color: '#E6A23C' },
  [BedStatus.CLEANING]: { label: '待打扫', color: '#909399' }
};

// 床位类型标签映射
export const BED_TYPE_MAP: Record<BedType, { label: string; color: string }> = {
  [BedType.UPPER]: { label: '上铺', color: '#409EFF' },
  [BedType.LOWER]: { label: '下铺', color: '#67C23A' }
};

// ==================== 已分配人员相关类型 ====================

export interface AssignedLodgingVO {
  /**
   * 床位居住ID
   */
  bedStayId?: number;
  /**
   * 申请ID
   */
  applicationId?: number;
  /**
   * 分配日期
   */
  assignedDate?: string;
  /**
   * 预计入住
   */
  expectedCheckinDate?: string;
  /**
   * 预计离开
   */
  expectedCheckoutDate?: string;
  /**
   * 分组（中文名）
   */
  group?: string;
  /**
   * 姓名
   */
  name?: string;
  /**
   * 房间/床位（如：A302 / 上铺）
   */
  roomAndBed?: string;
  [property: string]: any;
}

export interface IPageAssignedLodgingVO {
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
  records?: AssignedLodgingVO[];
  searchCount?: boolean;
  size?: number;
  total?: number;
  [property: string]: any;
}

export interface AssignedRequest {
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
  /**
   * 房间ID（用于房间下拉筛选，可选）
   */
  roomId?: number;
  [property: string]: any;
}

export interface AssignedResponse {
  /**
   * 业务码：约定 0=成功，非0=失败
   */
  code?: number;
  /**
   * 返回数据
   */
  data?: IPageAssignedLodgingVO;
  /**
   * 提示信息
   */
  message?: string;
  success?: boolean;
  /**
   * 时间戳（毫秒）
   */
  timestamp?: number;
  [property: string]: any;
}

// ==================== 已入住人员相关类型 ====================

export interface CheckedInLodgingVO {
  /**
   * 年龄
   */
  age?: number;
  /**
   * 申请ID
   */
  applicationId?: number;
  /**
   * 实际入住
   */
  checkinDate?: string;
  /**
   * 预计离开
   */
  expectedCheckoutDate?: string;
  /**
   * 性别（0未知 1男 2女）
   */
  gender?: number;
  /**
   * 分组（中文名）
   */
  group?: string;
  /**
   * 人员信息（姓名）
   */
  name?: string;
  /**
   * 房间/床位
   */
  roomAndBed?: string;
  [property: string]: any;
}

export interface IPageCheckedInLodgingVO {
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
  records?: CheckedInLodgingVO[];
  searchCount?: boolean;
  size?: number;
  total?: number;
  [property: string]: any;
}

export interface CheckedInRequest {
  /**
   * 所属分组（部门代码：PROJECT/READING/COMPILATION/OTHER）
   */
  departmentCode?: string;
  /**
   * 性别（0未知 1男 2女）
   */
  gender?: number;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
  [property: string]: any;
}

export interface CheckedInResponse {
  /**
   * 业务码：约定 0=成功，非0=失败
   */
  code?: number;
  /**
   * 返回数据
   */
  data?: IPageCheckedInLodgingVO;
  /**
   * 提示信息
   */
  message?: string;
  success?: boolean;
  /**
   * 时间戳（毫秒）
   */
  timestamp?: number;
  [property: string]: any;
}

// ==================== 已退住人员相关类型 ====================

export interface CheckedOutLodgingVO {
  /**
   * 申请ID
   */
  applicationId?: number;
  /**
   * 退住日期
   */
  checkoutDate?: string;
  /**
   * 遗漏物品
   */
  lostItemsRemark?: string;
  /**
   * 姓名
   */
  name?: string;
  /**
   * 房间号
   */
  roomNo?: string;
  /**
   * 状态（0正常/1异常，可按需映射）
   */
  status?: number;
  [property: string]: any;
}

export interface IPageCheckedOutLodgingVO {
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
  records?: CheckedOutLodgingVO[];
  searchCount?: boolean;
  size?: number;
  total?: number;
  [property: string]: any;
}

export interface CheckedOutRequest {
  /**
   * 姓名（模糊）
   */
  name?: string;
  pageNo?: number;
  pageSize?: number;
  /**
   * 房间号（模糊）
   */
  roomNo?: string;
  [property: string]: any;
}

export interface CheckedOutResponse {
  /**
   * 业务码：约定 0=成功，非0=失败
   */
  code?: number;
  /**
   * 返回数据
   */
  data?: IPageCheckedOutLodgingVO;
  /**
   * 提示信息
   */
  message?: string;
  success?: boolean;
  /**
   * 时间戳（毫秒）
   */
  timestamp?: number;
  [property: string]: any;
}

// 退住状态枚举
export enum CheckoutStatus {
  NORMAL = 0,  // 正常
  ABNORMAL = 1 // 异常
}

// 退住状态标签映射
export const CHECKOUT_STATUS_MAP: Record<CheckoutStatus, { label: string; color: string }> = {
  [CheckoutStatus.NORMAL]: { label: '正常', color: '#67C23A' },
  [CheckoutStatus.ABNORMAL]: { label: '异常', color: '#F56C6C' }
};



// 用于筛选的状态枚举
export enum AssignmentBedStatus {
  PENDING = 'pending',       // 待分配
  ASSIGNED = 'assigned',     // 已分配
  CHECKED_IN = 'checked_in', // 已入住
  CHECKED_OUT = 'checked_out' // 已退住
}

// 用于展示的状态标签
export interface StatusTag {
  value: AssignmentBedStatus;
  label: string;
  type: 'success' | 'default' | 'warning' | 'danger' | 'primary';
  icon: string;
}
