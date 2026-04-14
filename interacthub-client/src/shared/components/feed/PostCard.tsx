import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Ellipsis, Flag, Heart, MessageCircle, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import type { Post } from '../../types/post'
import { Button } from '../common/Button'
import { LazyImage } from '../common/LazyImage'
import { Modal } from '../common/Modal'

type PostCardProps = {
  post: Post
  currentUserId?: string
  onLike: (postId: string) => void
  onShare: (postId: string) => void
  onOpenComments: (post: Post) => void
  onReport: (postId: string, reason: string) => Promise<void>
}

const REPORT_REASON_OPTIONS = ['Spam', 'Nội dung quấy rối', 'Thông tin sai lệch', 'Ngôn từ thù ghét', 'Khác']

const CAPTION_PREVIEW_LENGTH = 128

export function PostCard({ post, currentUserId, onLike, onShare, onOpenComments, onReport }: PostCardProps) {
  const [expandedCaption, setExpandedCaption] = useState(false)
  const [likeAnimationKey, setLikeAnimationKey] = useState(0)
  const [heartBurstVisible, setHeartBurstVisible] = useState(false)
  const [displayLiked, setDisplayLiked] = useState(post.isLikedByCurrentUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedReportReason, setSelectedReportReason] = useState(REPORT_REASON_OPTIONS[0])
  const [customReportReason, setCustomReportReason] = useState('')
  const [reportError, setReportError] = useState<string | null>(null)
  const [isReporting, setIsReporting] = useState(false)
  const liked = displayLiked
  const isOwner = currentUserId === post.user.id

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

  useEffect(() => {
    setMenuOpen(false)
  }, [post.id])

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

  const closeReportModal = () => {
    if (isReporting) {
      return
    }

    setReportModalOpen(false)
    setReportError(null)
  }

  const submitReport = async () => {
    const reason = selectedReportReason === 'Khác' ? customReportReason.trim() : selectedReportReason

    if (reason.length < 5) {
      setReportError('Lý do báo cáo tối thiểu 5 ký tự.')
      return
    }

    setIsReporting(true)
    setReportError(null)

    try {
      await onReport(post.id, reason)
      setReportModalOpen(false)
      setCustomReportReason('')
      setSelectedReportReason(REPORT_REASON_OPTIONS[0])
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Không thể gửi báo cáo bài viết.')
    } finally {
      setIsReporting(false)
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
        <div className="flex items-center gap-1">
          <time className="text-xs text-ink-500 dark:text-ink-400">{new Date(post.createdAt).toLocaleString()}</time>
          {!isOwner ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Mở tùy chọn bài viết"
                aria-expanded={menuOpen}
                className="ui-interactive ui-ripple-static inline-flex items-center justify-center rounded-full p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <Ellipsis className="h-4 w-4" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-10 z-10 min-w-[190px] rounded-xl border border-ink-200 bg-white p-1 shadow-soft dark:border-ink-700 dark:bg-ink-900">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                    onClick={() => {
                      setMenuOpen(false)
                      setReportModalOpen(true)
                    }}
                  >
                    <Flag className="h-4 w-4" />
                    Báo cáo bài viết
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
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

      <Modal open={reportModalOpen} title="Báo cáo bài viết" onClose={closeReportModal}>
        <div className="space-y-3">
          <p className="text-sm text-ink-600 dark:text-ink-300">Chọn lý do để gửi báo cáo cho bài viết này.</p>

          <div className="grid gap-2">
            {REPORT_REASON_OPTIONS.map((reason) => (
              <label
                key={reason}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-700 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-ink-700 dark:text-ink-200 dark:hover:border-brand-500"
              >
                <input
                  type="radio"
                  name={`report-reason-${post.id}`}
                  value={reason}
                  checked={selectedReportReason === reason}
                  onChange={() => setSelectedReportReason(reason)}
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReportReason === 'Khác' ? (
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink-700 dark:text-ink-200" htmlFor={`custom-reason-${post.id}`}>
                Lý do chi tiết
              </label>
              <textarea
                id={`custom-reason-${post.id}`}
                value={customReportReason}
                onChange={(event) => setCustomReportReason(event.target.value)}
                placeholder="Nhập lý do cụ thể (tối thiểu 5 ký tự)..."
                rows={3}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 outline-none transition focus:border-brand-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
              />
            </div>
          ) : null}

          {reportError ? <p className="form-error">{reportError}</p> : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="danger" busy={isReporting} onClick={() => void submitReport()}>
              Gửi báo cáo
            </Button>
            <Button type="button" variant="ghost" disabled={isReporting} onClick={closeReportModal}>
              Hủy
            </Button>
          </div>
        </div>
      </Modal>
    </motion.article>
  )
}
