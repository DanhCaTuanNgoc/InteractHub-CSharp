import { useEffect, type MouseEvent, type PropsWithChildren } from 'react'
import { X } from 'lucide-react'

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) {
    return null
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title} onClick={handleBackdropClick}>
      <section className="w-full max-w-2xl rounded-3xl border border-white/70 bg-white p-4 shadow-2xl sm:p-6">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Đóng">
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="pt-4">{children}</div>
      </section>
    </div>
  )
}
