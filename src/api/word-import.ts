/*
 * @Author: zhaoziying zhaoziying@kuaishou.com
 * @Date: 2026-02-01 01:14:31
 * @LastEditors: zhaoziying zhaoziying@kuaishou.com
 * @LastEditTime: 2026-02-01 03:04:03
 * @FilePath: /zen-hub/src/api/word-import.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by ${git_name_email}, All Rights Reserved. 
 */
import request from '@/utils/request'

export const uploadWordImportFiles = (
  applicationType: number,
  files: File[],
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return request({
    url: '/word-import/upload-files-async',
    method: 'POST',
    params: { applicationType },
    data: formData,
    onUploadProgress: (event) => {
      if (!event.total) {
        return
      }
      const percent = Math.round((event.loaded / event.total) * 100)
      onProgress?.(percent)
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const uploadWordImportArchive = (
  applicationType: number,
  file: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/word-import/upload-archive-async',
    method: 'POST',
    params: { applicationType },
    data: formData,
    onUploadProgress: (event) => {
      if (!event.total) {
        return
      }
      const percent = Math.round((event.loaded / event.total) * 100)
      onProgress?.(percent)
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export type WordImportProgress = {
  taskId: string
  status: string
  total: number
  processed: number
  successCount: number
  failCount: number
  errors: { fileName: string; message: string }[]
}

export const getWordImportProgress = (taskId: string) =>
  request.get<WordImportProgress>(`/word-import/progress/${taskId}`)
