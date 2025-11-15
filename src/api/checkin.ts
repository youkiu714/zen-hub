import request from '@/utils/request'
import type {
  PendingCheckinRequest,
  PendingCheckinResponse,
  InhouseRequest,
  InhouseResponse,
  CheckInFormData,
  CheckOutFormData,
  RenewalFormData,
  BedAssignmentFormData,
  EvaluationFormData,
  LostItemNotificationFormData,
  CheckInApiResponse,
  PendingCheckInRecord,
  CheckedInRecord,
  CheckedOutRecord,
  CheckinDetailResponse,
  CheckinDetailVO,
  CheckinConfirmRequest,
  CheckinConfirmResponse
} from '@/types/checkin'

/**
 * 获取待入住人员列表
 * @param params 查询参数
 * @returns Promise<PendingCheckinResponse>
 */
export const getPendingCheckinList = (
  params: PendingCheckinRequest
): Promise<PendingCheckinResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/checkin/pending',
    method: 'GET',
    params,
  });
};

/**
 * 获取已入住人员列表
 * @param params 查询参数
 * @returns Promise<InhouseResponse>
 */
export const getInhouseList = (
  params: InhouseRequest
): Promise<InhouseResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/checkin/inhouse',
    method: 'GET',
    params,
  });
};

/**
 * 获取已退住人员列表
 * @param params 查询参数
 * @returns Promise<CheckInApiResponse<CheckedOutRecord>>
 */
export const getCheckedOutList = (
  params: any
): Promise<CheckInApiResponse<CheckedOutRecord>> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/checkin/checked-out',
    method: 'GET',
    params,
  });
};

/**
 * 办理入住登记
 * @param data 入住登记表单数据
 * @returns Promise<any>
 */
export const performCheckIn = (
  data: CheckInFormData
): Promise<any> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/checkin/perform',
    method: 'POST',
    data,
  });
};

/**
 * 办理退房
 * @param recordId 记录ID
 * @param data 退房表单数据
 * @returns Promise<any>
 */
export const performCheckOut = (
  recordId: string,
  data: CheckOutFormData
): Promise<any> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/checkout/${recordId}`,
    method: 'POST',
    data,
  });
};

/**
 * 续单确认
 * @param recordId 记录ID
 * @param data 续单表单数据
 * @returns Promise<any>
 */
export const confirmRenewal = (
  recordId: string,
  data: RenewalFormData
): Promise<any> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/renewal/${recordId}`,
    method: 'POST',
    data,
  });
};

/**
 * 床位分配
 * @param recordId 记录ID
 * @param data 床位分配表单数据
 * @returns Promise<any>
 */
export const assignBed = (
  recordId: string,
  data: BedAssignmentFormData
): Promise<any> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/assign-bed/${recordId}`,
    method: 'POST',
    data,
  });
};

/**
 * 床位确认
 * @param recordId 记录ID
 * @param data 床位确认表单数据
 * @returns Promise<any>
 */
export const confirmBed = (
  recordId: string,
  data: BedAssignmentFormData
): Promise<any> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/confirm-bed/${recordId}`,
    method: 'POST',
    data,
  });
};

/**
 * 客人评价
 * @param recordId 记录ID
 * @param data 评价表单数据
 * @returns Promise<any>
 */
export const submitEvaluation = (
  recordId: string,
  data: EvaluationFormData
): Promise<any> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/evaluation/${recordId}`,
    method: 'POST',
    data,
  });
};

/**
 * 发送遗漏物品通知
 * @param recordId 记录ID
 * @param data 通知表单数据
 * @returns Promise<any>
 */
export const sendLostItemNotification = (
  recordId: string,
  data: LostItemNotificationFormData
): Promise<any> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/lost-item/${recordId}`,
    method: 'POST',
    data,
  });
};

/**
 * 获取入住登记详情
 * @param applicationId 申请ID
 * @returns Promise<CheckinDetailResponse>
 */
export const getCheckinDetail = (
  applicationId: number
): Promise<CheckinDetailResponse> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/detail/${applicationId}`,
    method: 'GET',
  });
};

/**
 * 确认入住
 * @param data 确认入住请求参数
 * @returns Promise<CheckinConfirmResponse>
 */
export const confirmCheckin = (
  data: CheckinConfirmRequest
): Promise<CheckinConfirmResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/checkin/confirm',
    method: 'POST',
    data,
  });
};

/**
 * 获取客人详情
 * @param recordId 记录ID
 * @returns Promise<any>
 */
export const getGuestDetails = (
  recordId: string
): Promise<any> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/checkin/details/${recordId}`,
    method: 'GET',
  });
};