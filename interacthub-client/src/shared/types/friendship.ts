import type { UserSummary } from './user'

export type Friendship = {
  id: string
  status: string
  createdAt: string
  sender: UserSummary
  receiver: UserSummary
}
