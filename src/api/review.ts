
import request from '@/utils/request'
import type { OrderListResponse } from '@/types/review'

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
    url: 'http://49.232.241.94:8080/lodging/reception/reviews',
    method: 'GET',
    params,
  });
};
