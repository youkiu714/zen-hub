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

