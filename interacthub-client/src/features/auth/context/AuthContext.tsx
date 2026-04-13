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
import { userService } from '../../../shared/services/userService'

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
  updateUser: (patch: Partial<Pick<AuthUser, 'username' | 'fullName' | 'avatarUrl'>>) => void
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

  const updateUser = useCallback((patch: Partial<Pick<AuthUser, 'username' | 'fullName' | 'avatarUrl'>>) => {
    setUser((current) => {
      if (!current) {
        return current
      }

      const nextUser: AuthUser = {
        ...current,
        ...patch,
      }

      setStoredUser(nextUser)
      return nextUser
    })
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

  useEffect(() => {
    if (!accessToken || !user?.id) {
      return
    }

    let cancelled = false

    const syncProfile = async () => {
      try {
        const profile = await userService.getProfile(user.id)
        if (cancelled) {
          return
        }

        setUser((current) => {
          if (!current) {
            return current
          }

          const nextUser: AuthUser = {
            ...current,
            username: profile.userName,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl ?? null,
          }

          setStoredUser(nextUser)
          return nextUser
        })
      } catch {
        // Keep current auth user if profile sync fails.
      }
    }

    void syncProfile()

    return () => {
      cancelled = true
    }
  }, [accessToken, user?.id])

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
      updateUser,
      logout,
    }),
    [user, accessToken, hasRole, login, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
