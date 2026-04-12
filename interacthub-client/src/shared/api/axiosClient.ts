import axios from 'axios'
import { clearAuthStorage, getAccessToken } from '../auth/tokenStorage'
import { toSafeErrorMessage } from '../utils/errorMessage'

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

function isUploadRequest(url?: string): boolean {
  if (!url) {
    return false
  }

  return url.includes('/uploads')
}

function isAuthRequest(url?: string): boolean {
  if (!url) {
    return false
  }

  return url.includes('/auth/login') || url.includes('/auth/register')
}

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
})

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token && !isAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isUploadRequest(config.url)) {
    console.info('[UPLOAD][REQUEST]', {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      timeout: config.timeout,
      hasToken: Boolean(token),
      traceId: config.headers?.['X-Upload-Trace-Id'],
    })
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url as string | undefined
    if (isUploadRequest(requestUrl)) {
      console.error('[UPLOAD][RESPONSE_ERROR]', {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        method: error?.config?.method,
        baseURL: error?.config?.baseURL,
        url: requestUrl,
        traceId: error?.config?.headers?.['X-Upload-Trace-Id'],
        responseData: error?.response?.data,
      })
    }

    if (error.response?.status === 401 && !isAuthRequest(requestUrl)) {
      clearAuthStorage()
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
    }

    return Promise.reject(new Error(toSafeErrorMessage(error)))
  },
)
