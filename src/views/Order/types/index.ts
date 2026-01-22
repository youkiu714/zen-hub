export interface OrderApplication {
  id: number
  applicant: string
  avatar?: string
  applicationType: 'short_stay' | 'express' | 'monk_family' | 'team' | 'special'
  startDate: string
  endDate: string
  stayDays: number
  // 续单相关字段
  originalStartDate?: string
  originalEndDate?: string
  renewalStartDate?: string
  renewalEndDate?: string
  renewalDays?: number
  status: 'pending_review' | 'pending_monk' | 'rejected' | 'approved' | 'pending_review'
  idCard: string
  phone: string
  reason?: string
  remark?: string
}

export interface FilterOptions {
  applicationType: string
  dateRange: string
  searchKeyword: string
}

export interface TabConfig {
  name: string
  label: string
  status?: string
  count: number
}

export interface PaginationConfig {
  currentPage: number
  pageSize: number
  total: number
}

export interface ReviewForm {
  result: 'approved' | 'rejected'
  comment: string
}

export interface EvaluateForm {
  result: 'positive' | 'negative'
  comment: string
  rating: number
}

export type ApplicationType = OrderApplication['applicationType']
export type ApplicationStatus = OrderApplication['status']



//---------------------------------

// 挂单项类型定义
export interface OrderItem {
  id: number
  personId: number
  applicationType: number
  checkinDate: string
  checkoutDate: string
  specialRequest: string
  recommenderName: string
  recommenderRelation: string
  recommenderComment: string
  status: number
  createdBy: string | null
  updatedBy: string | null
  isDeleted: number
  createdAt: string | null
  updatedAt: string | null
  personSnapshot: string | null
  practiceSnapshot: string | null
  reviewStatus: number
}

// 人员快照类型
export interface PersonSnapshot {
  city: string
  name: string
  major: string
  ethnic: string
  gender: number
  idCard: string
  mobile: string
  school: string
  skills: string
  weChat: string
  address: string
  marital: string
  photoUrl: string
  province: string
  education: string
  occupation: string
  diseaseHistory: string
  emergencyContacts: EmergencyContact[]
  infectiousHistory: string
  medicationHistory: string
}

// 紧急联系人类型
export interface EmergencyContact {
  sortNo: number
  contactName: string
  contactPhone: string
}

// 修行快照类型
export interface PracticeSnapshot {
  visitRecords: string
  yearsOfPractice: number
  pastPracticeExperience: string
}