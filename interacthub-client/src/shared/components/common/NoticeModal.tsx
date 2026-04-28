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
  const palette = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    info: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  }[type]

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-5">
        <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${palette}`}>
          <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant={type === 'error' ? 'danger' : 'primary'} onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </div>
    </Modal>
  )
}
