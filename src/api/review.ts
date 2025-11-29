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

// 评价列表查询参数接口
export interface EvaluationsQuery {
  /** 挂单类型 */
  applicationType?: number;
  /** 退单日期-结束 */
  checkoutEndDate?: string;
  /** 退单日期-开始 */
  checkoutStartDate?: string;
  /** 关键字，匹配姓名/手机号/身份证 */
  keyword?: string;
  /** 挂单日期模式：all/today/week/month/quarter */
  lodgingDateMode?: string;
  /** 挂单日期-结束（当模式=all时生效） */
  lodgingEndDate?: string;
  /** 挂单日期-开始（当模式=all时生效） */
  lodgingStartDate?: string;
  /** 页码，从1开始 */
  pageNo?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 状态：10待评价 20已评价 */
  status?: number;
}

// 评价列表项接口
export interface EvaluationListItemVO {
  /** 实际退住日期 */
  actualCheckoutDate?: string;
  /** 姓名 */
  applicantName?: string;
  /** 申请ID */
  applicationId?: number;
  /** 挂单类型 */
  applicationType?: number;
  /** 挂单类型名称 */
  applicationTypeName?: string;
  /** 挂单日期 */
  checkinDate?: string;
  /** 评价ID */
  evaluationId?: number;
  /** 性别 1男 2女 */
  gender?: number;
  /** 身份证号（脱敏） */
  idCardMasked?: string;
  /** 手机号（脱敏） */
  mobileMasked?: string;
  /** 计划退住日期 */
  plannedCheckoutDate?: string;
  /** 状态编码 */
  status?: number;
  /** 状态名称 */
  statusDesc?: string;
}

// 分页响应数据接口
export interface IPageEvaluationListItemVO {
  asc?: string[];
  ascs?: string[];
  countId?: string;
  current?: number;
  desc?: string[];
  descs?: string[];
  hitCount?: boolean;
  isSearchCount?: boolean;
  maxLimit?: number;
  optimizeCountSql?: boolean;
  pages?: number;
  records?: EvaluationListItemVO[];
  searchCount?: boolean;
  size?: number;
  total?: number;
}

// 评价列表响应接口
export interface EvaluationsResponse {
  /** 业务码：约定 0=成功，非0=失败 */
  code?: number;
  /** 返回数据 */
  data?: IPageEvaluationListItemVO;
  /** 提示信息 */
  message?: string;
  success?: boolean;
  /** 时间戳（毫秒） */
  timestamp?: number;
}

// 获取评价列表
export const getEvaluations = (
  params: EvaluationsQuery
): Promise<EvaluationsResponse> => {
  return request({
    url: '/evaluations',
    method: 'GET',
    params,
  });
};

// 评价详情接口
export interface EvaluationDetailRequest {
  evaluationId: number;
}

// 评价详情响应接口
export interface EvaluationDetailResponse {
  /** 业务码：约定 0=成功，非0=失败 */
  code?: number;
  /** 返回数据 */
  data?: EvaluationDetailVO;
  /** 提示信息 */
  message?: string;
  /** 时间戳（毫秒） */
  timestamp?: number;
  success?: boolean;
}

// 评价详情数据接口
export interface EvaluationDetailVO {
  /** 评价内容 */
  evaluation?: EvaluationInfo;
  /** 挂单信息 */
  lodging?: LodgingInfo;
  /** 人员信息 */
  person?: PersonInfo;
  [property: string]: any;
}

// 评价信息接口
export interface EvaluationInfo {
  /** 纪律遵守评分 */
  disciplineScore?: number;
  /** 礼仪规范评分 */
  etiquetteScore?: number;
  /** 集体活动参与评分 */
  activityScore?: number;
  /** 评价意见 */
  comment?: string;
  /** 综合评价等级 */
  overallGrade?: number;
  /** 综合评价等级描述 */
  overallGradeDesc?: string;
  /** 与人相处评分 */
  relationshipScore?: number;
  /** 评价时间 */
  evaluatedAt?: string;
  /** 评价人ID */
  evaluatorId?: number;
  /** 环境维护与卫生评分 */
  hygieneScore?: number;
  /** 状态编码 */
  status?: number;
  /** 状态描述 */
  statusDesc?: string;
  [property: string]: any;
}

// 挂单信息接口
export interface LodgingInfo {
  /** 实际退单日期 */
  actualCheckoutDate?: string;
  /** 申请ID */
  applicationId?: number;
  /** 挂单类型 */
  applicationType?: number;
  /** 挂单类型名称 */
  applicationTypeName?: string;
  /** 入住日期 */
  checkinDate?: string;
  /** 计划退单日期 */
  plannedCheckoutDate?: string;
  /** 备注 */
  remark?: string;
  /** 房间号 */
  roomNo?: string;
  /** 床位号 */
  bedNo?: string;
  [property: string]: any;
}

// 人员信息接口
export interface PersonInfo {
  /** 年龄 */
  age?: number;
  /** 性别名称 */
  genderName?: string;
  /** 身份证号 */
  idCard?: string;
  /** 手机号 */
  mobile?: string;
  /** 姓名 */
  name?: number;
  /** 民族 */
  nation?: string;
  /** 人员ID */
  personId?: number;
  /** 微信号 */
  wechat?: string;
  [property: string]: any;
}

// 获取评价详情
export const getEvaluationDetail = (
  id: number
): Promise<EvaluationDetailResponse> => {
  return request({
    url: `/evaluations/${id}`,
    method: 'GET',
  });
};

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

