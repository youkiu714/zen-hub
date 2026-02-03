import request from '@/utils/request'

export type CheckedOutRecord = {
  personId: number
  name: string
  gender: number
  age: number
  mobile: string
  departmentCode: string
  lastCheckinDate: string
}

type CheckedOutResponse = {
  total: number
  current: number
  records: CheckedOutRecord[]
  searchCount: boolean
  pages: number
  size: number
}

export const getCheckedOutRecords = (keyword: string) =>
  request.get<CheckedOutResponse>('/records/checked-out', {
    params: { keyword }
  })

export type CheckedOutRecordDetail = {
  basic: {
    name: string
    gender: number
    idCard: string
    ethnic: string
    mobile: string
    weChat: string
    marital: string
    province: string
    city: string
    provinceCity: string
    address: string
    education: string
    school: string
    major: string
    occupation: string
    skills: string
    photoUrl: string
    diseaseHistory: string
    medicationHistory: string
    infectiousHistory: string
    emergencyContacts: {
      contactName: string
      contactPhone: string
      sortNo: number
    }[]
    birthDate: string
    age: number
  }
  practice: {
    yearsOfPractice: number
    refugeTakenDate: string
    pastPracticeExperience: string
    currentPracticeExperience: string
    visitRecords: string
    hasTakenPrecepts: number
    refugeTemple: string
  }
}

export const getCheckedOutRecordDetail = (personId: number) =>
  request.get<CheckedOutRecordDetail>(`/records/checked-out/${personId}`)
