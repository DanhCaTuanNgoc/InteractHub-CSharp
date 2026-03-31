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
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
  type AuthUser,
} from '../../../shared/auth/tokenStorage'

type LoginPayload = {
  accessToken: string
  user: AuthUser
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
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
    setAccessToken(payload.accessToken)
    setStoredUser(payload.user)
    setAccessTokenState(payload.accessToken)
    setUser(payload.user)
  }, [])

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
      login,
      logout,
    }),
    [user, accessToken, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
