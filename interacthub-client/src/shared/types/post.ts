import type { UserSummary } from './user'

export type Comment = {
  id: string
  content: string
  createdAt: string
  user: UserSummary
}

export type Post = {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  originalPostId?: string | null
  originalPost?: Post | null
  likeCount: number
  commentCount: number
  user: UserSummary
  hashtags: string[]
  recentComments: Comment[]
}

export type CreatePostRequest = {
  content: string
  imageUrl?: string
}

export type UpdatePostRequest = {
  content: string
  imageUrl?: string
}
