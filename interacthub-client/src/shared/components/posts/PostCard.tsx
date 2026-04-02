import { useMemo, useState, type FormEvent } from 'react'
import { Clock3, Heart, MessageCircle } from 'lucide-react'
import type { Post } from '../../types/post'
import { Avatar } from '../common/Avatar'
import { Button } from '../common/Button'
import { TextInput } from '../common/TextInput'

type PostCardProps = {
  post: Post
  currentUserId?: string
  onLike: (postId: string) => void
  onComment: (postId: string, content: string) => Promise<void>
  onShare: (postId: string) => Promise<void>
  onReport: (postId: string, reason: string) => Promise<void>
  onDelete: (postId: string) => Promise<void>
  onUpdate: (postId: string, content: string) => Promise<void>
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onReport,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const [commentText, setCommentText] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [editContent, setEditContent] = useState(post.content)
  const [isEditing, setIsEditing] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const isOwner = useMemo(() => currentUserId === post.user.id, [currentUserId, post.user.id])

  const runAction = async (action: string, fn: () => Promise<void>) => {
    setBusyAction(action)
    setLocalError(null)
    try {
      await fn()
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Thao tác thất bại.')
    } finally {
      setBusyAction(null)
    }
  }

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!commentText.trim()) {
      return
    }

    await runAction('comment', async () => {
      await onComment(post.id, commentText.trim())
      setCommentText('')
    })
  }

  const submitReport = async (event: FormEvent) => {
    event.preventDefault()
    if (reportReason.trim().length < 5) {
      setLocalError('Lý do report tối thiểu 5 ký tự.')
      return
    }

    await runAction('report', async () => {
      await onReport(post.id, reportReason.trim())
      setReportReason('')
    })
  }

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editContent.trim()) {
      setLocalError('Nội dung không được để trống.')
      return
    }

    await runAction('update', async () => {
      await onUpdate(post.id, editContent.trim())
      setIsEditing(false)
    })
  }

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

      {isEditing ? (
        <form className="post-card__inline-form" onSubmit={saveEdit}>
          <TextInput label="Nội dung mới" value={editContent} onChange={(event) => setEditContent(event.target.value)} />
          <div className="post-card__inline-actions">
            <Button type="submit" variant="primary" busy={busyAction === 'update'}>
              Lưu
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
          </div>
        </form>
      ) : (
        <p className="post-card__content">{post.content}</p>
      )}
      {post.imageUrl ? <img src={post.imageUrl} alt="Post attachment" className="post-card__image" /> : null}

      <footer className="post-card__actions">
        <Button type="button" variant="ghost" onClick={() => onLike(post.id)}>
          <Heart size={15} aria-hidden="true" />
          Like ({post.likeCount})
        </Button>
        <Button type="button" variant="ghost" busy={busyAction === 'share'} onClick={() => void runAction('share', () => onShare(post.id))}>
          Share
        </Button>
        {isOwner ? (
          <>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              busy={busyAction === 'delete'}
              onClick={() => void runAction('delete', () => onDelete(post.id))}
            >
              Delete
            </Button>
          </>
        ) : null}
        <span className="post-card__comment-count">
          <MessageCircle size={14} aria-hidden="true" />
          <span>{post.commentCount} bình luận</span>
        </span>
      </footer>

      {post.recentComments.length > 0 ? (
        <section className="post-card__comments">
          {post.recentComments.map((comment) => (
            <article key={comment.id} className="post-card__comment-item">
              <strong>{comment.user.fullName}</strong>
              <p>{comment.content}</p>
            </article>
          ))}
        </section>
      ) : null}

      <form className="post-card__inline-form" onSubmit={submitComment}>
        <TextInput
          label="Thêm bình luận"
          placeholder="Viết bình luận..."
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
        />
        <Button type="submit" variant="ghost" busy={busyAction === 'comment'}>
          Gửi bình luận
        </Button>
      </form>

      {!isOwner ? (
        <form className="post-card__inline-form" onSubmit={submitReport}>
          <TextInput
            label="Report bài viết"
            placeholder="Lý do report (>=5 ký tự)"
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
          />
          <Button type="submit" variant="danger" busy={busyAction === 'report'}>
            Report
          </Button>
        </form>
      ) : null}

      {localError ? <p className="form-error">{localError}</p> : null}
    </article>
  )
}
