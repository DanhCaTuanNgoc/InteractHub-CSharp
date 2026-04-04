const TECHNICAL_ERROR_PATTERNS = [
  /request failed/i,
  /network error/i,
  /timeout/i,
  /timed out/i,
  /ecconnaborted/i,
  /failed to fetch/i,
  /status code\s*5\d\d/i,
]

export const GENERIC_ERROR_MESSAGE = 'Da xay ra su co. Vui long thu lai.'

export function toSafeErrorMessage(error: unknown, fallback = GENERIC_ERROR_MESSAGE): string {
  if (!(error instanceof Error)) {
    return fallback
  }

  const message = error.message?.trim()
  if (!message) {
    return fallback
  }

  const isTechnical = TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))
  return isTechnical ? fallback : message
}
