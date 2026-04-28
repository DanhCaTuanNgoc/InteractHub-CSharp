import { forwardRef, type InputHTMLAttributes } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={[
          'flex h-11 w-full rounded-2xl border bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100'
            ,
          error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  )
})
