// src/api/person.ts
import request from '@/utils/request' 
import type { PersonSubmitRequest} from '@/types'
export interface BasicInfo {
  name: string
  gender?: number
  idCard?: string
  ethnic?: string
  mobile?: string
  weChat?: string
  marital?: string
  province?: string
  city?: string
  address?: string
  education?: string
  school?: string
  major?: string
  occupation?: string
  skills?: string
  photoUrl?: string
  diseaseHistory?: string
  medicationHistory?: string
  infectiousHistory?: string
  emergencyContacts: ContactItem[]
  provinceCity?: string,
  /**
   * 年龄（可留空，后端会按出生年月计算填充） 新增加
   */
  age?: number
  /**
   * 出生年月   新增加
   */
  birthDate?: string
  /**
   * 所属部组（PROJECT/READING/COMPILATION/OTHER）  新增加
   */
  departmentCode?: string
  [property: string]: any
}


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

export const personInfo = (data: PersonSubmitRequest): Promise<{
  code: number
  message: string
  data: any
  success: boolean
  timestamp: number
}> => {
  return request({
    url: '/records/person/info',
    method: 'post',
    data
  })
}