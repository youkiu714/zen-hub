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
    url: '/api/reception/reviews',
    method: 'GET',
    params,
  });
};



export const reception = (params: {
    pass: true,
    comment: string
}, id:number): Promise<{ code: number; message: string;  data: boolean; timestamp: string; success:true }> => {

    //   console.log(params);
    // console.log(id);

  return request({
    url: `/reception/${id}/master`,
    method: 'POST',
    data:params
  })
}

