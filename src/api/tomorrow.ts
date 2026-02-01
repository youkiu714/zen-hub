import request from '@/utils/request'

// ================= 类型定义 =================

export interface InhouseItemVO {
  age?: number;
  applicationId?: number;
  bedNo?: string;
  bedStayId?: number;
  checkinAt?: string; // 实际入住时间
  expectedCheckoutAt?: string;
  gender?: number; // 1男 2女
  name?: string;
  personId?: number;
  recordType?: string; // 新住/续单
  roomNo?: string;
  stayedDays?: number;
  [property: string]: any;
}

// ================= 接口定义 =================

// 获取第二天需要退单的人员列表
export function getCheckoutDueTomorrow(params: { date?: string; pageNo: number; pageSize: number }) {
  return request({
    url: '/checkin/checkout-due-tomorrow',
    method: 'get',
    params
  })
}