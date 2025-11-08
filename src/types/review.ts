// types.ts
export interface ReviewListItemVO {
  id?: number;
  applicantName?: string;
  idCardMasked?: string;
  applicationType?: number;
  checkinDate?: string;
  checkoutDate?: string;
  days?: number;
  reviewStatus?: number; // 10/20/30/40
  lastReviewStage?: number; // 10义工 / 20法师
  lastReviewStageDesc?: string;
  lastReviewResult?: number; // 0退回 / 1通过
  lastReviewResultDesc?: string;
  lastReviewComment?: string;
  lastReviewerId?: number;
  lastReviewTime?: string;
}

export interface ReviewListResponse {
  code?: number;
  message?: string;
  data?: ReviewListItemVO[];
  timestamp?: number;
}

// 定义申请类型的映射
export const ApplicationTypeMap: Record<number, string> = {
  1: '短住',
  2: '直通车',
  3: '僧亲',
  4: '团队挂单',
  5: '特殊客人',
};

// 定义审核状态的映射
export const ReviewStatusMap: Record<number, string> = {
  10: '待审核',
  20: '待法师审核',
  30: '已通过',
  40: '已驳回',
};

// 定义审核阶段的映射
export const ReviewStageMap: Record<number, string> = {
  10: '客堂义工',
  20: '客堂法师',
};

// 定义审核结果的映射
export const ReviewResultMap: Record<number, string> = {
  0: '信息不完整，退回申请人',
  1: '信息完整，提交给客堂法师审核',
};