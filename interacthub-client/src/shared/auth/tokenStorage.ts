const ACCESS_TOKEN_KEY = 'interacthub_access_token'
const AUTH_USER_KEY = 'interacthub_auth_user'

export type AuthUser = {
  id: string
  username: string
  fullName: string
  avatarUrl?: string | null
  roles: string[]
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
    const parsed = JSON.parse(rawValue) as Partial<AuthUser>
    if (!parsed || typeof parsed !== 'object') {
      localStorage.removeItem(AUTH_USER_KEY)
      return null
    }

    return {
      id: typeof parsed.id === 'string' ? parsed.id : '',
      username: typeof parsed.username === 'string' ? parsed.username : '',
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : null,
      roles: Array.isArray(parsed.roles)
        ? parsed.roles.filter((value): value is string => typeof value === 'string')
        : [],
    }
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

export function extractRolesFromToken(token: string): string[] {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return []
    }

    const normalizedBase64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = atob(normalizedBase64)
    const claims = JSON.parse(decodedPayload) as Record<string, unknown>

    const roleClaimKeys = [
      'role',
      'roles',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
    ]

    const roles = roleClaimKeys.flatMap((key) => {
      const claimValue = claims[key]
      if (typeof claimValue === 'string') {
        return [claimValue]
      }

      if (Array.isArray(claimValue)) {
        return claimValue.filter((value): value is string => typeof value === 'string')
      }

      return []
    })

    return Array.from(new Set(roles))
  } catch {
    return []
  }
}
