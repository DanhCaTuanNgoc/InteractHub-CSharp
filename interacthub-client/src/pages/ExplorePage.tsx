import { useEffect, useState } from 'react'
import { Search, UsersRound } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { Button } from '../shared/components/common/Button'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { Pagination } from '../shared/components/common/Pagination'
import { TextInput } from '../shared/components/common/TextInput'
import { UserCard } from '../shared/components/common/UserCard'
import { useDebounce } from '../shared/hooks/useDebounce'
import { friendService } from '../shared/services/friendService'
import { userService } from '../shared/services/userService'
import type { UserSummary } from '../shared/types/user'

const PAGE_SIZE = 8

export function ExplorePage() {
  const { user: currentUser } = useAuth()
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [users, setUsers] = useState<UserSummary[]>([])
  const [friends, setFriends] = useState<UserSummary[]>([])
  const [friendActionBusyId, setFriendActionBusyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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
    const loadFriends = async () => {
      try {
        const items = await friendService.getFriends()
        setFriends(items)
      } catch {
        setFriends([])
      }
    }

    void loadFriends()
  }, [])

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

  return (
    <section className="cards-section cards-section--single mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="status-card p-4 sm:p-5 lg:p-6">
        <h1 className="title-with-icon">
          <UsersRound size={20} aria-hidden="true" />
          <span>Khám phá cộng đồng</span>
        </h1>
        <div className="explore-search">
          <div className="field-hint">
            <Search size={14} aria-hidden="true" />
            <span>Tìm theo username, họ tên hoặc email</span>
          </div>
          <TextInput
            label=""
            placeholder="Nhập username, họ tên hoặc email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="explore-result">
            <LoadingSkeleton variant="user" lines={3} />
            <LoadingSkeleton variant="user" lines={3} />
          </div>
        ) : (
          <div className="explore-result">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                action={
                  user.id !== currentUser?.id ? (
                    isFriend(user.id) ? (
                      <Button
                        type="button"
                        variant="danger"
                        busy={friendActionBusyId === user.id}
                        onClick={() => void removeFriend(user.id)}
                      >
                        Hủy kết bạn
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        busy={friendActionBusyId === user.id}
                        onClick={() => void sendRequest(user.id)}
                      >
                        Kết bạn
                      </Button>
                    )
                  ) : null
                }
              />
            ))}
          </div>
        )}

        {friends.length > 0 ? (
          <section className="explore-friends mt-4">
            <div className="explore-friends__header">
              <h2>Bạn bè hiện tại</h2>
              <span>{friends.length} người bạn</span>
            </div>

            <p className="explore-friends__hint">Danh sách kết nối của bạn, ưu tiên những người tương tác gần đây.</p>

            <div className="explore-friends__list">
              {friends.map((friend) => (
                <UserCard
                  key={friend.id}
                  user={friend}
                  action={
                    <Button
                      type="button"
                      variant="danger"
                      busy={friendActionBusyId === friend.id}
                      onClick={() => void removeFriend(friend.id)}
                    >
                      Hủy kết bạn
                    </Button>
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        {!loading ? <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} /> : null}
      </article>
    </section>
  )
}
