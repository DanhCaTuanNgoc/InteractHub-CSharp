import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hash, Heart, MessageCircle, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import type { Post } from '../../types/post'
import { LazyImage } from '../common/LazyImage'

type PostCardProps = {
  post: Post
  onLike: (postId: string) => void
  onShare: (postId: string) => void
  onOpenComments: (post: Post) => void
}

const CAPTION_PREVIEW_LENGTH = 128

export function PostCard({ post, onLike, onShare, onOpenComments }: PostCardProps) {
  const [expandedCaption, setExpandedCaption] = useState(false)
  const [likeAnimationKey, setLikeAnimationKey] = useState(0)
  const [heartBurstVisible, setHeartBurstVisible] = useState(false)
  const [displayLiked, setDisplayLiked] = useState(post.isLikedByCurrentUser)
  const liked = displayLiked

  const caption = (post.content ?? '').trim()
  const originalPost = post.originalPost ?? null
  const hasLongCaption = caption.length > CAPTION_PREVIEW_LENGTH
  const visibleCaption = useMemo(() => {
    if (!hasLongCaption || expandedCaption) {
      return caption
    }

    return `${caption.slice(0, CAPTION_PREVIEW_LENGTH).trimEnd()}...`
  }, [caption, expandedCaption, hasLongCaption])

  useEffect(() => {
    setDisplayLiked(post.isLikedByCurrentUser)
  }, [post.id, post.isLikedByCurrentUser])

  const handleLikeToggle = () => {
    setDisplayLiked((value) => !value)
    if (!liked) {
      setLikeAnimationKey((value) => value + 1)
    }
    onLike(post.id)
  }

  const handleImageDoubleClick = () => {
    setHeartBurstVisible(true)
    setTimeout(() => setHeartBurstVisible(false), 700)

    if (!liked) {
      setLikeAnimationKey((value) => value + 1)
      onLike(post.id)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.36, ease: 'easeOut' }}
      className="overflow-hidden rounded-xl border border-ink-200/80 bg-white/95 shadow-sm dark:border-ink-700 dark:bg-ink-900/90"
    >
      <header className="flex items-center justify-between px-4 pb-3 pt-4">
        <Link to={ROUTES.profile(post.user.id)} className="flex items-center gap-3">
          <LazyImage
            src={post.user.avatarUrl ?? '/favicon.ico'}
            alt={post.user.fullName}
            wrapperClassName="h-10 w-10 overflow-hidden rounded-full border border-ink-200 dark:border-ink-700"
            className="h-10 w-10 rounded-full border border-ink-200 object-cover dark:border-ink-700"
          />
          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{post.user.fullName}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400">@{post.user.userName}</p>
          </div>
        </Link>
        <time className="text-xs text-ink-500 dark:text-ink-400">{new Date(post.createdAt).toLocaleString()}</time>
      </header>

      {post.imageUrl ? (
        <div className="relative overflow-hidden" onDoubleClick={handleImageDoubleClick}>
          <LazyImage src={post.imageUrl} alt="Post" wrapperClassName="w-full" className="h-auto max-h-[560px] w-full object-cover" />

          <AnimatePresence>
            {heartBurstVisible ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.95, scale: 1.15 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 grid place-items-center"
              >
                <Heart className="h-20 w-20 fill-white text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.32)]" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      <div className="px-4 pb-4 pt-3">
        {caption ? (
          <p className="mt-2 text-sm text-ink-700 dark:text-ink-200">
            <span className="mr-1 font-semibold text-ink-900 dark:text-ink-50">{post.user.userName}</span>
            {visibleCaption}
            {hasLongCaption ? (
              <button
                type="button"
                onClick={() => setExpandedCaption((current) => !current)}
                className="ml-2 text-xs font-semibold text-ink-500 transition-colors hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100"
              >
                {expandedCaption ? 'Ẩn bớt' : 'Xem thêm'}
              </button>
            ) : null}
          </p>
        ) : null}

        {post.hashtags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <button
                key={`${post.id}-${tag}`}
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-brand-200/70 bg-brand-50/80 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-100 dark:border-brand-500/40 dark:bg-brand-900/20 dark:text-brand-200 dark:hover:bg-brand-900/35"
              >
                <Hash size={12} />
                {tag}
              </button>
            ))}
          </div>
        ) : null}

        {originalPost ? (
          <section className="mt-3 rounded-xl border border-ink-200/80 bg-white/75 p-3 dark:border-ink-700 dark:bg-ink-800/75">
            <Link to={ROUTES.profile(originalPost.user.id)} className="mb-2 inline-flex items-center gap-2">
              <LazyImage
                src={originalPost.user.avatarUrl ?? '/favicon.ico'}
                alt={originalPost.user.fullName}
                wrapperClassName="h-6 w-6 overflow-hidden rounded-full border border-ink-200 dark:border-ink-700"
                className="h-6 w-6 rounded-full border border-ink-200 object-cover dark:border-ink-700"
              />
              <span className="text-xs font-semibold text-ink-700 dark:text-ink-200">Bài viết gốc của {originalPost.user.fullName}</span>
            </Link>

            {originalPost.content?.trim() ? (
              <p className="text-sm text-ink-700 dark:text-ink-200">{originalPost.content}</p>
            ) : (
              <p className="text-sm text-ink-500 dark:text-ink-400">Bài viết gốc không có nội dung văn bản.</p>
            )}

            {originalPost.hashtags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {originalPost.hashtags.map((tag) => (
                  <span
                    key={`${originalPost.id}-${tag}`}
                    className="inline-flex items-center gap-1 rounded-full border border-ink-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-ink-600 dark:border-ink-600 dark:bg-ink-700/70 dark:text-ink-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {originalPost.imageUrl ? (
              <LazyImage
                src={originalPost.imageUrl}
                alt="Original post"
                wrapperClassName="mt-3 w-full overflow-hidden rounded-lg"
                className="mt-3 h-auto max-h-[460px] w-full rounded-lg object-cover"
              />
            ) : null}
          </section>
        ) : null}

        <div className="mb-2 mt-3 flex items-center gap-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleLikeToggle}
            aria-pressed={liked}
            className="ui-interactive ui-ripple-static inline-flex items-center justify-center rounded-full p-2 text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <motion.span
              key={likeAnimationKey}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </motion.span>
          </motion.button>

          <button
            type="button"
            onClick={() => onOpenComments(post)}
            className="ui-interactive ui-ripple-static inline-flex items-center justify-center rounded-full p-2 text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <MessageCircle className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => onShare(post.id)}
            className="ui-interactive ui-ripple-static inline-flex items-center justify-center rounded-full p-2 text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{post.likeCount.toLocaleString()} lượt thích</p>

        <div className="mt-2 space-y-1 text-sm text-ink-600 dark:text-ink-300">
          {post.commentCount > 0 ? (
            <button
              type="button"
              onClick={() => onOpenComments(post)}
              className="ui-interactive ui-ripple-static text-xs font-medium text-ink-500 transition-colors hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100"
            >
              Xem tất cả {post.commentCount.toLocaleString()} bình luận
            </button>
          ) : null}

          {post.recentComments.slice(0, 2).map((comment) => (
            <p key={comment.id}>
              <span className="mr-1 font-semibold text-ink-900 dark:text-ink-100">{comment.user.userName}</span>
              {comment.content}
            </p>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
