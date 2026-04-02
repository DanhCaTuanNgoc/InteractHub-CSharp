import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { AUTH_UNAUTHORIZED_EVENT } from '../../../shared/api/axiosClient'
import {
  clearAuthStorage,
  extractRolesFromToken,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
  type AuthUser,
} from '../../../shared/auth/tokenStorage'

type LoginPayload = {
  accessToken: string
  user: Omit<AuthUser, 'roles'>
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  login: (payload: LoginPayload) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken())
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  const logout = useCallback(() => {
    clearAuthStorage()
    setAccessTokenState(null)
    setUser(null)
  }, [])

  const login = useCallback((payload: LoginPayload) => {
    const roles = extractRolesFromToken(payload.accessToken)
    const userWithRoles: AuthUser = {
      ...payload.user,
      roles,
    }

    setAccessToken(payload.accessToken)
    setStoredUser(userWithRoles)
    setAccessTokenState(payload.accessToken)
    setUser(userWithRoles)
  }, [])

  useEffect(() => {
    if (!accessToken || !user) {
      return
    }

    if (user.roles.length > 0) {
      return
    }

    const roles = extractRolesFromToken(accessToken)
    const nextUser = {
      ...user,
      roles,
    }

    setStoredUser(nextUser)
    setUser(nextUser)
  }, [accessToken, user])

  const hasRole = useCallback(
    (role: string) => {
      if (!user) {
        return false
      }

      return user.roles.some((item) => item.toLowerCase() === role.toLowerCase())
    },
    [user],
  )

  useEffect(() => {
    const handleUnauthorized = () => logout()

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [logout])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      hasRole,
      login,
      logout,
    }),
    [user, accessToken, hasRole, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
