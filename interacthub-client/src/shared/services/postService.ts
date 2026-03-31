import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { CreatePostRequest, Post } from '../types/post'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const postService = {
  getFeed(): Promise<Post[]> {
    return unwrap(axiosClient.get<ApiResponse<Post[]>>('/posts'))
  },
  create(payload: CreatePostRequest): Promise<Post> {
    return unwrap(axiosClient.post<ApiResponse<Post>>('/posts', payload))
  },
  toggleLike(postId: string): Promise<Post> {
    return unwrap(axiosClient.post<ApiResponse<Post>>(`/posts/${postId}/like`))
  },
}
