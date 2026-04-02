import { useEffect, useMemo, useState } from 'react'
import { Button } from '../shared/components/common/Button'
import { friendService } from '../shared/services/friendService'
import { notificationService } from '../shared/services/notificationService'
import type { Notification } from '../shared/types/notification'

export function FriendRequestsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyNotificationId, setBusyNotificationId] = useState<string | null>(null)

  const loadPendingRequests = async () => {
    setLoading(true)
    setError(null)

    try {
      const items = await notificationService.getAll()
      setNotifications(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lời mời kết bạn.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPendingRequests()
  }, [])

  const pendingRequests = useMemo(
    () => notifications.filter((item) => item.type === 'FriendRequest' && !item.isRead),
    [notifications],
  )

  const handleDecision = async (notification: Notification, action: 'accept' | 'decline') => {
    setBusyNotificationId(notification.id)
    setError(null)

    try {
      if (action === 'accept') {
        await friendService.accept(notification.sender.id)
      } else {
        await friendService.decline(notification.sender.id)
      }

      await notificationService.markRead(notification.id)
      setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xử lý lời mời kết bạn.')
    } finally {
      setBusyNotificationId(null)
    }
  }

  return (
    <section className="cards-section cards-section--single mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="status-card p-4 sm:p-5 lg:p-6">
        <h1>Friend Requests</h1>
        <p>Danh sách lời mời kết bạn đang chờ xử lý.</p>

        <div className="mt-3">
          <Button type="button" variant="ghost" onClick={() => void loadPendingRequests()} busy={loading}>
            Tải lại
          </Button>
        </div>

        {error ? <p className="form-error mt-3">{error}</p> : null}

        {loading ? <p className="mt-3">Đang tải lời mời...</p> : null}

        {!loading && pendingRequests.length === 0 ? <p className="mt-3">Không có lời mời kết bạn đang chờ.</p> : null}

        <div className="explore-result mt-4">
          {pendingRequests.map((request) => (
            <article key={request.id} className="user-card">
              <h3>{request.sender.fullName}</h3>
              <p>@{request.sender.userName}</p>
              <p>{request.content}</p>
              <small>{new Date(request.createdAt).toLocaleString()}</small>

              <div className="post-card__inline-actions mt-3">
                <Button
                  type="button"
                  variant="primary"
                  busy={busyNotificationId === request.id}
                  onClick={() => void handleDecision(request, 'accept')}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  busy={busyNotificationId === request.id}
                  onClick={() => void handleDecision(request, 'decline')}
                >
                  Decline
                </Button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
