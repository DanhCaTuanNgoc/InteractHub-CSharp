import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import type { Story } from '../../types/story'

type StoriesStripProps = {
  stories: Story[]
  loading: boolean
}

export function StoriesStrip({ stories, loading }: StoriesStripProps) {
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

  return (
    <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="w-20 shrink-0"
        >
          <Link to={ROUTES.profile(story.user.id)} className="block text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(from_90deg,_#0f766e,_#f59e0b,_#0f766e)] p-[2px]">
              <img
                src={story.user.avatarUrl ?? story.mediaUrl}
                alt={story.user.fullName}
                loading="lazy"
                className="h-full w-full rounded-full border-2 border-white object-cover dark:border-ink-900"
              />
            </div>
            <p className="mt-1 truncate text-xs font-medium text-ink-600 dark:text-ink-300">{story.user.userName}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
