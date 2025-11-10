// types/application.ts
export interface ApplicationListItemVO {
  id?: number;
  personId?: number;
  applicantName?: string;
  idCardMasked?: string;
  applicationType?: number;
  status?: number; // 主流程状态
  reviewStatus?: number; // 审核状态
  checkinDate?: string;
  checkoutDate?: string;
  days?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPageApplicationListItemVO {
  records?: ApplicationListItemVO[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
  orders?: OrderItem[];
  [property: string]: any;
}

export interface OrderItem {
  asc?: boolean;
  column?: string;
  [property: string]: any;
}

export interface Request<T = any> {
  code?: number;
  data?: T;
  message?: string;
  success?: boolean;
  timestamp?: number;
  [property: string]: any;
}

// 用于筛选的状态枚举
export enum ApplicationStatus {
  ALL = 0,
  PENDING = 10, // 待入住
  CHECKED_IN = 20, // 入住中
  CHECKED_OUT = 30, // 已退住
  REJECTED = 40, // 未通过
  APPLIED = 70, // 申请中
}

// 用于展示的状态标签
export interface StatusTag {
  value: ApplicationStatus;
  label: string;
  type: 'success' | 'default' | 'warning' | 'danger' | 'primary';
  icon: string;
}

export interface OrderId {
  id: number;
}