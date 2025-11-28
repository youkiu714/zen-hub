/**
 * 评价记录接口
 */
export interface EvaluationRecord {
  id: string
  name: string
  avatar: string
  idCard: string
  type: 'short' | 'express' | 'monk' | 'group' | 'special'
  checkInDate: string
  checkOutDate: string
  status: 'pending' | 'completed'
  gender: string
  age: string
  nation: string
  phone: string
  duration: string
  purpose: string
}

/**
 * 评价表单接口
 */
export interface EvaluationForm {
  ratings: number[]
  comments: string
  overall: string
}

/**
 * 评分选项接口
 */
export interface RatingOption {
  value: number
  label: string
  icon: any
  color: string
}

/**
 * 评分项接口
 */
export interface RatingItem {
  label: string
  options: RatingOption[]
}

/**
 * 查看评价数据接口
 */
export interface ViewEvaluationData {
  discipline: number
  etiquette: number
  activity: number
  environment: number
  interaction: number
  comments: string
  overall: string
}

/**
 * 导出表单接口
 */
export interface ExportForm {
  range: 'current' | 'filtered' | 'all'
  format: 'excel' | 'csv'
}

/**
 * 评价弹窗配置接口
 */
export interface EvaluationDialogConfig {
  visible: boolean
  title: string
  showForm: boolean
  showEvaluation: boolean
}

/**
 * 导出弹窗配置接口
 */
export interface ExportDialogConfig {
  visible: boolean
}