import { axiosClient } from '../api/axiosClient'
import type { ApiResponse, PagedResult } from '../types/api'
import type { UpdateProfileRequest, UserSummary } from '../types/user'

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const SEARCH_CACHE_TTL_MS = 60_000
const searchCache = new Map<string, CacheEntry<PagedResult<UserSummary>>>()

function getSearchCacheKey(keyword: string, page: number, pageSize: number): string {
  return `${keyword.trim().toLowerCase()}|${page}|${pageSize}`
}

function getCachedSearch(keyword: string, page: number, pageSize: number): PagedResult<UserSummary> | null {
  const key = getSearchCacheKey(keyword, page, pageSize)
  const cached = searchCache.get(key)

  if (!cached) {
    return null
  }

  if (cached.expiresAt <= Date.now()) {
    searchCache.delete(key)
    return null
  }

  return cached.value
}

function setCachedSearch(keyword: string, page: number, pageSize: number, value: PagedResult<UserSummary>): void {
  searchCache.set(getSearchCacheKey(keyword, page, pageSize), {
    value,
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
  })
}

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
  async search(keyword: string, page: number, pageSize: number): Promise<PagedResult<UserSummary>> {
    const cached = getCachedSearch(keyword, page, pageSize)
    if (cached) {
      return cached
    }

    const data = await unwrap(
      axiosClient.get<ApiResponse<PagedResult<UserSummary>>>('/users/search', {
        params: { q: keyword, page, pageSize },
      }),
    )

    setCachedSearch(keyword, page, pageSize, data)
    return data
  },
  invalidateSearchCache(): void {
    searchCache.clear()
  },
}
