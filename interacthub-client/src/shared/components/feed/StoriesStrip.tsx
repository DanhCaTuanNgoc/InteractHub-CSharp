import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { Story } from '../../types/story'

type StoriesStripProps = {
  stories: Story[]
  loading: boolean
}

export function StoriesStrip({ stories, loading }: StoriesStripProps) {
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)

  const activeStory = useMemo(() => stories.find((item) => item.id === activeStoryId) ?? null, [activeStoryId, stories])

  useEffect(() => {
    if (!activeStory) {
      return
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveStoryId(null)
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleEsc)
    }
  }, [activeStory])

  if (loading) {
    return (
      <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="w-20 shrink-0 space-y-2 text-center">
            <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-ink-200 dark:bg-ink-700" />
            <div className="mx-auto h-2 w-14 animate-pulse rounded-full bg-ink-200 dark:bg-ink-700" />
          </div>
        ))}
      </div>
    )
  }

  if (stories.length === 0) {
    return <p className="text-sm text-ink-500 dark:text-ink-400">Chưa có story nào được đăng</p>
  }

  const storyModal = (
    <AnimatePresence>
      {activeStory ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveStoryId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Story viewer"
        >
          <motion.article
            className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/15 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={activeStory.mediaUrl} alt="Story" className="aspect-[9/16] w-full object-contain bg-black" />

            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
              onClick={() => setActiveStoryId(null)}
              aria-label="Close story"
            >
              <X size={16} />
            </button>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return (
    <>
      <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="w-20 shrink-0"
          >
            <button type="button" onClick={() => setActiveStoryId(story.id)} className="block w-full text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(from_90deg,_#0f766e,_#f59e0b,_#0f766e)] p-[2px]">
                <img
                  src={story.user.avatarUrl ?? story.mediaUrl}
                  alt={story.user.fullName}
                  loading="lazy"
                  className="h-full w-full rounded-full border-2 border-white object-cover dark:border-ink-900"
                />
              </div>
              <p className="mt-1 truncate text-xs font-medium text-ink-600 dark:text-ink-300">{story.user.userName}</p>
            </button>
          </motion.div>
        ))}
      </div>

      {typeof document !== 'undefined' ? createPortal(storyModal, document.body) : null}
    </>
  )
}
