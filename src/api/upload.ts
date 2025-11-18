import request from '@/utils/request'
import type { UploadAvatarRequest, ApiResponse, UploadAvatarResponse } from '@/types'

/**
 * 上传头像
 */
export const uploadAvatar = (
  file: File,
  params?: UploadAvatarRequest
): Promise<UploadAvatarResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  // 如果有 personId 参数，添加到 formData 中
  if (params?.personId) {
    formData.append('personId', params.personId.toString())
  }

  return request({
    url: '/files/avatar',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}