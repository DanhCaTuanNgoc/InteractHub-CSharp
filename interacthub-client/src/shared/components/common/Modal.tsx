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
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={handleBackdropClick}>
      <section className="modal">
        <header className="modal__header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} className="modal__close-btn" aria-label="Đóng">
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </section>
    </div>
  )
}
