type AuthErrorMessageProps = {
  message: string
}

export function AuthErrorMessage({ message }: AuthErrorMessageProps) {
  return <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{message}</p>
}
