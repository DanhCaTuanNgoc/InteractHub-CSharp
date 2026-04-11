import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../../features/notifications/hooks/useNotifications'

type NotificationBellProps = {
  triggerIcon?: ReactNode
}

export function NotificationBell({ triggerIcon }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { notifications, unreadCount, loading, markingAllRead, error, markRead, markAllRead } = useNotifications()

  const items = useMemo(() => notifications.slice(0, 8), [notifications])
  const badge = unreadCount > 99 ? '99+' : unreadCount

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-ink-200/70 bg-white/70 text-ink-700 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-ink-700 dark:bg-ink-900/80 dark:text-ink-100"
      >
        {triggerIcon ?? <Bell size={16} />}
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.section
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-40 mt-2 w-[min(90vw,390px)] rounded-3xl border border-ink-200/80 bg-white/92 p-3 shadow-soft-xl backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/92"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-title text-lg text-ink-900 dark:text-white">Notifications</h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">{unreadCount} chưa đọc</p>
              </div>
              <button
                type="button"
                disabled={unreadCount === 0 || markingAllRead}
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300 dark:hover:bg-ink-800"
              >
                <CheckCheck size={13} />
                Đọc hết
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
                ))}
              </div>
            ) : null}

            {error ? <p className="rounded-xl bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}

            {!loading && !error ? (
              <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="rounded-2xl bg-ink-50 p-3 text-sm text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                    Không có thông báo mới.
                  </p>
                ) : null}

                {items.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => void markRead(item.id)}
                    className={`w-full rounded-2xl p-3 text-left transition ${
                      item.isRead
                        ? 'bg-ink-50 text-ink-600 hover:bg-ink-100 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700'
                        : 'bg-brand-50 text-ink-800 hover:bg-brand-100 dark:bg-ink-700 dark:text-ink-100'
                    }`}
                  >
                    <p className="text-sm font-medium">{item.content}</p>
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
