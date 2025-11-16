// api/application.ts
import request from '@/utils/request';
import { Request, IPageApplicationListItemVO, ApplicationListItemVO } from '@/types/application';

export function getApplications(params: {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  applicationType?: number;
  status?: number;
  checkinFrom?: string;
  checkinTo?: string;
}) {
  return request.get<Request<IPageApplicationListItemVO>>('/api/apply/applications', {
    params,
  });
}

import type { ApplicationDetailVO } from '@/views/Order/PendingOrderManagement/components/types' 
export function getApplicationById(id: number) {
  console.log(id);
  
  return request.get<Request<ApplicationDetailVO>>(`/api/apply/applications/${id}`);
}