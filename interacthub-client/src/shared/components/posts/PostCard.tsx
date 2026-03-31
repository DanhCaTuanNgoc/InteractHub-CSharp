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
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>
      </header>

      <p className="post-card__content">{post.content}</p>
      {post.imageUrl ? <img src={post.imageUrl} alt="Post attachment" className="post-card__image" /> : null}

      <footer className="post-card__actions">
        <Button type="button" variant="ghost" onClick={() => onLike(post.id)}>
          Like ({post.likeCount})
        </Button>
        <span>{post.commentCount} bình luận</span>
      </footer>
    </article>
  )
}
