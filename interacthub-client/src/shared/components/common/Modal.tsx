import type { PropsWithChildren } from 'react'

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
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
