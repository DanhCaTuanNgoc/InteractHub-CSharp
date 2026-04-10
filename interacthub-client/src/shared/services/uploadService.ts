import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { FileUploadResponse } from '../types/upload'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])

function createTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `upload-${Date.now()}`
}

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
    const traceId = createTraceId()

    const formData = new FormData()
    formData.append('file', file)

    console.info('[UPLOAD][CLIENT_START]', {
      traceId,
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Let the browser set multipart boundary automatically for FormData.
    const response = await axiosClient.post<ApiResponse<FileUploadResponse>>('/uploads/image', formData, {
      timeout: 60000,
      headers: {
        'X-Upload-Trace-Id': traceId,
      },
    })

    console.info('[UPLOAD][CLIENT_RESPONSE]', {
      traceId,
      success: response.data.success,
      message: response.data.message,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    console.info('[UPLOAD][CLIENT_SUCCESS]', {
      traceId,
      url: response.data.data.url,
      contentType: response.data.data.contentType,
      size: response.data.data.size,
    })

    return response.data.data
  },
}
