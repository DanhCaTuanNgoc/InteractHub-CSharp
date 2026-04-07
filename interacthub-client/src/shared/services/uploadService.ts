import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { FileUploadResponse } from '../types/upload'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])

function validateImageFile(file: File): void {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Anh vuot qua gioi han 5MB. Vui long chon anh nho hon.')
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    throw new Error('Dinh dang anh khong ho tro. Chi chap nhan JPG, PNG, WEBP, GIF.')
  }
}

export const uploadService = {
  async uploadImage(file: File): Promise<FileUploadResponse> {
    validateImageFile(file)

    const formData = new FormData()
    formData.append('file', file)

    // Let the browser set multipart boundary automatically for FormData.
    const response = await axiosClient.post<ApiResponse<FileUploadResponse>>('/uploads/image', formData)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  },
}
