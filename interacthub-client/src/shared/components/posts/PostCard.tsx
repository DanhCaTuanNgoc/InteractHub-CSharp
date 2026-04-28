import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Clock3, Ellipsis, Heart, MessageCircle, Pencil, Send, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [likeFx, setLikeFx] = useState<'idle' | 'like' | 'unlike'>('idle')
  const previousPostIdRef = useRef(post.id)
  const previousLikedRef = useRef(post.isLikedByCurrentUser)

  const isOwner = useMemo(() => currentUserId === post.user.id, [currentUserId, post.user.id])
  const originalPost = useMemo(() => post.originalPost ?? null, [post.originalPost])
  const isSharedPost = originalPost !== null
  const canEdit = isOwner && !isSharedPost
  const actionButtonClasses =
    'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60'
  const menuItemClasses =
    'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-slate-50'

  useEffect(() => {
    if (previousPostIdRef.current !== post.id) {
      previousPostIdRef.current = post.id
      previousLikedRef.current = post.isLikedByCurrentUser
      setLikeFx('idle')
      return
    }

    if (previousLikedRef.current === post.isLikedByCurrentUser) {
      return
    }

    setLikeFx(post.isLikedByCurrentUser ? 'like' : 'unlike')
    previousLikedRef.current = post.isLikedByCurrentUser
  }, [post.id, post.isLikedByCurrentUser])

  useEffect(() => {
    if (likeFx === 'idle') {
      return
    }

    const timeout = window.setTimeout(() => setLikeFx('idle'), 560)
    return () => window.clearTimeout(timeout)
  }, [likeFx])

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
      setIsReporting(false)
      setIsMenuOpen(false)
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

  const handleLikeClick = () => {
    onLike(post.id)
  }

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.profile(post.user.id)}
            className="group flex items-center gap-3 text-slate-900 transition hover:text-cyan-700"
            aria-label={`Xem hồ sơ của ${post.user.fullName}`}
          >
            <Avatar src={post.user.avatarUrl} alt={post.user.fullName} />
            <div>
              <h3 className="font-semibold transition group-hover:text-cyan-700">{post.user.fullName}</h3>
              <p className="text-sm text-slate-500">@{post.user.userName}</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <time dateTime={post.createdAt} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Clock3 size={13} aria-hidden="true" />
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </time>

          <div className="relative">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="More options"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <Ellipsis size={16} aria-hidden="true" />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 top-full z-10 mt-2 min-w-[180px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {isOwner ? (
                  <button
                    type="button"
                    className={`${menuItemClasses} text-rose-600 hover:bg-rose-50`}
                    disabled={busyAction === 'delete'}
                    onClick={() => {
                      void runAction('delete', () => onDelete(post.id))
                      setIsMenuOpen(false)
                    }}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Xoá bài viết
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${menuItemClasses} text-rose-600 hover:bg-rose-50`}
                    onClick={() => {
                      setIsReporting(true)
                      setIsMenuOpen(false)
                    }}
                  >
                    Báo cáo bài viết
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {isEditing ? (
        <form className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4" onSubmit={saveEdit}>
          <TextInput label="Nội dung mới" value={editContent} onChange={(event) => setEditContent(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" busy={busyAction === 'update'}>
              Lưu
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
          </div>
        </form>
      ) : (
        post.content.trim() ? <p className="text-sm leading-6 text-slate-700">{post.content}</p> : null
      )}
      {post.imageUrl ? <img src={post.imageUrl} alt="Post attachment" className="w-full rounded-2xl border border-slate-200 object-cover" /> : null}

      {originalPost ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.profile(originalPost.user.id)}
                className="group flex items-center gap-3 text-slate-900 transition hover:text-cyan-700"
                aria-label={`Xem hồ sơ của ${originalPost.user.fullName}`}
              >
                <Avatar src={originalPost.user.avatarUrl} alt={originalPost.user.fullName} />
                <div>
                  <h4 className="font-semibold transition group-hover:text-cyan-700">{originalPost.user.fullName}</h4>
                  <p className="text-sm text-slate-500">@{originalPost.user.userName}</p>
                </div>
              </Link>
            </div>
            <time dateTime={originalPost.createdAt} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 size={13} aria-hidden="true" />
              <span>{new Date(originalPost.createdAt).toLocaleString()}</span>
            </time>
          </header>

          {originalPost.content.trim() ? <p className="text-sm leading-6 text-slate-700">{originalPost.content}</p> : null}
          {originalPost.imageUrl ? (
            <img src={originalPost.imageUrl} alt="Original post attachment" className="w-full rounded-2xl border border-slate-200 object-cover" />
          ) : null}
        </section>
      ) : null}

      <footer className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          className={`${actionButtonClasses} ${post.isLikedByCurrentUser ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : ''}`}
          aria-pressed={post.isLikedByCurrentUser}
          onClick={handleLikeClick}
        >
          <span
            className={[
              'relative inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300',
              post.isLikedByCurrentUser || likeFx === 'like' ? 'bg-rose-100 text-rose-600 scale-110' : 'bg-slate-100 text-slate-500',
              likeFx === 'unlike' ? 'scale-95' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          >
            <Heart size={15} aria-hidden="true" className={post.isLikedByCurrentUser || likeFx === 'like' ? 'fill-current' : ''} />
            <span
              className={[
                'absolute inset-0 rounded-full bg-rose-400/25 transition-all duration-500',
                likeFx === 'like' ? 'scale-150 opacity-100' : 'scale-75 opacity-0',
              ].join(' ')}
            />
          </span>
          <span>Like</span>
          <strong>{post.likeCount}</strong>
        </button>

        <button
          type="button"
          className={actionButtonClasses}
          disabled={busyAction === 'share'}
          onClick={() => void runAction('share', () => onShare(post.id))}
        >
          <Send size={15} aria-hidden="true" />
          <span>Share</span>
        </button>

        {canEdit ? (
          <button type="button" className={actionButtonClasses} onClick={() => setIsEditing(true)}>
            <Pencil size={15} aria-hidden="true" />
            <span>Edit</span>
          </button>
        ) : null}

        <span className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-500">
          <MessageCircle size={14} aria-hidden="true" />
          <span>{post.commentCount} bình luận</span>
        </span>
      </footer>

      {post.recentComments.length > 0 ? (
        <section className="space-y-3 border-t border-slate-200 pt-3">
          {post.recentComments.map((comment) => (
            <article key={comment.id} className="rounded-2xl bg-slate-50 p-3">
              <Link
                to={ROUTES.profile(comment.user.id)}
                className="font-semibold text-slate-900 transition hover:text-cyan-700"
                aria-label={`Xem hồ sơ của ${comment.user.fullName}`}
              >
                <strong>{comment.user.fullName}</strong>
              </Link>
              <p className="mt-1 text-sm text-slate-600">{comment.content}</p>
            </article>
          ))}
        </section>
      ) : null}

      <h4 className="text-sm font-semibold text-slate-900">Thêm bình luận</h4>

      <form className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4" onSubmit={submitComment}>
        <TextInput
        label=''  
          placeholder="Viết bình luận..."
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
        />
        <Button type="submit" variant="ghost" busy={busyAction === 'comment'}>
          Gửi bình luận
        </Button>
      </form>

      {!isOwner && isReporting ? (
        <form className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4" onSubmit={submitReport}>
          <TextInput
            label="Bao cao bai viet"
            placeholder="Ly do bao cao (toi thieu 5 ky tu)"
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="danger" busy={busyAction === 'report'}>
              Gửi báo cáo
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsReporting(false)}>
              Huỷ
            </Button>
          </div>
        </form>
      ) : null}

      {localError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{localError}</p> : null}
    </article>
  )
}
