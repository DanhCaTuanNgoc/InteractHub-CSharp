export type UserSummary = {
  id: string
  userName: string
  email: string
  fullName: string
  avatarUrl?: string | null
  bio?: string | null
}

export type UpdateProfileRequest = {
  fullName: string
  bio?: string
  avatarUrl?: string
}
