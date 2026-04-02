import { Newspaper, Rocket } from 'lucide-react'
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
      <section className="hero-section px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <p className="hero-section__eyebrow">
          <Rocket size={14} aria-hidden="true" />
          <span>Phase 2 / Sprint 1</span>
        </p>
        <h1 className="hero-section__title">InteractHub Frontend Architecture</h1>
        <p className="hero-section__subtitle max-w-2xl text-sm sm:text-base lg:text-lg">
          Feed hiện đã có form đăng bài, tải dữ liệu thật từ API, và phân trang sẵn cho sprint tiếp theo.
        </p>
      </section>

      <section className="cards-section cards-section--single mt-4 grid grid-cols-1 gap-4 sm:mt-5 lg:mt-6">
        <PostForm onSubmitPost={createPost} busy={saving} />

        <article className="status-card">
          <h2>
            <Newspaper size={18} aria-hidden="true" />
            <span>Feed ({totalPosts})</span>
          </h2>
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
