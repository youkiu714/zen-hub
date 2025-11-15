// src/types/lodging-application.types.ts

export interface ContactItem {
  contactName?: string
  contactPhone?: string
  sortNo?: number
  [property: string]: any
}

export interface BasicInfo {
  name: string
  gender?: number
  idCard?: string
  ethnic?: string
  mobile?: string
  weChat?: string
  marital?: string
  province?: string
  city?: string
  address?: string
  education?: string
  school?: string
  major?: string
  occupation?: string
  skills?: string
  photoUrl?: string
  diseaseHistory?: string
  medicationHistory?: string
  infectiousHistory?: string
  emergencyContacts: ContactItem[]
  [property: string]: any
}

export interface PracticeInfo {
  yearsOfPractice?: number
  refugeTakenDate?: string
  pastPracticeExperience?: string
  currentPracticeExperience?: string
  visitRecords?: string
  hasTakenPrecepts?: boolean | null // 注意：UI 需要区分 “无” vs true
  [property: string]: any
}

export interface LodgingInfo {
  applicationType?: number
  checkinDate?: string
  checkoutDate?: string
  specialRequest?: string
  recommenderName?: string
  recommenderPhone?: string
  recommenderRelation?: string
  recommenderComment?: string
  [property: string]: any
}

export interface ApplicationSubmitRequest {
  basic: BasicInfo
  practice: PracticeInfo
  lodging: LodgingInfo
  [property: string]: any
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}