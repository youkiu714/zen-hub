/**
 * 表单校验规则 Hook
 * 用于订单申请表单的字段校验
 */

import type { FormRules } from 'element-plus'

// 手机号码校验规则
export const mobileValidator = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号码'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

// 身份证号码校验规则
export const idCardValidator = (rule: any, value: string, callback: any) => {
    console.log("idCard:", value)
  if (!value) {
    callback(new Error('请输入身份证号'))
  } else if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)) {
    callback(new Error('请输入正确的18位身份证号'))
  } else {
    callback()
  }
}

// 表单校验规则配置
export const useFormValidationRules = (): FormRules => {
  return {
    // 基本信息校验
    mobile: [
      { validator: mobileValidator, trigger: 'blur', required: true }
    ],
    idCard: [
      { validator: idCardValidator, trigger: 'blur', required: true }
    ],
    
    // 紧急联系人电话校验
    'emergencyContacts.0.contactPhone': [
      { validator: mobileValidator, trigger: 'blur', required: true }
    ],
    'emergencyContacts.1.contactPhone': [
      { validator: mobileValidator, trigger: 'blur' , required: true}
    ],
    
    // 推荐人联系方式校验
    recommenderPhone: [
      { validator: mobileValidator, trigger: 'blur', required: true }
    ]
  }
}

// 导出单独的校验函数，方便在其他地方使用
export const validateMobile = (mobile: string): boolean => {
  return /^1[3-9]\d{9}$/.test(mobile)
}

export const validateIdCard = (idCard: string): boolean => {
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard)
}