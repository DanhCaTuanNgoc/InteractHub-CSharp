import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { usePosts } from '../features/posts/hooks/usePosts'
import { useStoriesQuery } from '../features/stories/hooks/useStoriesQuery'
import { CommentsModal } from '../shared/components/feed/CommentsModal'
import { CreatePostModal } from '../shared/components/feed/CreatePostModal'
import { Feed } from '../shared/components/feed/Feed'
import { StoriesStrip } from '../shared/components/feed/StoriesStrip'
import type { Post } from '../shared/types/post'

export function HomePage() {
  const {
    posts,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    createPost,
    toggleLike,
    addComment,
  } = usePosts()
  const { data: stories = [], isLoading: storiesLoading } = useStoriesQuery()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const totalPosts = useMemo(() => posts.length, [posts.length])

  return (
    <section className="space-y-4">
      <header className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/75">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Daily Feed</p>
            <h1 className="font-title text-2xl text-ink-900 dark:text-white">Discover what your network is sharing</h1>
          </div>

          <button
            type="button"
            onClick={() => setShowCreatePost(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
          >
            <Sparkles size={15} />
            Tạo bài viết
          </button>
        </div>

        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{totalPosts} bài viết đang hiển thị trên bảng tin.</p>
      </header>

      <section className="rounded-3xl border border-ink-200/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/75">
        <StoriesStrip stories={stories} loading={storiesLoading} />
      </section>

      <Feed
        posts={posts}
        isLoading={isLoading}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => {
          void fetchNextPage()
        }}
        onLike={(postId) => {
          toggleLike.mutate(postId)
        }}
        onOpenComments={(item) => setSelectedPost(item)}
      />

      <CreatePostModal
        open={showCreatePost}
        busy={createPost.isPending}
        onClose={() => setShowCreatePost(false)}
        onSubmitPost={async (content, imageUrl) => {
          await createPost.mutateAsync({ content, imageUrl })
        }}
      />

      <CommentsModal
        post={selectedPost}
        open={Boolean(selectedPost)}
        busy={addComment.isPending}
        onClose={() => setSelectedPost(null)}
        onSubmitComment={async (postId, content) => {
          await addComment.mutateAsync({ postId, content })
        }}
      />
    </section>
  )
}
