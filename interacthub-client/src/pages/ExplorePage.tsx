import { useEffect, useState } from 'react'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { Pagination } from '../shared/components/common/Pagination'
import { TextInput } from '../shared/components/common/TextInput'
import { UserCard } from '../shared/components/common/UserCard'
import { useDebounce } from '../shared/hooks/useDebounce'
import { userService } from '../shared/services/userService'
import type { UserSummary } from '../shared/types/user'

const PAGE_SIZE = 8

export function ExplorePage() {
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [users, setUsers] = useState<UserSummary[]>([])
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

        {!loading ? <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} /> : null}
      </article>
    </section>
  )
}
