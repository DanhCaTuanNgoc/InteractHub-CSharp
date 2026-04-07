import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { usePosts } from '../features/posts/hooks/usePosts'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { Pagination } from '../shared/components/common/Pagination'
import { PostCard } from '../shared/components/posts/PostCard'
import { PostForm } from '../shared/components/posts/PostForm'
import { hashtagService } from '../shared/services/hashtagService'
import type { Hashtag } from '../shared/types/hashtag'

export function HomePage() {
  const { user } = useAuth()
  const {
    posts,
    totalPages,
    currentPage,
    loading,
    saving,
    createPost,
    toggleLike,
    addComment,
    sharePost,
    reportPost,
    deletePost,
    updatePost,
    setCurrentPage,
  } = usePosts()
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([])

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const items = await hashtagService.getTrending(8)
        setTrendingHashtags(items)
      } catch {
        setTrendingHashtags([])
      }
    }

    void loadTrending()
  }, [])

  return (
    <>
    
      <section className="cards-section cards-section--single mt-4 grid grid-cols-1 gap-4 sm:mt-5 lg:mt-6">
        <PostForm onSubmitPost={createPost} busy={saving} />

        <article className="status-card">
          {trendingHashtags.length > 0 ? (
            <div className="mt-3">
              <strong>Trending hashtags:</strong>
              <ul>
                {trendingHashtags.map((hashtag) => (
                  <li key={hashtag.id}>
                    {hashtag.name} ({hashtag.usageCount})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>


        {loading
          ? Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} lines={4} variant="post" />)
          : posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={toggleLike}
                onComment={addComment}
                onShare={sharePost}
                onReport={reportPost}
                onDelete={deletePost}
                onUpdate={updatePost}
              />
            ))}

        <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
      </section>
    </>
  )
}
