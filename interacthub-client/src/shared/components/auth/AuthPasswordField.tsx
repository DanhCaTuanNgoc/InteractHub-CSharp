import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { AuthTextField } from './AuthTextField'

type AuthPasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
}

export function AuthPasswordField({ label, error, ...props }: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <AuthTextField
      {...props}
      label={label}
      type={isVisible ? 'text' : 'password'}
      autoComplete={props.autoComplete}
      error={error}
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
}
