import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { uploadService } from '../../services/uploadService'

type CreatePostModalProps = {
  open: boolean
  busy?: boolean
  onClose: () => void
  onSubmitPost: (content: string, imageUrl?: string) => Promise<void>
}

export function CreatePostModal({ open, busy = false, onClose, onSubmitPost }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!content.trim()) {
      setError('Nội dung không được để trống.')
      return
    }

    setError(null)
    setUploading(true)

    try {
      let imageUrl: string | undefined
      if (imageFile) {
        const uploaded = await uploadService.uploadImage(imageFile)
        imageUrl = uploaded.url
      }

      await onSubmitPost(content.trim(), imageUrl)
      setContent('')
      setImageFile(null)
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể tạo bài viết.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            onSubmit={onSubmit}
            className="w-full max-w-lg rounded-3xl border border-ink-200/70 bg-white/90 p-6 shadow-soft-xl backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/90"
          >
            <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Tạo bài viết mới</h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Chia sẻ một điều thú vị với cộng đồng.</p>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="mt-4 h-32 w-full rounded-2xl border border-ink-200 bg-white/70 p-3 text-sm outline-none ring-brand-400 transition placeholder:text-ink-400 focus:ring-2 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100"
              placeholder="Bạn đang nghĩ gì hôm nay?"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="mt-3 block w-full text-sm text-ink-600 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:text-brand-700 hover:file:bg-brand-200 dark:text-ink-300 dark:file:bg-ink-700 dark:file:text-ink-100"
            />

            {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busy || uploading}
                className="cursor-pointer rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy || uploading ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
