import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { Notification } from '../types/notification'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const notificationService = {
  getAll(): Promise<Notification[]> {
    return unwrap(axiosClient.get<ApiResponse<Notification[]>>('/notifications'))
  },
  markRead(notificationId: string): Promise<void> {
    return unwrap(axiosClient.put<ApiResponse<object>>(`/notifications/${notificationId}/read`)).then(() => undefined)
  },
  markAllRead(): Promise<number> {
    return unwrap(axiosClient.put<ApiResponse<number>>('/notifications/read-all'))
  },
}
