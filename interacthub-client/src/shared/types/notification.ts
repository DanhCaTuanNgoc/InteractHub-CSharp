import type { UserSummary } from './user'

export type Notification = {
  id: string
  type: string
  content: string
  isRead: boolean
  createdAt: string
  sender: UserSummary
}
