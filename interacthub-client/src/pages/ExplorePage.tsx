import { useEffect, useState } from 'react'
import { Search, Sparkles, UsersRound } from 'lucide-react'
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
    <section className="explore-page mt-2 sm:mt-4">
      <header className="status-card explore-hero">
        <div className="explore-hero__intro">
          <p className="explore-hero__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Khám phá cộng đồng
          </p>
          <p className="explore-hero__subtitle">Kết nối nhanh với bạn mới theo tên, username hoặc email.</p>
        </div>

        <div className="explore-hero__stats" aria-hidden="true">
          <article>
            <strong>{friends.length}</strong>
            <span>Bạn bè</span>
          </article>
          <article>
            <strong>{users.length}</strong>
            <span>Kết quả hiện tại</span>
          </article>
        </div>

        <div className="explore-search explore-search--hero">
          <div className="field-hint">
            <Search size={14} aria-hidden="true" />
            <span>Tìm theo username, họ tên hoặc email để mở rộng mạng lưới</span>
          </div>
          <TextInput
            label="Search user"
            placeholder="Nhập username, họ tên hoặc email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      <div className="explore-layout">
        <article className="status-card explore-feed">
          <div className="explore-feed__header">
            <h2>Kết quả gợi ý</h2>
            <p>{debouncedQuery.trim() ? `Từ khóa: "${debouncedQuery}"` : 'Nhập từ khóa để bắt đầu tìm kiếm.'}</p>
          </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <div className="explore-result">
            <LoadingSkeleton variant="user" lines={3} />
            <LoadingSkeleton variant="user" lines={3} />
          </div>
        ) : (
          <div className="explore-result">
            {!debouncedQuery.trim() ? (
              <p className="explore-empty">Bắt đầu bằng một từ khóa để hiển thị những hồ sơ phù hợp.</p>
            ) : users.length === 0 ? (
              <p className="explore-empty">Chưa tìm thấy người dùng phù hợp. Hãy thử từ khóa khác.</p>
            ) : (
              users.map((user) => (
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
              ))
            )}
          </div>
        )}

        {!loading && debouncedQuery.trim() ? (
          <div className="explore-feed__pagination">
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          </div>
        ) : null}
        </article>

        <aside className="status-card explore-sidebar">
          <div className="explore-feed__header">
            <h2>Bạn bè hiện tại</h2>
            <p>Danh sách kết nối của bạn.</p>
          </div>

          {friends.length > 0 ? (
            <div className="explore-result">
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
          ) : (
            <p className="explore-empty">Bạn chưa có bạn bè nào. Hãy gửi lời mời từ danh sách Explore.</p>
          )}

          <div className="explore-sidebar__tip">
            <h3>Mẹo kết nối</h3>
            <p>Ưu tiên kết bạn với người có cùng sở thích để feed của bạn đa dạng và liên quan hơn.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
