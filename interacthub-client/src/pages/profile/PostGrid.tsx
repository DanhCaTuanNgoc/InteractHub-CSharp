import { motion } from 'framer-motion'
import type { Post } from '../../shared/types/post'
import { PostGridItem } from './PostGridItem'

type PostGridProps = {
  posts: Post[]
  onOpenPost: (post: Post) => void
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

export function PostGrid({ posts, onOpenPost }: PostGridProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 md:grid-cols-3"
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      {posts.map((post, index) => (
        <PostGridItem key={post.id} post={post} index={index} onOpen={onOpenPost} />
      ))}
    </motion.div>
  )
}
