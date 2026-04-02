import { Clock3, Heart, MessageCircle } from 'lucide-react'
import type { Post } from '../../types/post'
import { Avatar } from '../common/Avatar'
import { Button } from '../common/Button'

type PostCardProps = {
  post: Post
  onLike: (postId: string) => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <article className="post-card">
      <header className="post-card__header">
        <div className="post-card__author">
          <Avatar src={post.user.avatarUrl} alt={post.user.fullName} />
          <div>
            <h3>{post.user.fullName}</h3>
            <p>@{post.user.userName}</p>
          </div>
        </div>
        <time dateTime={post.createdAt} className="post-card__time">
          <Clock3 size={13} aria-hidden="true" />
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </time>
      </header>

      <p className="post-card__content">{post.content}</p>
      {post.imageUrl ? <img src={post.imageUrl} alt="Post attachment" className="post-card__image" /> : null}

      <footer className="post-card__actions">
        <Button type="button" variant="ghost" onClick={() => onLike(post.id)}>
          <Heart size={15} aria-hidden="true" />
          Like ({post.likeCount})
        </Button>
        <span className="post-card__comment-count">
          <MessageCircle size={14} aria-hidden="true" />
          <span>{post.commentCount} bình luận</span>
        </span>
      </footer>
    </article>
  )
}
