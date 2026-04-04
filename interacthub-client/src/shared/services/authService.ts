import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'
import { toSafeErrorMessage } from '../utils/errorMessage'

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
  return toSafeErrorMessage(error)
}

export const authService = {
  login(payload: LoginRequest): Promise<AuthResponse> {
    return unwrap(axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload))
  },
  register(payload: RegisterRequest): Promise<AuthResponse> {
    return unwrap(axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload))
  },
}
