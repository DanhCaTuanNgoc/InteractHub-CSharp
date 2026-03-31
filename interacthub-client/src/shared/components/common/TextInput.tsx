import type { InputHTMLAttributes } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function TextInput({ label, error, className, id, ...props }: TextInputProps) {
  const inputId = id ?? props.name

  return (
    <div className="form-control">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} className={['text-input', className ?? ''].join(' ').trim()} {...props} />
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  )
}
