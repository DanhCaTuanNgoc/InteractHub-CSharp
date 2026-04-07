import { axiosClient } from '../api/axiosClient'
import type { ApiResponse, PagedResult } from '../types/api'
import type { Comment, CreatePostRequest, Post, UpdatePostRequest } from '../types/post'

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const FEED_CACHE_TTL_MS = 30_000
const feedCache = new Map<string, CacheEntry<PagedResult<Post>>>()

function getFeedCacheKey(page: number, pageSize: number): string {
  return `${page}:${pageSize}`
}

function getCachedFeed(page: number, pageSize: number): PagedResult<Post> | null {
  const key = getFeedCacheKey(page, pageSize)
  const cached = feedCache.get(key)

  if (!cached) {
    return null
  }

  if (cached.expiresAt <= Date.now()) {
    feedCache.delete(key)
    return null
  }

  return cached.value
}

function setCachedFeed(page: number, pageSize: number, value: PagedResult<Post>): void {
  feedCache.set(getFeedCacheKey(page, pageSize), {
    value,
    expiresAt: Date.now() + FEED_CACHE_TTL_MS,
  })
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const postService = {
  async getFeed(page: number, pageSize: number): Promise<PagedResult<Post>> {
    const cached = getCachedFeed(page, pageSize)
    if (cached) {
      return cached
    }

    const data = await unwrap(
      axiosClient.get<ApiResponse<PagedResult<Post>>>('/posts', {
        params: { page, pageSize },
      }),
    )

    setCachedFeed(page, pageSize, data)
    return data
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
  invalidateFeedCache(): void {
    feedCache.clear()
  },
}
