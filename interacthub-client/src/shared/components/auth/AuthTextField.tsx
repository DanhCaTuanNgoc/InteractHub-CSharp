import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  successMessage?: string
  isValid?: boolean
  icon?: ReactNode
  rightSlot?: ReactNode
}

export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(function AuthTextField(
  { label, error, hint, successMessage, isValid = false, icon, rightSlot, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name
  const messageId = inputId ? `${inputId}-message` : undefined
  const controlStateClass = error ? 'is-error' : isValid ? 'is-valid' : ''
  const message = error ?? (isValid ? successMessage : hint)

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={inputId}>
        {label}
      </label>

      <div className={['auth-field__control', controlStateClass].filter(Boolean).join(' ')}>
        {icon ? <span className="auth-field__icon">{icon}</span> : null}

        <input
          ref={ref}
          id={inputId}
          className={['auth-field__input', className ?? ''].join(' ').trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          {...props}
        />

        {rightSlot ? <span className="auth-field__action">{rightSlot}</span> : null}
      </div>

      {message ? (
        <p id={messageId} className={error ? 'auth-field__error' : isValid ? 'auth-field__success' : 'auth-field__hint'}>
          {message}
        </p>
      ) : null}
    </div>
  )
})
