const ACCESS_TOKEN_KEY = 'interacthub_access_token'
const AUTH_USER_KEY = 'interacthub_auth_user'

export type AuthUser = {
  id: string
  username: string
  fullName: string
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const rawValue = localStorage.getItem(AUTH_USER_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(AUTH_USER_KEY)
}

export function clearAuthStorage(): void {
  clearAccessToken()
  clearStoredUser()
}
