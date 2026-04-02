import type { UserSummary } from './user'

export type PostReport = {
  id: string
  postId: string
  reason: string
  status: string
  createdAt: string
  reporter: UserSummary
}
