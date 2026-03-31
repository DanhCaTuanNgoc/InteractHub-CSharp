import type { UserSummary } from './user'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  userName: string
  email: string
  password: string
  fullName: string
}

export type AuthResponse = {
  token: string
  expiresIn: number
  user: UserSummary
}
