import { forwardRef, type InputHTMLAttributes } from 'react'

type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
  previewUrl?: string | null
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  { label, error, previewUrl, id, ...props },
  ref,
) {
  const inputId = id ?? props.name

  return (
    <div className="form-control">
      <label htmlFor={inputId}>{label}</label>
      <input ref={ref} id={inputId} type="file" className="text-input text-input--file" {...props} />
      {previewUrl ? <img src={previewUrl} alt="Preview" className="file-preview" /> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  )
})
