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
  const message = error ?? (isValid ? successMessage : hint)
  const controlClasses = [
    'flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 shadow-sm transition focus-within:ring-4',
    error ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-500/10' : isValid ? 'border-emerald-300 focus-within:border-emerald-500 focus-within:ring-emerald-500/10' : 'border-slate-200 focus-within:border-cyan-500 focus-within:ring-cyan-500/10',
  ].join(' ')

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700" htmlFor={inputId}>
        {label}
      </label>

      <div className={controlClasses}>
        {icon ? <span className="shrink-0 text-slate-400">{icon}</span> : null}

        <input
          ref={ref}
          id={inputId}
          className={['min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400', className ?? ''].filter(Boolean).join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          {...props}
        />

        {rightSlot ? <span className="shrink-0">{rightSlot}</span> : null}
      </div>

      {message ? (
        <p id={messageId} className={error ? 'text-xs font-medium text-rose-600' : isValid ? 'text-xs font-medium text-emerald-600' : 'text-xs text-slate-500'}>
          {message}
        </p>
      ) : null}
    </div>
  )
})
