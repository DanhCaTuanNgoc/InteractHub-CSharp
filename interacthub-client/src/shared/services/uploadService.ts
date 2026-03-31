import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { FileUploadResponse } from '../types/upload'

export const uploadService = {
  async uploadImage(file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.post<ApiResponse<FileUploadResponse>>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  },
}
