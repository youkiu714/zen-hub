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

// 用于筛选的状态枚举
export enum ReviewStatus {
  WAITING_REVIEW = 10, // 待审核
  WAITING_MASTER_REVIEW = 20, // 待法师审核
  PASSED = 30, // 已通过  
  REJECTED = 40, // 已驳回
}

// 用于展示的状态标签
export interface StatusTag {
  value: ReviewStatus;
  label: string;
  type: 'success' | 'default' | 'warning' | 'danger' | 'primary';
  icon: string;
}

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



export enum EvaluationStatus {
  PENDING = 10,    // 待评价
  COMPLETED = 20   // 已评价
}

// 用于展示的状态标签
export interface EvaluationStatusTag {
  value: EvaluationStatus;
  label: string;
  type: 'success' | 'default' | 'warning' | 'danger' | 'primary';
  icon: string;
}


// types.ts
export interface EmergencyContact {
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  deleted?: number;
  id?: number;
  personId?: number;
  sortNo?: number;
  updatedAt?: string;
}

export interface BasicInfo {
  address?: string;
  city?: string;
  diseaseHistory?: string;
  education?: string;
  emergencyContacts?: EmergencyContact[];
  ethnic?: string;
  gender?: number;
  idCard?: string;
  infectiousHistory?: string;
  major?: string;
  marital?: string;
  medicationHistory?: string;
  mobile?: string;
  name?: string;
  occupation?: string;
  photoUrl?: string;
  province?: string;
  school?: string;
  skills?: string;
  weChat?: string;
}

export interface LodgingInfo {
  applicationType?: number;
  attachments?: string[];
  checkinDate?: string;
  checkoutDate?: string;
  recommenderComment?: string;
  recommenderName?: string;
  recommenderPhone?: string;
  recommenderRelation?: string;
  specialRequest?: string;
  status?: number;
}

export interface PracticeInfo {
  currentPracticeExperience?: string;
  hasTakenPrecepts?: boolean;
  pastPracticeExperience?: string;
  refugeTakenDate?: string;
  visitRecords?: string;
  yearsOfPractice?: number;
}

export interface ReviewRecordVO {
  comment?: string;
  createdAt?: string;
  id?: number;
  result?: number;
  resultDesc?: string;
  reviewerId?: number;
  stage?: number;
  stageDesc?: string;
}

export interface TimelineItem {
  content?: string;
  fromStatus?: number;
  operator?: string;
  time?: string;
  title?: string;
  toStatus?: number;
  type?: string;
}

export interface ApplicationDetailVO {
  basic?: BasicInfo;
  lodging?: LodgingInfo;
  practice?: PracticeInfo;
  reviewRecords?: ReviewRecordVO[];
  timeline?: TimelineItem[];
}