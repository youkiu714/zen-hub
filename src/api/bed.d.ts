import request from '@/utils/request' // 引用你上传的 request.ts
import type { BedUpsertRequest } from '@/types/bed.d'

import type { 
  BedQueryParams, 
  PageResult, 
  BedEligibleItem, 
  BedAppliedItem 
} from '@/types/api/bed';

// 枚举 URL，方便管理
enum Api {
  Eligible = '/bed-changes/eligible',
  Applied = '/bed-changes/applied'
}

/**
 * 获取可申请换床列表
 */
export const getEligibleList = (params: BedQueryParams) => {
  return request<any, PageResult<BedEligibleItem>>({
    url: Api.Eligible,
    method: 'get',
    params
  });
};

/**
 * 获取已申请换床列表
 */
export const getAppliedList = (params: BedQueryParams) => {
  return request<any, PageResult<BedAppliedItem>>({
    url: Api.Applied,
    method: 'get',
    params
  });
};

// 新增：提交申请的数据结构
export interface BedChangeApplyRequest {
  applicationId: number;
  desiredBedType: number; // 1=上铺, 2=下铺
  reasonType: number;     // 这里的映射需要跟后端确认，暂时约定：1=身体, 2=亲属, 3=环境, 4=其他
  reasonRemark?: string;  // 补充说明
}

/**
 * 提交换床申请
 */
export const submitBedChangeApply = (data: BedChangeApplyRequest) => {
  return request<any, number>({ // 假设成功返回业务ID(number)，根据接口文档返回 ResultLong
    url: '/bed-changes',
    method: 'post',
    data
  });
};


/**
 * 批量增加床位
 */
export function batchCreateBeds(data: BedBatchUpsertRequest) {
  return request({
    url: '/beds/batch',
    method: 'post',
    data
  })
}
