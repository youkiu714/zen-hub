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

// 审核状态常量定义
export const REVIEW_STATUS = {
  PENDING: 10,        // 待审核
  PENDING_MASTER: 20, // 待法师审核
  APPROVED: 30,       // 已通过
  REJECTED: 40,       // 已驳回
} as const;

// 审核阶段常量定义
export const REVIEW_STAGE = {
  VOLUNTEER: 10,      // 客堂义工
  MASTER: 20,         // 客堂法师
} as const;

// 定义审核状态的映射
export const ReviewStatusMap: Record<number, string> = {
  [REVIEW_STATUS.PENDING]: '待审核',
  [REVIEW_STATUS.PENDING_MASTER]: '待法师审核',
  [REVIEW_STATUS.APPROVED]: '已通过',
  [REVIEW_STATUS.REJECTED]: '已驳回',
};

// 定义审核阶段的映射
export const ReviewStageMap: Record<number, string> = {
  [REVIEW_STAGE.VOLUNTEER]: '客堂义工',
  [REVIEW_STAGE.MASTER]: '客堂法师',
};

// 定义审核结果的映射
export const ReviewResultMap: Record<number, string> = {
  0: '信息不完整，退回申请人',
  1: '信息完整，提交给客堂法师审核',
};