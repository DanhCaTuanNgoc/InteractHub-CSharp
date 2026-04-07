import { useEffect, useMemo, useState } from 'react'
import { Check, Clock3, UserRoundPlus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../shared/components/common/Button'
import { Avatar } from '../shared/components/common/Avatar'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { ROUTES } from '../shared/constants/routes'
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
      <article className="status-card friend-requests p-4 sm:p-5 lg:p-6">
        <header className="friend-requests__hero">
          <div>
            <p className="friend-requests__eyebrow">
              <UserRoundPlus size={14} aria-hidden="true" />
              Kết nối
            </p>
            <p>Danh sách lời mời kết bạn đang chờ xử lý.</p>
          </div>

          <div className="friend-requests__hero-actions">
            <span className="friend-requests__count">{pendingRequests.length} đang chờ</span>
          </div>
        </header>

        {error ? <p className="form-error mt-3">{error}</p> : null}

        {loading ? (
          <div className="friend-requests__list mt-4">
            <LoadingSkeleton variant="user" lines={3} />
            <LoadingSkeleton variant="user" lines={3} />
          </div>
        ) : null}

        {!loading && pendingRequests.length === 0 ? (
          <article className="friend-requests__empty mt-4">
            <h3>Không có lời mời mới</h3>
            <p>Khi có ai đó gửi lời mời kết bạn, bạn sẽ thấy ở đây.</p>
          </article>
        ) : null}

        <div className="friend-requests__list mt-4">
          {pendingRequests.map((request) => (
            <article key={request.id} className="friend-request-card">
              <div className="friend-request-card__header">
                <div className="friend-request-card__author">
                  <Link
                    to={ROUTES.profile(request.sender.id)}
                    className="friend-request-card__author-link"
                    aria-label={`Xem hồ sơ của ${request.sender.fullName}`}
                  >
                    <Avatar src={request.sender.avatarUrl} alt={request.sender.fullName} />
                    <div>
                      <h3>{request.sender.fullName}</h3>
                      <p>@{request.sender.userName}</p>
                    </div>
                  </Link>
                </div>

                <small className="friend-request-card__time">
                  <Clock3 size={13} aria-hidden="true" />
                  {new Date(request.createdAt).toLocaleString()}
                </small>
              </div>

              <p className="friend-request-card__content">{request.content}</p>

              <div className="post-card__inline-actions friend-request-card__actions">
                <Button
                  type="button"
                  variant="primary"
                  busy={busyNotificationId === request.id}
                  onClick={() => void handleDecision(request, 'accept')}
                >
                  <Check size={15} aria-hidden="true" />
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  busy={busyNotificationId === request.id}
                  onClick={() => void handleDecision(request, 'decline')}
                >
                  <X size={15} aria-hidden="true" />
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
