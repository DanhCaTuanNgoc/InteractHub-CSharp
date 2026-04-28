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
      window.dispatchEvent(new Event('notifications:refresh'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xử lý lời mời kết bạn.')
    } finally {
      setBusyNotificationId(null)
    }
  }

  return (
    <section className="mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-xl backdrop-blur-xl sm:p-5 lg:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
              <UserRoundPlus size={14} aria-hidden="true" />
              Kết nối
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Lời mời kết bạn</h1>
            <p className="mt-1 text-sm text-slate-600">Danh sách lời mời kết bạn đang chờ xử lý.</p>
          </div>

          <div>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{pendingRequests.length} đang chờ</span>
          </div>
        </header>

        {error ? <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

        {loading ? (
          <div className="mt-4 grid gap-3">
            <LoadingSkeleton variant="user" lines={3} />
            <LoadingSkeleton variant="user" lines={3} />
          </div>
        ) : null}

        {!loading && pendingRequests.length === 0 ? (
          <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <h3 className="text-base font-semibold text-slate-900">Không có lời mời mới</h3>
            <p className="mt-1 text-sm text-slate-500">Khi có ai đó gửi lời mời kết bạn, bạn sẽ thấy ở đây.</p>
          </article>
        ) : null}

        <div className="mt-4 grid gap-3">
          {pendingRequests.map((request) => (
            <article key={request.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    to={ROUTES.profile(request.sender.id)}
                    className="flex items-center gap-3 text-slate-900 transition hover:text-cyan-700"
                    aria-label={`Xem hồ sơ của ${request.sender.fullName}`}
                  >
                    <Avatar src={request.sender.avatarUrl} alt={request.sender.fullName} />
                    <div>
                      <h3 className="font-semibold">{request.sender.fullName}</h3>
                      <p className="text-sm text-slate-500">@{request.sender.userName}</p>
                    </div>
                  </Link>
                </div>

                <small className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 size={13} aria-hidden="true" />
                  {new Date(request.createdAt).toLocaleString()}
                </small>
              </div>

              <p className="text-sm text-slate-600">{request.content}</p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  busy={busyNotificationId === request.id}
                  onClick={() => void handleDecision(request, 'accept')}
                >
                  <Check size={15} aria-hidden="true" />
                  Đồng ý
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  busy={busyNotificationId === request.id}
                  onClick={() => void handleDecision(request, 'decline')}
                >
                  <X size={15} aria-hidden="true" />
                  Từ chối
                </Button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
