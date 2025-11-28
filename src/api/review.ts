import request from '@/utils/request'
import type { OrderListResponse } from '@/types/review'
import { number } from 'echarts';

export const getReviews = (
 params: {
  keyword?: string;
  pageNo: number;
  pageSize: number;
  startFrom?: string;
  startTo?: string;
  status?: number;
  type?: number;
}
): Promise<OrderListResponse> => {
  return request({
    url: '/reception/reviews',
    method: 'GET',
    params,
  });
};



export const reception = (params: {
    pass: true,
    comment: string,
    operatorId: string
}, id:number): Promise<{ code: number; message: string;  data: boolean; timestamp: string; success:true }> => {
console.log(params);

  return request({
    url: `/reception/${id}/review`,
    method: 'POST',
    headers:{
      'X-Operator-Id':params.operatorId
    },
    data:params
  })
}

// 提交评价接口
export interface EvaluationSubmitRequest {
  /** 集体活动参与 1-5星 */
  activityScore: number;
  /** 意见与建议 */
  comment?: string;
  /** 纪律遵守 1-5星 */
  disciplineScore: number;
  /** 礼仪规范 1-5星 */
  etiquetteScore: number;
  /** 环境维护与卫生 1-5星 */
  hygieneScore: number;
  /** 综合评价等级：1优秀 2良好 3一般 4较差 5差 */
  overallGrade: number;
  /** 与人相处情况 1-5星 */
  relationshipScore: number;
}

export interface ResultBoolean {
  /** 业务码：约定 0=成功，非0=失败 */
  code?: number;
  /** 返回数据 */
  data?: boolean;
  /** 提示信息 */
  message?: string;
  /** 时间戳（毫秒） */
  timestamp?: number;
}

export const submitEvaluation = (
  id: number,
  params: EvaluationSubmitRequest
): Promise<ResultBoolean> => {
  return request({
    url: `/evaluations/${id}/submit`,
    method: 'POST',
    data: params,
  });
};

