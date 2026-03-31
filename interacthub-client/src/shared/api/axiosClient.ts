import axios from 'axios'
import { clearAuthStorage, getAccessToken } from '../auth/tokenStorage'

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7058/api',
  timeout: 15000,
})

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage()
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
    }

    return Promise.reject(error)
  },
)
