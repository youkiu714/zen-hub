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
  recommenderRelation?: string;
  specialRequest?: string;
  status?: number;
}

export interface PracticeInfo {
  pastPracticeExperience?: string;
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