/*
 * @Author: zhaoziying zhaoziying@kuaishou.com
 * @Date: 2025-11-16 10:21:16
 * @LastEditors: zhaoziying zhaoziying@kuaishou.com
 * @LastEditTime: 2025-11-16 11:31:28
 * @FilePath: /zen-hub/src/api/review.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

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

