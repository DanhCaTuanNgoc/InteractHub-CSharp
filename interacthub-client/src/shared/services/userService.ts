import { axiosClient } from '../api/axiosClient'
import type { ApiResponse, PagedResult } from '../types/api'
import type { UpdateProfileRequest, UserSummary } from '../types/user'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const userService = {
  getProfile(userId: string): Promise<UserSummary> {
    return unwrap(axiosClient.get<ApiResponse<UserSummary>>(`/users/${userId}`))
  },
  updateProfile(userId: string, payload: UpdateProfileRequest): Promise<UserSummary> {
    return unwrap(axiosClient.put<ApiResponse<UserSummary>>(`/users/${userId}`, payload))
  },
  search(keyword: string, page: number, pageSize: number): Promise<PagedResult<UserSummary>> {
    return unwrap(
      axiosClient.get<ApiResponse<PagedResult<UserSummary>>>('/users/search', {
        params: { q: keyword, page, pageSize },
      }),
    )
  },
}
