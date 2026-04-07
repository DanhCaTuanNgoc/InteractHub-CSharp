const TECHNICAL_ERROR_PATTERNS = [
  /network error/i,
  /timeout/i,
  /timed out/i,
  /ecconnaborted/i,
  /failed to fetch/i,
  /status code\s*5\d\d/i,
]

export const GENERIC_ERROR_MESSAGE = 'Da xay ra su co. Vui long thu lai.'

type ApiErrorPayload = {
  message?: string
  error?: string
  detail?: string
  title?: string
  errors?: Record<string, string[]>
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

export function toSafeErrorMessage(error: unknown, fallback = GENERIC_ERROR_MESSAGE): string {
  const apiMessage = getApiMessage(error)
  if (apiMessage) {
    return apiMessage
  }

  const status = getHttpStatus(error)
  if (status !== null) {
    return `Yeu cau that bai (HTTP ${status}).`
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
    return 'Khong the ket noi den may chu. Vui long kiem tra backend/API.'
  }

  return message
}
