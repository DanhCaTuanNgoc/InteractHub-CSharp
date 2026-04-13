import { useEffect, useRef } from 'react'
import { PostCard } from './PostCard'
import { FeedSkeleton } from './FeedSkeleton'
import type { Post } from '../../types/post'

type FeedProps = {
  posts: Post[]
  isLoading: boolean
  error: unknown
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onLike: (postId: string) => void
  onShare: (postId: string) => void
  onOpenComments: (post: Post) => void
}

export function Feed({
  posts,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onLike,
  onShare,
  onOpenComments,
}: FeedProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) {
      return
    }

    const node = sentinelRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      {
        rootMargin: '220px 0px',
        threshold: 0.12,
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  if (isLoading) {
    return <FeedSkeleton />
  }

  if (error) {
    return (
      <article className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/25 dark:text-red-300">
        {error instanceof Error ? error.message : 'Không thể tải bảng tin.'}
      </article>
    )
  }

  if (posts.length === 0) {
    return (
      <article className="rounded-xl border border-ink-200/80 bg-white/85 p-8 text-center text-sm text-ink-600 shadow-sm dark:border-ink-700 dark:bg-ink-900/80 dark:text-ink-300">
        Bảng tin chưa có dữ liệu. Hãy tạo bài viết đầu tiên.
      </article>
    )
  }

  return (
    <section className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={onLike} onShare={onShare} onOpenComments={onOpenComments} />
      ))}

      <div ref={sentinelRef} className="h-8" />

      {isFetchingNextPage ? <FeedSkeleton /> : null}
    </section>
  )
}
