import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { AuthTextField } from './AuthTextField'

type AuthPasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
  hint?: string
  successMessage?: string
  isValid?: boolean
}

export const AuthPasswordField = forwardRef<HTMLInputElement, AuthPasswordFieldProps>(function AuthPasswordField(
  { label, error, hint, successMessage, isValid = false, ...props },
  ref,
) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <AuthTextField
      ref={ref}
      {...props}
      label={label}
      type={isVisible ? 'text' : 'password'}
      autoComplete={props.autoComplete}
      error={error}
      hint={hint}
      successMessage={successMessage}
      isValid={isValid}
      icon={<LockKeyhole size={18} aria-hidden="true" />}
      rightSlot={
        <button
          type="button"
          className="auth-field__toggle"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  )
})
