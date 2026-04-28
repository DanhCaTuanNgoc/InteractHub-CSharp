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
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        type="file"
        className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100 focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
        {...props}
      />
      {previewUrl ? <img src={previewUrl} alt="Preview" className="mt-2 max-h-72 w-full rounded-2xl border border-slate-200 object-cover shadow-sm" /> : null}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  )
})
