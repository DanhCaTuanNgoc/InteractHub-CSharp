import { MessageCircle, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import type { Post } from '../../types/post'

type FeedPostCardProps = {
  post: Post
  onLike: (postId: string) => void
  onOpenComments: (post: Post) => void
}

export function FeedPostCard({ post, onLike, onOpenComments }: FeedPostCardProps) {
  const originalPost = post.originalPost ?? null

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.32 }}
      className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl transition hover:border-brand-300 dark:border-ink-700 dark:bg-ink-900/80"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <Link to={ROUTES.profile(post.user.id)} className="flex items-center gap-3">
          <img
            src={post.user.avatarUrl ?? '/favicon.ico'}
            alt={post.user.fullName}
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{post.user.fullName}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400">@{post.user.userName}</p>
          </div>
        </Link>
        <time className="text-xs text-ink-500 dark:text-ink-400">{new Date(post.createdAt).toLocaleString()}</time>
      </header>

      {post.content ? <p className="mb-4 whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200">{post.content}</p> : null}

      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt="Post"
          loading="lazy"
          className="h-auto max-h-[420px] w-full rounded-2xl object-cover"
        />
      ) : null}

      {originalPost ? (
        <section className="mt-3 rounded-2xl border border-ink-200/80 bg-white/70 p-3 dark:border-ink-700 dark:bg-ink-800/70">
          <Link to={ROUTES.profile(originalPost.user.id)} className="mb-2 inline-flex items-center gap-2">
            <img
              src={originalPost.user.avatarUrl ?? '/favicon.ico'}
              alt={originalPost.user.fullName}
              loading="lazy"
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="text-xs font-semibold text-ink-700 dark:text-ink-200">Bài viết gốc của {originalPost.user.fullName}</span>
          </Link>

          {originalPost.content ? (
            <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200">{originalPost.content}</p>
          ) : (
            <p className="text-sm text-ink-500 dark:text-ink-400">Bài viết gốc không có nội dung văn bản.</p>
          )}

          {originalPost.imageUrl ? (
            <img
              src={originalPost.imageUrl}
              alt="Original post"
              loading="lazy"
              className="mt-3 h-auto max-h-[360px] w-full rounded-xl object-cover"
            />
          ) : null}
        </section>
      ) : null}

      <footer className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-50"
        >
          <Heart size={16} />
          {post.likeCount}
        </button>

        <button
          type="button"
          onClick={() => onOpenComments(post)}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-50"
        >
          <MessageCircle size={16} />
          {post.commentCount} bình luận
        </button>
      </footer>
    </motion.article>
  )
}
