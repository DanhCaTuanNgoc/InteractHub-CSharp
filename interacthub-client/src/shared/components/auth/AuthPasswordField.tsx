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
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
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
