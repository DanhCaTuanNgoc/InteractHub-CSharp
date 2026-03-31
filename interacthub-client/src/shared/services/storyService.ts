import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { CreateStoryRequest, Story } from '../types/story'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const storyService = {
  getAll(): Promise<Story[]> {
    return unwrap(axiosClient.get<ApiResponse<Story[]>>('/stories'))
  },
  create(payload: CreateStoryRequest): Promise<Story> {
    return unwrap(axiosClient.post<ApiResponse<Story>>('/stories', payload))
  },
}
