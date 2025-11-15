import type { ApplicationType, ApplicationStatus } from '../types'

export const useOrderUtils = () => {
  const getApplicationTypeTag = (type: ApplicationType): string => {
    const tagMap: Record<ApplicationType, string> = {
      short_stay: 'primary',
      express: 'success',
      monk_family: 'warning',
      team: 'info',
      special: 'danger'
    }
    return tagMap[type] || 'info'
  }

  const getApplicationTypeText = (type: ApplicationType): string => {
    const textMap: Record<ApplicationType, string> = {
      short_stay: '短住',
      express: '直通车',
      monk_family: '僧亲',
      team: '团队挂单',
      special: '特殊客人'
    }
    return textMap[type] || '未知'
  }

  const getStatusTag = (status: ApplicationStatus): string => {
    const tagMap: Record<ApplicationStatus, string> = {
      pending_review: 'primary',
      pending_monk: 'warning',
      approved: 'success',
      rejected: 'danger'
    }
    return tagMap[status] || 'info'
  }

  const getStatusText = (status: ApplicationStatus): string => {
    const textMap: Record<ApplicationStatus, string> = {
      pending_review: '待审核',
      pending_monk: '待法师审核',
      approved: '已通过',
      rejected: '已驳回'
    }
    return textMap[status] || '未知'
  }

  const getActionButtonConfig = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending_review':
        return {
          show: true,
          type: 'success' as const,
          text: '审核',
          action: 'review'
        }
      case 'pending_monk':
        return {
          show: true,
          type: 'warning' as const,
          text: '审核',
          action: 'review'
        }
      default:
        return {
          show: false,
          type: 'primary' as const,
          text: '',
          action: ''
        }
    }
  }

  const maskIdCard = (idCard: string): string => {
    if (!idCard || idCard.length < 8) return idCard
    return idCard.substring(0, 4) + '********' + idCard.substring(idCard.length - 4)
  }

  const calculateStayDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const formatDateRange = (startDate: string, endDate: string): string => {
    return `${startDate} 至 ${endDate}`
  }

  return {
    getApplicationTypeTag,
    getApplicationTypeText,
    getStatusTag,
    getStatusText,
    getActionButtonConfig,
    maskIdCard,
    calculateStayDays,
    formatDateRange
  }
}