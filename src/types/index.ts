// 用户相关类型定义
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

// 登录表单类型
export interface LoginForm {
  username: string
  password: string
  remember: boolean
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 路由元信息类型
export interface RouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  roles?: string[]
  permissions?: string[]
  keepAlive?: boolean
  affix?: boolean
}

// 菜单项类型
export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  roles?: string[]
  permissions?: string[]
}

// 主题配置类型
export interface ThemeConfig {
  primaryColor: string
  isDark: boolean
  sidebarCollapsed: boolean
  showTabs: boolean
  showBreadcrumb: boolean
}



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
  recommenderPhone: string
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
  refugeTakenDate: string
  yearsOfPractice: number
  hasTakenPrecepts: boolean
  pastPracticeExperience: string
  currentPracticeExperience: string
}







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
  /**
   * 年龄（可留空，后端会按出生年月计算填充） 新增加
   */
  age?: number
  /**
   * 出生年月   新增加
   */
  birthDate?: string
  /**
   * 所属部组（PROJECT/READING/COMPILATION/OTHER）  新增加
   */
  departmentCode?: string
  [property: string]: any
}

export interface PracticeInfo {
  yearsOfPractice?: number
  refugeTakenDate?: string
  pastPracticeExperience?: string
  currentPracticeExperience?: string
  visitRecords?: string
  hasTakenPrecepts?: boolean | null // 注意：UI 需要区分 "无" vs true
  /**
   * 皈依寺院  新增加
   */
  refugeTemple?: string
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
  /**
   * 来寺因缘（若 practice.visitAffinity 未填可在此提供）  新增加
   */
  causeOfVisit?: string
  /**
   * 出发行程日期
   */
  departureDate?: string
  /**
   * 用斋选择（0无 1早斋 2午斋 3药石）  新增加
   */
  mealPreference?: number
  /**
   * 离开行程日期  新增加
   */
  returnDate?: string
  /**
   * 自我评价  新增加
   */
  selfEvaluation?: string
  /**
   * 短住原因及期许  新增加
   */
  shortStayReason?: string
  [property: string]: any
}

export interface ApplicationSubmitRequest {
  basic: BasicInfo
  practice: PracticeInfo
  lodging: LodgingInfo
  [property: string]: any
}

// 文件上传相关类型定义
export interface UploadAvatarRequest {
  personId?: number;
}

export interface UploadAvatarResponse {
  url: string;
  path: string;
}
