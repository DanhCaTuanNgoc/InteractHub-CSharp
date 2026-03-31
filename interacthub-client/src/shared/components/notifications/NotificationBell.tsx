import { useState } from 'react'
import { useNotifications } from '../../../features/notifications/hooks/useNotifications'
import { Button } from '../common/Button'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, loading, markAllRead } = useNotifications()

  return (
    <div className="notification-bell">
      <button type="button" className="notification-bell__trigger" onClick={() => setOpen((current) => !current)}>
        Notifications {unreadCount > 0 ? <span className="notification-bell__badge">{unreadCount}</span> : null}
      </button>

      {open ? (
        <section className="notification-bell__panel">
          <header>
            <h3>Thông báo</h3>
            <Button type="button" variant="ghost" onClick={() => void markAllRead()}>
              Đánh dấu đã đọc
            </Button>
          </header>

          {loading ? <p>Đang tải...</p> : null}

          <ul>
            {notifications.slice(0, 8).map((item) => (
              <li key={item.id} className={item.isRead ? '' : 'notification-bell__item--unread'}>
                <p>{item.content}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
