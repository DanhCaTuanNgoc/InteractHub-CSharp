type AuthErrorMessageProps = {
  message: string
}

export function AuthErrorMessage({ message }: AuthErrorMessageProps) {
  return <p className="auth-form__submit-error">{message}</p>
}
