import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { Hashtag } from '../types/hashtag'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const hashtagService = {
  getTrending(top = 10): Promise<Hashtag[]> {
    return unwrap(axiosClient.get<ApiResponse<Hashtag[]>>('/hashtags/trending', { params: { top } }))
  },
}
