import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, Search, Sparkles, UsersRound, X } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { ROUTES } from '../shared/constants/routes'
import { Avatar } from '../shared/components/common/Avatar'
import { Button } from '../shared/components/common/Button'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { Pagination } from '../shared/components/common/Pagination'
import { TextInput } from '../shared/components/common/TextInput'
import { useDebounce } from '../shared/hooks/useDebounce'
import { friendService } from '../shared/services/friendService'
import { notificationService } from '../shared/services/notificationService'
import { userService } from '../shared/services/userService'
import type { Notification } from '../shared/types/notification'
import type { UserSummary } from '../shared/types/user'

const PAGE_SIZE = 8

export function ExplorePage() {
  const { user: currentUser } = useAuth()
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [friends, setFriends] = useState<UserSummary[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [friendActionBusyId, setFriendActionBusyId] = useState<string | null>(null)
  const [requestBusyId, setRequestBusyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([])
      setCurrentPage(1)
      setTotalPages(1)
      setError(null)
      return
    }

    const search = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await userService.search(debouncedQuery, currentPage, PAGE_SIZE)
        setUsers(data.items)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tìm kiếm người dùng.')
      } finally {
        setLoading(false)
      }
    }

    void search()
  }, [currentPage, debouncedQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedQuery])

  useEffect(() => {
    const loadRelations = async () => {
      setLoadingRequests(true)
      try {
        const [friendItems, notificationItems] = await Promise.all([friendService.getFriends(), notificationService.getAll()])
        setFriends(friendItems)
        setNotifications(notificationItems)
      } catch {
        setFriends([])
        setNotifications([])
      } finally {
        setLoadingRequests(false)
      }
    }

    void loadRelations()
  }, [])

  const pendingRequests = notifications.filter((item) => item.type === 'FriendRequest' && !item.isRead)

  const isFriend = (userId: string) => friends.some((friend) => friend.id === userId)

  const sendRequest = async (userId: string) => {
    setFriendActionBusyId(userId)
    setError(null)
    try {
      await friendService.sendRequest(userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi lời mời kết bạn.')
    } finally {
      setFriendActionBusyId(null)
    }
  }

  const removeFriend = async (userId: string) => {
    setFriendActionBusyId(userId)
    setError(null)
    try {
      await friendService.remove(userId)
      setFriends((current) => current.filter((friend) => friend.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hủy kết bạn.')
    } finally {
      setFriendActionBusyId(null)
    }
  }

  const handleRequestDecision = async (request: Notification, action: 'accept' | 'decline') => {
    setRequestBusyId(request.id)
    setError(null)

    try {
      if (action === 'accept') {
        await friendService.accept(request.sender.id)
        setFriends((current) => {
          if (current.some((friend) => friend.id === request.sender.id)) {
            return current
          }

          return [request.sender, ...current]
        })
      } else {
        await friendService.decline(request.sender.id)
      }

      await notificationService.markRead(request.id)
      setNotifications((current) => current.map((item) => (item.id === request.id ? { ...item, isRead: true } : item)))
      window.dispatchEvent(new Event('notifications:refresh'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xử lý lời mời kết bạn.')
    } finally {
      setRequestBusyId(null)
    }
  }

  return (
    <section className="relative space-y-5 px-1 py-2 sm:py-4">
      <motion.article
        className="relative overflow-hidden rounded-2xl border border-white/65 bg-white/75 p-5 shadow-sm backdrop-blur-xl sm:p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      >
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                <UsersRound size={20} aria-hidden="true" />
                <span>Khám phá cộng đồng</span>
              </h1>
              <p className="mt-1 text-sm text-slate-600">Tìm bạn bè mới theo username, tên hiển thị hoặc email.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              <Sparkles size={14} />
              Explore
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Search size={13} aria-hidden="true" />
              <span>Tìm theo username, họ tên hoặc email</span>
            </div>
            <TextInput
              label=""
              className="rounded-2xl border-slate-200 bg-white/95 shadow-sm"
              placeholder="Nhập username, họ tên hoặc email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          {loadingRequests ? <p className="text-sm text-slate-500">Đang tải lời mời kết bạn...</p> : null}

          {pendingRequests.length > 0 ? (
            <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Lời mời kết bạn</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{pendingRequests.length} đang chờ</span>
              </div>
              <p className="mb-3 text-xs text-slate-500">Bạn có thể chấp nhận hoặc từ chối ngay tại đây.</p>

              <div className="grid grid-cols-1 gap-3">
                {pendingRequests.map((request, index) => (
                  <motion.article
                    key={request.id}
                    className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.02 }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Link to={ROUTES.profile(request.sender.id)} className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar src={request.sender.avatarUrl} alt={request.sender.fullName} size="md" />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{request.sender.fullName}</h3>
                          <p className="truncate text-xs text-slate-500">@{request.sender.userName}</p>
                        </div>
                      </Link>

                      <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                        <Button
                          type="button"
                          variant="primary"
                          busy={requestBusyId === request.id}
                          onClick={() => void handleRequestDecision(request, 'accept')}
                          className="justify-center rounded-xl px-3 py-2 text-sm"
                        >
                          <Check size={14} />
                          Accept
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          busy={requestBusyId === request.id}
                          onClick={() => void handleRequestDecision(request, 'decline')}
                          className="justify-center rounded-xl px-3 py-2 text-sm"
                        >
                          <X size={14} />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          ) : null}

          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              <LoadingSkeleton variant="user" lines={3} />
              <LoadingSkeleton variant="user" lines={3} />
            </div>
          ) : null}

          {!loading && debouncedQuery.trim() && users.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-sm text-slate-500">Không tìm thấy người dùng phù hợp với từ khóa hiện tại.</p>
            </div>
          ) : null}

          {!loading && users.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {users.map((user, index) => (
                <motion.article
                  key={user.id}
                  className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm transition-shadow hover:shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: index * 0.03 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link to={ROUTES.profile(user.id)} className="flex min-w-0 items-center gap-3">
                      <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{user.fullName}</h3>
                        <p className="truncate text-xs text-slate-500">@{user.userName}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                    </Link>

                    {user.id !== currentUser?.id ? (
                      isFriend(user.id) ? (
                        <Button
                          type="button"
                          variant="danger"
                          busy={friendActionBusyId === user.id}
                          onClick={() => void removeFriend(user.id)}
                          className="rounded-2xl"
                        >
                          Hủy kết bạn
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          busy={friendActionBusyId === user.id}
                          onClick={() => void sendRequest(user.id)}
                          className="rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                        >
                          Kết bạn
                        </Button>
                      )
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          ) : null}

          {friends.length > 0 ? (
            <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Bạn bè hiện tại</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{friends.length} người bạn</span>
              </div>

              <p className="mb-3 text-xs text-slate-500">Danh sách kết nối của bạn, ưu tiên những người tương tác gần đây.</p>

              <div className="grid grid-cols-1 gap-3">
                {friends.map((friend, index) => (
                  <motion.article
                    key={friend.id}
                    className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm transition-shadow hover:shadow-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                  >
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                      <Link to={ROUTES.profile(friend.id)} className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar src={friend.avatarUrl} alt={friend.fullName} size="md" />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{friend.fullName}</h3>
                          <p className="truncate text-xs text-slate-500">@{friend.userName}</p>
                        </div>
                      </Link>
                      <Button
                        type="button"
                        variant="danger"
                        busy={friendActionBusyId === friend.id}
                        onClick={() => void removeFriend(friend.id)}
                        className="w-full shrink-0 rounded-xl px-3 py-2 text-sm sm:w-auto"
                      >
                        Hủy kết bạn
                      </Button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          ) : null}

          {!loading ? (
            <div className="pt-1">
              <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
            </div>
          ) : null}
        </div>
      </motion.article>

      {!debouncedQuery.trim() ? (
        <motion.article
          className="rounded-2xl border border-white/65 bg-white/70 p-5 shadow-sm backdrop-blur-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <h2 className="text-base font-semibold text-slate-900">Mẹo khám phá</h2>
          <p className="mt-1 text-sm text-slate-500">Nhập từ khóa để tìm người dùng, sau đó gửi lời mời hoặc quản lý bạn bè trực tiếp.</p>
        </motion.article>
      ) : null}
    </section>
  )
}
