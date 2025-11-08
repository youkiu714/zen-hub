/**
 * 房间列表请求参数
 */
export interface RoomListRequest {
  gender?: number;
  pageNo: number;
  pageSize: number;
  roomNo?: string;
  [property: string]: any;
}

/**
 * 房间概要信息
 */
export interface RoomSummaryVO {
  id?: number;
  roomNo?: string;
  gender?: number; // 1: 男众, 2: 女众
  roomType?: number;
  floor?: number;
  bedCount?: number;
  status?: number; // 1: 使用中, 0: 关闭中
  usedBedCount?: number;
  description?: string;
  deleted?: number;
  createdAt?: string;
  updatedAt?: string;
  [property: string]: any;
}

/**
 * 分页排序项
 */
export interface OrderItem {
  asc?: boolean;
  column?: string;
  [property: string]: any;
}

/**
 * 分页响应数据结构（MyBatis-Plus 风格）
 */
export interface IPageRoomSummaryVO {
  records?: RoomSummaryVO[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
  orders?: OrderItem[];
  optimizeCountSql?: boolean;
  isSearchCount?: boolean;
  hitCount?: boolean;
  countId?: string;
  maxLimit?: number;
  searchCount?: boolean;
  ascs?: string[];
  asc?: string[];
  descs?: string[];
  desc?: string[];
  [property: string]: any;
}

/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T = any> {
  code?: number; // 0 表示成功
  data?: T;
  message?: string;
  success?: boolean;
  timestamp?: number;
  [property: string]: any;
}