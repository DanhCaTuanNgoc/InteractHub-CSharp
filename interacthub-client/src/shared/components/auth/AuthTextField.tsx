import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  icon?: ReactNode
  rightSlot?: ReactNode
}

export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(function AuthTextField(
  { label, error, icon, rightSlot, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={inputId}>
        {label}
      </label>

      <div className={['auth-field__control', error ? 'is-error' : ''].filter(Boolean).join(' ')}>
        {icon ? <span className="auth-field__icon">{icon}</span> : null}

        <input
          ref={ref}
          id={inputId}
          className={['auth-field__input', className ?? ''].join(' ').trim()}
          {...props}
        />

        {rightSlot ? <span className="auth-field__action">{rightSlot}</span> : null}
      </div>

      {error ? <p className="auth-field__error">{error}</p> : null}
    </div>
  )
})
