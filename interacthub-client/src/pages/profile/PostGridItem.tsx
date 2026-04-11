import { Heart, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Post } from '../../shared/types/post'

type PostGridItemProps = {
  post: Post
  index: number
  onOpen: (post: Post) => void
}

export function PostGridItem({ post, index, onOpen }: PostGridItemProps) {
  const hasImage = Boolean(post.imageUrl)

  return (
    <motion.button
      type="button"
      className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition-shadow hover:shadow-lg"
      onClick={() => onOpen(post)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
    >
      {hasImage ? (
        <motion.img
          src={post.imageUrl ?? undefined}
          alt={post.content || 'Post image'}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      ) : (
        <motion.div
          className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 p-4 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_50%)]" aria-hidden="true" />
          <p className="relative z-10 max-h-full overflow-hidden text-sm font-semibold leading-relaxed text-white sm:text-base">
            {post.content?.trim() ? post.content : 'Shared post'}
          </p>
        </motion.div>
      )}

      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        initial={false}
      >
        <div className="flex items-center gap-5 text-sm font-semibold text-white sm:text-base">
          <span className="inline-flex items-center gap-1.5">
            <Heart size={16} fill="currentColor" />
            {post.likeCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle size={16} />
            {post.commentCount}
          </span>
        </div>
      </motion.div>
    </motion.button>
  )
}
