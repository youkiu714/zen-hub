// src/api/person.ts
import request from '@/utils/request' 

export interface CheckedOutParams {
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
}

// 获取已签退（已有挂单）人员列表
export function getCheckedOutRecords(params: CheckedOutParams) {
  return request({
    url: '/records/checked-out',
    method: 'get',
    params
  })
}


export function getCheckedOutDetail(personId: number) {
  return request({
    url: `/records/checked-out/${personId}`,
    method: 'get'
  })
}