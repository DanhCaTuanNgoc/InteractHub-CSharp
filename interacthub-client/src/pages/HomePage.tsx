import { useState } from 'react'
import { ImagePlus, MessageCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { usePosts } from '../features/posts/hooks/usePosts'
import { useStoriesQuery } from '../features/stories/hooks/useStoriesQuery'
import { Avatar } from '../shared/components/common/Avatar'
import { CommentsModal } from '../shared/components/feed/CommentsModal'
import { CreatePostModal } from '../shared/components/feed/CreatePostModal'
import { Feed } from '../shared/components/feed/Feed'
import { StoriesStrip } from '../shared/components/feed/StoriesStrip'
import type { Post } from '../shared/types/post'

export function HomePage() {
  const { user } = useAuth()
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
    sharePost,
    reportPost,
  } = usePosts()
  const { data: stories = [], isLoading: storiesLoading } = useStoriesQuery()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  return (
    <section className="space-y-4">
      <header className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-xl backdrop-blur-xl">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl ?? null} alt={user?.fullName ?? user?.username ?? 'User'} />

            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm text-slate-500 transition hover:border-cyan-300 hover:bg-white hover:text-slate-800"
            >
              {user?.fullName ? `${user.fullName}, bạn đang nghĩ gì hôm nay?` : 'Bạn đang nghĩ gì hôm nay?'}
            </button>

            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              <Sparkles size={15} />
              Đăng bài
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
            >
              <ImagePlus size={14} className="text-cyan-600" />
              Ảnh / Video
            </button>

            <button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
            >
              <MessageCircle size={14} className="text-cyan-600" />
              Chia sẻ cảm nghĩ
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-xl backdrop-blur-xl">
        <StoriesStrip stories={stories} loading={storiesLoading} />
      </section>

      <Feed
        posts={posts}
        currentUserId={user?.id}
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
        onShare={(postId) => {
          sharePost.mutate(postId)
        }}
        onReport={async (postId, reason) => {
          await reportPost.mutateAsync({ postId, reason })
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
