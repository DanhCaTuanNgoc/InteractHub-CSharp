import { axiosClient } from '../api/axiosClient'
import axios from 'axios'
import type { ApiResponse } from '../types/api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const response = await promise
    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    throw new Error(resolveErrorMessage(error))
  }
}

function resolveErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Yeu cau that bai. Vui long thu lai.'
  }

  const data = error.response?.data
  if (data && typeof data === 'object') {
    const apiResponse = data as {
      message?: unknown
      errors?: unknown
      title?: unknown
    }

    if (typeof apiResponse.message === 'string' && apiResponse.message.trim().length > 0) {
      return apiResponse.message
    }

    if (Array.isArray(apiResponse.errors)) {
      const firstError = apiResponse.errors.find(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
      if (firstError) {
        return firstError
      }
    }

    if (apiResponse.errors && typeof apiResponse.errors === 'object') {
      const validationErrors = Object.values(apiResponse.errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

      if (validationErrors.length > 0) {
        return validationErrors[0]
      }
    }

    if (typeof apiResponse.title === 'string' && apiResponse.title.trim().length > 0) {
      return apiResponse.title
    }
  }

  return error.message || 'Yeu cau that bai. Vui long thu lai.'
}

export const authService = {
  login(payload: LoginRequest): Promise<AuthResponse> {
    return unwrap(axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload))
  },
  register(payload: RegisterRequest): Promise<AuthResponse> {
    return unwrap(axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload))
  },
}
