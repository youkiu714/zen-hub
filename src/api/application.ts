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
  return request.get<IPageApplicationListItemVO, IPageApplicationListItemVO>('/apply/applications', {
    params,
  });
}

export function getApplicationById(id: number) {
  
  return request.get<Request<ApplicationDetailVO>>(`/apply/applications/${id}`);
}

// 取消申请
export function cancelApplication(id: number) {
  return request.post<Request<any>>(`/apply/${id}/cancel`);
}

// 修改挂单信息
export function updateLodgingInfo(id: number, data: {
  lodging: {
    applicationType: number;
    checkinDate: string;
    checkoutDate: string;
    shortStayReason: string;
    selfEvaluation: string;
    mealPreference: number;
    departureDate: string;
    returnDate: string;
    recommenderComment: string;
    departmentCode: string;
  }
}) {
  return request.post<Request<any>>(`/apply/${id}/update-lodging`, data);
}
