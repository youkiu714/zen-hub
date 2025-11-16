import request from '@/utils/request'
import type { LoginForm, User, ApiResponse } from '@/types'
import { DEV_CONFIG, MOCK_USERS, generateMockToken, mockDelay } from '@/utils/dev-tools'

export const login = async (data: LoginForm): Promise<{ token: string; user: User }> => {
  try {
    const response = await request({
      url: '/api/auth/login',
      method: 'post',
      data
    })

    if (response && response.token && response.userId) {
      return {
        token: response.token,
        user: {
          userId: response.userId,
          displayName: response.displayName,
          roleCode: response.roleCode,
          permissions: response.permissions || [],
          department:response.departmentCode
        }
      }
    }

    throw new Error('登录响应格式异常')
  } catch (error: any) {
    throw new Error(error.message)
  }
}