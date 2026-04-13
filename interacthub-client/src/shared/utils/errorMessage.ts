const TECHNICAL_ERROR_PATTERNS = [
  /network error/i,
  /timeout/i,
  /timed out/i,
  /ecconnaborted/i,
  /failed to fetch/i,
  /status code\s*5\d\d/i,
]

export const GENERIC_ERROR_MESSAGE = 'Đã xảy ra sự cố. Vui lòng thử lại.'

const LOGIN_FAILED_MESSAGE = 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại.'
const REGISTER_CONFLICT_MESSAGE = 'Email hoặc tên người dùng đã tồn tại. Vui lòng thử thông tin khác.'
const UNAUTHORIZED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
const FORBIDDEN_MESSAGE = 'Bạn không có quyền thực hiện thao tác này.'
const NOT_FOUND_MESSAGE = 'Nội dung bạn tìm không tồn tại hoặc đã bị xóa.'
const TOO_MANY_REQUESTS_MESSAGE = 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.'
const SERVER_ERROR_MESSAGE = 'Hệ thống đang bảo trì. Vui lòng thử lại trong giây lát.'

type ApiErrorPayload = {
  message?: string
  error?: string
  detail?: string
  title?: string
  errors?: Record<string, string[]>
}

function getRequestUrl(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return ''
  }

  const config = (error as { config?: { url?: unknown } }).config
  return typeof config?.url === 'string' ? config.url.toLowerCase() : ''
}

function isAuthLoginRequest(error: unknown): boolean {
  const requestUrl = getRequestUrl(error)
  return requestUrl.includes('/auth/login')
}

function isAuthRegisterRequest(error: unknown): boolean {
  const requestUrl = getRequestUrl(error)
  return requestUrl.includes('/auth/register')
}

function getHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const response = (error as { response?: { status?: unknown } }).response
  const status = response?.status
  return typeof status === 'number' ? status : null
}

function getApiMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const maybeResponse = (error as { response?: { data?: unknown } }).response
  const data = maybeResponse?.data
  if (!data || typeof data !== 'object') {
    return null
  }

  const payload = data as ApiErrorPayload
  const candidate = payload.message ?? payload.error ?? payload.detail
  const safeMessage = typeof candidate === 'string' ? candidate.trim() : ''
  if (safeMessage.length > 0) {
    return safeMessage
  }

  if (payload.errors && typeof payload.errors === 'object') {
    const firstFieldErrors = Object.values(payload.errors).find(
      (value) => Array.isArray(value) && value.length > 0 && typeof value[0] === 'string',
    )

    if (firstFieldErrors?.[0]) {
      return firstFieldErrors[0].trim()
    }
  }

  const title = typeof payload.title === 'string' ? payload.title.trim() : ''
  return title.length > 0 ? title : null
}

function mapStatusToMessage(error: unknown, status: number): string | null {
  if (isAuthLoginRequest(error) && status === 401) {
    return LOGIN_FAILED_MESSAGE
  }

  if (isAuthRegisterRequest(error) && (status === 400 || status === 409)) {
    return REGISTER_CONFLICT_MESSAGE
  }

  if (status === 401) {
    return UNAUTHORIZED_MESSAGE
  }

  if (status === 403) {
    return FORBIDDEN_MESSAGE
  }

  if (status === 404) {
    return NOT_FOUND_MESSAGE
  }

  if (status === 429) {
    return TOO_MANY_REQUESTS_MESSAGE
  }

  if (status >= 500) {
    return SERVER_ERROR_MESSAGE
  }

  return null
}

export function toSafeErrorMessage(error: unknown, fallback = GENERIC_ERROR_MESSAGE): string {
  const apiMessage = getApiMessage(error)
  if (apiMessage && !/^yeu cau that bai\s*\(http\s*\d{3}\)\.?$/i.test(apiMessage)) {
    return apiMessage
  }

  const status = getHttpStatus(error)
  if (status !== null) {
    const mappedMessage = mapStatusToMessage(error, status)
    if (mappedMessage) {
      return mappedMessage
    }

    return fallback
  }

  if (!(error instanceof Error)) {
    return fallback
  }

  const message = error.message?.trim()
  if (!message) {
    return fallback
  }

  const isTechnical = TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))
  if (isTechnical) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
  }

  return message
}
