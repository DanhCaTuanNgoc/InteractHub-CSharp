import { useEffect, type MouseEvent, type PropsWithChildren } from 'react'

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
          <button type="button" onClick={onClose} className="button button--ghost">
            Close
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </section>
    </div>
  )
}
