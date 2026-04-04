import { useState } from 'react'
import { Bell, CheckCheck, RotateCcw } from 'lucide-react'
import { useNotifications } from '../../../features/notifications/hooks/useNotifications'
import { Button } from '../common/Button'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, loading, markingAllRead, error, reload, markRead, markAllRead } = useNotifications()

  return (
    <div className="notification-bell">
      <button type="button" className="notification-bell__trigger" onClick={() => setOpen((current) => !current)}>
        <Bell size={15} aria-hidden="true" />
        <span>Thông báo</span>
        {unreadCount > 0 ? <span className="notification-bell__badge">{unreadCount}</span> : null}
      </button>

      {open ? (
        <section className="notification-bell__panel">
          <header>
            <h3>Thông báo</h3>
            <Button type="button" variant="ghost" busy={markingAllRead} onClick={() => void markAllRead()}>
              <CheckCheck size={14} aria-hidden="true" />
              Đánh dấu đã đọc
            </Button>
          </header>

          {loading ? <p>Đang tải...</p> : null}
          {error ? (
            <div>
              <p className="form-error">{error}</p>
              <Button type="button" variant="ghost" onClick={() => void reload()}>
                <RotateCcw size={14} aria-hidden="true" />
                Thử lại
              </Button>
            </div>
          ) : null}

          <ul>
            {notifications.slice(0, 8).map((item) => (
              <li key={item.id} className={item.isRead ? '' : 'notification-bell__item--unread'}>
                <p>{item.content}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
                {!item.isRead ? (
                  <Button type="button" variant="ghost" onClick={() => void markRead(item.id)}>
                    Đánh dấu đã đọc
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
