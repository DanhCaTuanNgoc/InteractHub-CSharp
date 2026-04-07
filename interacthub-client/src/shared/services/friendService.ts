import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { Friendship } from '../types/friendship'
import type { FriendshipRelationship } from '../types/friendshipRelationship'
import type { UserSummary } from '../types/user'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const friendService = {
  getFriends(): Promise<UserSummary[]> {
    return unwrap(axiosClient.get<ApiResponse<UserSummary[]>>('/friends'))
  },
  getRelationship(userId: string): Promise<FriendshipRelationship> {
    return unwrap(axiosClient.get<ApiResponse<FriendshipRelationship>>(`/friends/status/${userId}`))
  },
  sendRequest(userId: string): Promise<Friendship> {
    return unwrap(axiosClient.post<ApiResponse<Friendship>>(`/friends/request/${userId}`))
  },
  accept(userId: string): Promise<Friendship> {
    return unwrap(axiosClient.put<ApiResponse<Friendship>>(`/friends/accept/${userId}`))
  },
  decline(userId: string): Promise<Friendship> {
    return unwrap(axiosClient.put<ApiResponse<Friendship>>(`/friends/decline/${userId}`))
  },
  remove(userId: string): Promise<void> {
    return unwrap(axiosClient.delete<ApiResponse<object>>(`/friends/${userId}`)).then(() => undefined)
  },
}
