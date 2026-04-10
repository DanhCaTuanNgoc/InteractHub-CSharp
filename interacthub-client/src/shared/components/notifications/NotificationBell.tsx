import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, CheckCheck, RotateCcw } from 'lucide-react'
import { useNotifications } from '../../../features/notifications/hooks/useNotifications'
import { Button } from '../common/Button'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { notifications, unreadCount, loading, markingAllRead, error, reload, markRead, markAllRead } = useNotifications()

  const previewNotifications = useMemo(() => notifications.slice(0, 8), [notifications])
  const unreadLabel = unreadCount > 99 ? '99+' : unreadCount

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const renderTypeLabel = (type: string) => {
    switch (type) {
      case 'FriendRequest':
        return 'Lời mời kết bạn'
      case 'PostLiked':
        return 'Bài viết được thích'
      case 'PostCommented':
        return 'Có bình luận mới'
      default:
        return 'Thông báo hệ thống'
    }
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="notification-bell__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="notification-panel"
      >
        <Bell size={15} aria-hidden="true" />
        <span>Thông báo</span>
        {unreadCount > 0 ? <span className="notification-bell__badge">{unreadLabel}</span> : null}
      </button>

      {open ? (
        <section className="notification-bell__panel" id="notification-panel" role="dialog" aria-label="Danh sách thông báo">
          <header>
            <div className="notification-bell__title-wrap">
              <h3>Thông báo</h3>
              <small>{unreadCount} chưa đọc</small>
            </div>

            <Button type="button" variant="ghost" busy={markingAllRead} onClick={() => void markAllRead()} disabled={unreadCount === 0}>
              <CheckCheck size={14} aria-hidden="true" />
              Đọc tất cả
            </Button>
          </header>

          {loading ? <p>Đang tải...</p> : null}
          {error ? (
            <div className="notification-bell__error-state">
              <p className="form-error">{error}</p>
              <Button type="button" variant="ghost" onClick={() => void reload()}>
                <RotateCcw size={14} aria-hidden="true" />
                Thử lại
              </Button>
            </div>
          ) : null}

          {!loading && !error && previewNotifications.length === 0 ? (
            <div className="notification-bell__empty-state">
              <p>Chưa có thông báo mới.</p>
              <small>Thông báo về lời mời kết bạn, lượt thích và bình luận sẽ hiển thị tại đây.</small>
            </div>
          ) : null}

          <ul>
            {previewNotifications.map((item) => (
              <li key={item.id} className={item.isRead ? '' : 'notification-bell__item--unread'}>
                <div className="notification-bell__item-top">
                  <span className="notification-bell__type-pill">{renderTypeLabel(item.type)}</span>
                  {!item.isRead ? <span className="notification-bell__item-dot" aria-label="Chưa đọc" /> : null}
                </div>

                <p>{item.content}</p>

                <div className="notification-bell__item-footer">
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                  {!item.isRead ? (
                    <button type="button" className="notification-bell__read-btn" onClick={() => void markRead(item.id)}>
                      Đánh dấu đã đọc
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
