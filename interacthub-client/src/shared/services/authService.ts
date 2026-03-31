import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const authService = {
  login(payload: LoginRequest): Promise<AuthResponse> {
    return unwrap(axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload))
  },
  register(payload: RegisterRequest): Promise<AuthResponse> {
    return unwrap(axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload))
  },
}
