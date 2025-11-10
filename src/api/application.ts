import request from '@/utils/request';
import { Request, IPageApplicationListItemVO } from '@/types/application';
import type { ApplicationDetailVO } from '@/views/Order/PendingOrderManagement/components/types' 


export function getApplications(params: {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  applicationType?: number;
  status?: number;
  checkinFrom?: string;
  checkinTo?: string;
}) {
  return request.get<Request<IPageApplicationListItemVO>>('http://49.232.241.94:8080/lodging/apply/applications', {
    params,
  });
}

export function getApplicationById(id: number) {
  console.log(id);
  
  return request.get<Request<ApplicationDetailVO>>(`http://49.232.241.94:8080/lodging/apply/applications/${id}`);
}

// 取消申请
export function cancelApplication(id: number) {
  return request.post<Request<any>>(`http://49.232.241.94:8080/lodging/apply/${id}/cancel`);
}