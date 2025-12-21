/*
 * @Author: zhaoziying zhaoziying@kuaishou.com
 * @Date: 2025-11-09 10:23:51
 * @LastEditors: zhaoziying zhaoziying@kuaishou.com
 * @LastEditTime: 2025-12-21 11:02:59
 * @FilePath: /zen-hub/src/types/application.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
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
  DRAFT = 0, // 草稿
  PENDING_REVIEW = 10, // 申请中
  WAITING_CHECKIN = 20, // 待入住
  CHECKED_IN = 30, // 入住中  
  CHECKED_OUT = 40, // 已退住
  RENEWAL_REVIEW_SUCCESS = 50, // 续住审核通过
  RENEWAL_REVIEW_REJECTED = 60, // 续住审核拒绝
  REJECTED = 70, // 未通过
  CANCELED = 90, // 已取消
}

// 用于展示的状态标签
export interface StatusTag {
  value: ApplicationStatus;
  label: string;
  type: 'success' | 'default' | 'warning' | 'danger' | 'primary';
  icon?: string;
}

// 用于展示审核状态的标签
export interface ReviewStatusTag {
  value: number;
  label: string;
  type: 'success' | 'default' | 'warning' | 'danger' | 'primary';
  icon?: string;
}

export interface OrderId {
  id: number;
}