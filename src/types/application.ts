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
  //DRAFT = 0, // 草稿
  APPLIED = 10, // 申请中
  PENDING = 20, // 待入住
  CHECKED_IN = 30, // 入住中
  CHECKED_OUT = 40, // 已退住
  REJECTED = 70, // 未通过
}

// 用于展示的状态标签
export interface StatusTag {
  value: ApplicationStatus;
  label: string;
  type: 'success' | 'info' | 'warning' | 'danger' | 'primary';
  icon: string;
}

export interface OrderId {
  id: number;
}