export interface PendingOrderRecord {
  id: string
  name: string
  gender: 'male' | 'female'
  idCard: string
  phone: string
  birthDate: string
  nation: string
  totalOrderCount: number
  address?: string
  // 详细信息
  wechat?: string
  maritalStatus?: string
  permanentProvince?: string
  permanentCity?: string
  permanentAddress?: string
  education?: string
  university?: string
  major?: string
  skills?: string
  profession?: string
  emergencyContact1?: string
  emergencyPhone1?: string
  emergencyContact2?: string
  emergencyPhone2?: string
  medicalHistory?: string
  medicationHistory?: string
  infectiousHistory?: string
  studySituation?: string
  convertDate?: string
  templeExperience?: string
  currentActivities?: string
  visitHistory?: string
  ordination?: string
  fivePrecepts?: string
  eightPrecepts?: string
  bodhisattvaPrecepts?: string
  applyStartDate?: string
  applyEndDate?: string
  stayReason?: string
  referee?: string
  refereeContact?: string
  refereeEvaluation?: string
  photo?: string
}

export interface OrderHistory {
  id: string
  orderDate: string
  leaveDate: string
  duration: number
  roomNumber: string
  roomType: string
  bedNumber: string
  performance: string
  status: 'completed' | 'cancelled' | 'violation'
}

export interface OrderStatistics {
  totalCount: number
  totalDays: number
  currentYearCount: number
  violationCount: number
}

export interface FilterForm {
  name: string
  gender: string
  orderCountRange: string
}

export interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}