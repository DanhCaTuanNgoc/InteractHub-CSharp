import { useEffect, useState } from 'react'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { TextInput } from '../shared/components/common/TextInput'
import { UserCard } from '../shared/components/common/UserCard'
import { useDebounce } from '../shared/hooks/useDebounce'
import { userService } from '../shared/services/userService'
import type { UserSummary } from '../shared/types/user'

export function ExplorePage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([])
      setError(null)
      return
    }

    const search = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await userService.search(debouncedQuery)
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tìm kiếm người dùng.')
      } finally {
        setLoading(false)
      }
    }

    void search()
  }, [debouncedQuery])

  return (
    <section className="cards-section cards-section--single">
      <article className="status-card">
        <h1>Explore</h1>
        <p>Tìm người dùng bằng debounce 300ms trước khi gọi API.</p>

        <div className="explore-search">
          <TextInput
            label="Search user"
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
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </article>
    </section>
  )
}
