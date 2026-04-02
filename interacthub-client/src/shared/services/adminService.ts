import { axiosClient } from '../api/axiosClient'
import type { ApiResponse } from '../types/api'
import type { PostReport } from '../types/postReport'

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise
  if (!response.data.success) {
    throw new Error(response.data.message)
  }
  return response.data.data
}

export const adminService = {
  getReports(): Promise<PostReport[]> {
    return unwrap(axiosClient.get<ApiResponse<PostReport[]>>('/admin/reports'))
  },
  resolveReport(reportId: string, status: string): Promise<PostReport> {
    return unwrap(axiosClient.put<ApiResponse<PostReport>>(`/admin/reports/${reportId}/resolve`, { status }))
  },
  deletePost(postId: string): Promise<void> {
    return unwrap(axiosClient.delete<ApiResponse<object>>(`/admin/posts/${postId}`)).then(() => undefined)
  },
}
