import { CheckCircle2, CircleAlert, Info } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

type NoticeType = 'success' | 'error' | 'info'

type NoticeModalProps = {
  open: boolean
  title: string
  message: string
  type?: NoticeType
  onClose: () => void
}

const noticeIconMap = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} satisfies Record<NoticeType, typeof CheckCircle2>

export function NoticeModal({ open, title, message, type = 'info', onClose }: NoticeModalProps) {
  const Icon = noticeIconMap[type]

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className={`notice-modal notice-modal--${type}`}>
        <div className="notice-modal__content">
          <Icon size={20} aria-hidden="true" />
          <p>{message}</p>
        </div>

        <div className="notice-modal__actions">
          <Button type="button" variant={type === 'error' ? 'danger' : 'primary'} onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </div>
    </Modal>
  )
}
