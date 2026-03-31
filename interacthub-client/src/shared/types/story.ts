import type { UserSummary } from './user'

export type Story = {
  id: string
  mediaUrl: string
  createdAt: string
  expiresAt: string
  user: UserSummary
}

export type CreateStoryRequest = {
  mediaUrl: string
}
