import { axiosClient } from '../api/axiosClient'
import type { ApiResponse, PagedResult } from '../types/api'
import type { Comment, CreatePostRequest, Post, UpdatePostRequest } from '../types/post'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const postService = {
  getFeed(page: number, pageSize: number): Promise<PagedResult<Post>> {
    return unwrap(
      axiosClient.get<ApiResponse<PagedResult<Post>>>('/posts', {
        params: { page, pageSize },
      }),
    )
  },
  create(payload: CreatePostRequest): Promise<Post> {
    return unwrap(axiosClient.post<ApiResponse<Post>>('/posts', payload))
  },
  update(postId: string, payload: UpdatePostRequest): Promise<Post> {
    return unwrap(axiosClient.put<ApiResponse<Post>>(`/posts/${postId}`, payload))
  },
  remove(postId: string): Promise<void> {
    return unwrap(axiosClient.delete<ApiResponse<object>>(`/posts/${postId}`)).then(() => undefined)
  },
  toggleLike(postId: string): Promise<Post> {
    return unwrap(axiosClient.post<ApiResponse<Post>>(`/posts/${postId}/like`))
  },
  addComment(postId: string, content: string): Promise<Comment> {
    return unwrap(axiosClient.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content }))
  },
  share(postId: string): Promise<Post> {
    return unwrap(axiosClient.post<ApiResponse<Post>>(`/posts/${postId}/share`))
  },
  report(postId: string, reason: string): Promise<void> {
    return unwrap(axiosClient.post<ApiResponse<object>>(`/posts/${postId}/report`, { reason })).then(() => undefined)
  },
}
