
// 格式化日期 - 完整日期转换为 yyyy-mm-nn
export const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  try {
    // 如果是完整的日期时间格式，只取日期部分
    if (dateStr.includes(' ')) {
      return dateStr.split(' ')[0]
    }
    // 如果已经是日期格式，直接返回
    return dateStr
  } catch (e) {
    return dateStr
  }
}


/** 禁用当前时间之后的日期（用于出生年月） */
export const disabledBirthDate = (time: Date) => {
  return time.getTime() > Date.now()
}
