import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCheck, MessageSquare, ThumbsUp, UserPlus } from 'lucide-react'
import { useNotifications } from '../../../features/notifications/hooks/useNotifications'
import { Avatar } from '../common/Avatar'
import type { Notification } from '../../types/notification'

type NotificationDropdownProps = {
  triggerIcon?: ReactNode
}

const notificationTypeMeta: Record<string, { label: string; icon: ReactNode; toneClass: string }> = {
  Like: {
    label: 'Like',
    icon: <ThumbsUp size={12} />,
    toneClass: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  },
  Comment: {
    label: 'Comment',
    icon: <MessageSquare size={12} />,
    toneClass: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  },
  FriendRequest: {
    label: 'Friend request',
    icon: <UserPlus size={12} />,
    toneClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  },
}

function resolveNotificationMeta(type: string) {
  return (
    notificationTypeMeta[type] ?? {
      label: type,
      icon: <Bell size={12} />,
      toneClass: 'bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-200',
    }
  )
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function NotificationItem({ item, onRead }: { item: Notification; onRead: (notificationId: string) => void }) {
  const meta = resolveNotificationMeta(item.type)

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onRead(item.id)}
      className={`ui-interactive ui-ripple-static w-full rounded-2xl border p-3 text-left transition ${
        item.isRead
          ? 'border-transparent bg-ink-50/70 hover:bg-ink-100 dark:bg-ink-800/70 dark:hover:bg-ink-700'
          : 'border-brand-300/80 bg-brand-50 hover:bg-brand-100/90 dark:border-brand-500/40 dark:bg-brand-500/10 dark:hover:bg-brand-500/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar src={item.sender.avatarUrl} alt={item.sender.fullName} size="sm" />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.toneClass}`}>
              {meta.icon}
              {meta.label}
            </span>
            {!item.isRead ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" /> : null}
          </div>

          <p className="line-clamp-2 text-sm font-medium text-ink-800 dark:text-ink-100">{item.content}</p>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{formatTimestamp(item.createdAt)}</p>
        </div>
      </div>
    </motion.button>
  )
}

export function NotificationDropdown({ triggerIcon }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { notifications, unreadCount, loading, markingAllRead, error, markRead, markAllRead } = useNotifications()

  const items = useMemo(() => notifications.slice(0, 10), [notifications])
  const badge = unreadCount > 99 ? '99+' : unreadCount

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open notifications"
        className="ui-interactive ui-ripple-static relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-ink-200/70 bg-white/70 text-ink-700 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-ink-700 dark:bg-ink-900/80 dark:text-ink-100"
      >
        {triggerIcon ?? <Bell size={16} />}
      </button>

      <AnimatePresence initial={false}>
        {unreadCount > 0 ? (
          <motion.span
            key={badge}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [1, 1.18, 1], opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="pointer-events-none absolute -right-1.5 -top-1.5 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold leading-none tabular-nums text-white"
          >
            {badge}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.section
            initial={{ opacity: 0, y: 8, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 6, x: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-40 mt-2 w-[min(92vw,400px)] rounded-3xl border border-ink-200/80 bg-white/95 p-3 shadow-soft-xl backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/92"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-title text-lg text-ink-900 dark:text-white">Thông báo</h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">{unreadCount} chưa đọc</p>
              </div>

              <button
                type="button"
                disabled={unreadCount === 0 || markingAllRead}
                onClick={() => void markAllRead()}
                className="ui-interactive ui-ripple-static inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:bg-ink-800"
              >
                <CheckCheck size={13} />
                Đánh dấu đã đọc
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
                ))}
              </div>
            ) : null}

            {error ? (
              <p className="rounded-xl bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{error}</p>
            ) : null}

            {!loading && !error ? (
              <motion.div layout className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="rounded-2xl bg-ink-50 p-3 text-sm text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                    Bạn không có thông báo nào!
                  </p>
                ) : null}

                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <NotificationItem key={item.id} item={item} onRead={(notificationId) => void markRead(notificationId)} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
