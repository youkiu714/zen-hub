// 订单状态枚举
export enum OrderStatus {
  Applied = 10,     // 申请中
  Pending = 20,     // 待入住
  CheckedIn = 30,   // 入住中
  CheckedOut = 40,  // 已退住
  Rejected = 50,    // 未通过
}

// 审核状态枚举
export enum ReviewStatus {
  Pending = 10,
  Approved = 20,
  Rejected = 30,
}

// 人员快照类型
export interface PersonSnapshot {
  name: string;
  city: string;
  province: string;
  gender: number;
  idCard: string;
  mobile: string;
  school: string;
  skills: string;
  weChat: string;
  address: string;
  marital: string;
  photoUrl: string;
  education: string;
  occupation: string;
  diseaseHistory: string;
  infectiousHistory: string;
  medicationHistory: string;
  emergencyContacts: Array<{
    sortNo: number;
    contactName: string;
    contactPhone: string;
  }>;
}

// 修行快照类型
export interface PracticeSnapshot {
  visitRecords: string;
  yearsOfPractice: number;
  pastPracticeExperience: string;
}

// 订单项类型
export interface OrderItem {
  id: number;
  personId: number;
  applicationType: number;
  checkinDate: string;
  checkoutDate: string;
  specialRequest: string;
  recommenderName: string;
  recommenderRelation: string;
  recommenderComment: string;
  status: OrderStatus;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: number;
  createdAt: string | null;
  updatedAt: string | null;
  personSnapshot: string | null; // JSON字符串
  practiceSnapshot: string | null; // JSON字符串
  reviewStatus: ReviewStatus;

  // 解析后的数据
  parsedPerson?: PersonSnapshot;
  parsedPractice?: PracticeSnapshot;
}

// 分页数据类型
export interface OrderListResponse {
  code: number;
  message: string;
  data: {
    records: OrderItem[];
    total: number;
    size: number;
    current: number;
    pages: number;
  };
  timestamp: number;
  success: boolean;
}
