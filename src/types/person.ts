// 基础信息模型
export interface PersonBasicInfo {
  personId: number
  name: string
  gender: number // 0未知 1男 2女
  age: number
  ethnic: string
  mobile: string
  idCard: string
  birthDate: string
  weChat: string
  province: string
  city: string
  provinceCity: string // 省市组合
  address: string
  departmentCode: string
  photoUrl: string
}

// 学修信息模型
export interface PersonPracticeInfo {
  yearsOfPractice: number
  refugeTakenDate: string // 皈依时间
  pastPracticeExperience: string // 过往经历
  currentPracticeExperience: string // 现况
  visitRecords: string // 来访记录
  hasTakenPrecepts: number // 是否受戒：0否 1是 (具体看字典定义)
  refugeTemple: string // 皈依寺院
}

// 接口返回的聚合对象 (替代原有的 ApplicationDetailVO)
export interface PersonDetailVO {
  basic: PersonBasicInfo
  practice: PersonPracticeInfo
  // 注意：接口文档中没有 lodging 字段
}