import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Post } from '../../types/post'

type CommentsModalProps = {
  post: Post | null
  open: boolean
  busy?: boolean
  onClose: () => void
  onSubmitComment: (postId: string, content: string) => Promise<void>
}

export function CommentsModal({ post, open, busy = false, onClose, onSubmitComment }: CommentsModalProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!post) {
      return
    }

    if (!text.trim()) {
      setError('Bình luận không được để trống.')
      return
    }

    setError(null)

    try {
      await onSubmitComment(post.id, text.trim())
      setText('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi bình luận.')
    }
  }

  return (
    <AnimatePresence>
      {open && post ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
          onClick={onClose}
        >
          <motion.section
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-ink-200/70 bg-white/90 p-6 shadow-soft-xl backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/90"
          >
            <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">Bình luận</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Bài viết của {post.user.fullName}</p>

            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {post.recentComments.length === 0 ? (
                <p className="text-sm text-ink-500 dark:text-ink-400">Chưa có bình luận nào.</p>
              ) : (
                post.recentComments.map((comment) => (
                  <article key={comment.id} className="rounded-2xl bg-ink-50 p-3 dark:bg-ink-800">
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{comment.user.fullName}</p>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{comment.content}</p>
                  </article>
                ))
              )}
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Viết bình luận..."
                className="h-24 w-full rounded-2xl border border-ink-200 bg-white/80 p-3 text-sm outline-none ring-brand-400 transition focus:ring-2 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
              />
              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="cursor-pointer rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busy ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
