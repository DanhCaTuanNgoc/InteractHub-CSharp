import { usePosts } from '../features/posts/hooks/usePosts'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { Pagination } from '../shared/components/common/Pagination'
import { PostCard } from '../shared/components/posts/PostCard'
import { PostForm } from '../shared/components/posts/PostForm'

export function HomePage() {
  const {
    posts,
    totalPosts,
    totalPages,
    currentPage,
    loading,
    saving,
    error,
    createPost,
    toggleLike,
    setCurrentPage,
  } = usePosts()

  return (
    <>
      <section className="hero-section">
        <p className="hero-section__eyebrow">Phase 2 / Sprint 1</p>
        <h1 className="hero-section__title">InteractHub Frontend Architecture</h1>
        <p className="hero-section__subtitle">
          Feed hiện đã có form đăng bài, tải dữ liệu thật từ API, và phân trang sẵn cho sprint tiếp theo.
        </p>
      </section>

      <section className="cards-section cards-section--single">
        <PostForm onSubmitPost={createPost} busy={saving} />

        <article className="status-card">
          <h2>Feed ({totalPosts})</h2>
          <p>Dữ liệu bài viết lấy từ endpoint /api/posts và hỗ trợ like trực tiếp.</p>
        </article>

        {error ? <p className="form-error">{error}</p> : null}

        {loading
          ? Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} lines={4} variant="post" />)
          : posts.map((post) => <PostCard key={post.id} post={post} onLike={toggleLike} />)}

        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
      </section>
    </>
  )
}
