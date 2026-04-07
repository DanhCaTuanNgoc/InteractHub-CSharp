import { useEffect, useMemo, useState } from 'react'
import { AtSign, Check, Clapperboard, Clock3, Mail, Newspaper, Save, UserRoundCheck, UserRoundPen, UserRoundPlus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Avatar } from '../shared/components/common/Avatar'
import { Button } from '../shared/components/common/Button'
import { FileInput } from '../shared/components/common/FileInput'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { PostCard } from '../shared/components/posts/PostCard'
import { TextInput } from '../shared/components/common/TextInput'
import { useAuth } from '../features/auth/hooks/useAuth'
import { friendService } from '../shared/services/friendService'
import { postService } from '../shared/services/postService'
import { storyService } from '../shared/services/storyService'
import { uploadService } from '../shared/services/uploadService'
import { userService } from '../shared/services/userService'
import type { FriendshipRelationship } from '../shared/types/friendshipRelationship'
import type { Post } from '../shared/types/post'
import type { Story } from '../shared/types/story'
import type { UserSummary } from '../shared/types/user'

type ProfileFormValues = {
  fullName: string
  bio: string
  avatar: FileList
}

export function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserSummary | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userStories, setUserStories] = useState<Story[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [relationship, setRelationship] = useState<FriendshipRelationship | null>(null)
  const [relationshipLoading, setRelationshipLoading] = useState(false)
  const [relationshipBusy, setRelationshipBusy] = useState(false)
  const [relationshipError, setRelationshipError] = useState<string | null>(null)

  const profileId = useMemo(() => (id === 'me' ? user?.id : id), [id, user?.id])
  const isOwnProfile = useMemo(() => profileId === user?.id, [profileId, user?.id])

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>()

  const avatarInput = watch('avatar')

  useEffect(() => {
    const file = avatarInput?.[0]
    if (!file) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [avatarInput])

  useEffect(() => {
    if (!profileId) {
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const fetched = await userService.getProfile(profileId)
        setProfile(fetched)
        reset({
          fullName: fetched.fullName,
          bio: fetched.bio ?? '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [profileId, reset])

  useEffect(() => {
    if (!profileId) {
      return
    }

    const loadActivity = async () => {
      setActivityLoading(true)
      setActivityError(null)

      try {
        const [feed, stories] = await Promise.all([postService.getFeed(1, 50), storyService.getAll()])
        setUserPosts(feed.items.filter((item) => item.user.id === profileId))
        setUserStories(stories.filter((item) => item.user.id === profileId))
      } catch (err) {
        setUserPosts([])
        setUserStories([])
        setActivityError(err instanceof Error ? err.message : 'Không thể tải hoạt động của người dùng.')
      } finally {
        setActivityLoading(false)
      }
    }

    void loadActivity()
  }, [profileId])

  useEffect(() => {
    if (!profileId || isOwnProfile) {
      setRelationship(null)
      setRelationshipError(null)
      return
    }

    const loadRelationship = async () => {
      setRelationshipLoading(true)
      setRelationshipError(null)

      try {
        const current = await friendService.getRelationship(profileId)
        setRelationship(current)
      } catch (err) {
        setRelationship(null)
        setRelationshipError(err instanceof Error ? err.message : 'Không thể tải trạng thái kết bạn.')
      } finally {
        setRelationshipLoading(false)
      }
    }

    void loadRelationship()
  }, [isOwnProfile, profileId])

  const onSubmit = handleSubmit(async (values) => {
    if (!profileId) {
      return
    }

    if (!isOwnProfile) {
      setSubmitError('Bạn chỉ có thể cập nhật hồ sơ của chính mình.')
      return
    }

    setSubmitError(null)
    let avatarUrl = profile?.avatarUrl ?? undefined

    try {
      if (values.avatar?.[0]) {
        const uploaded = await uploadService.uploadImage(values.avatar[0])
        avatarUrl = uploaded.url
      }

      const updated = await userService.updateProfile(profileId, {
        fullName: values.fullName,
        bio: values.bio,
        avatarUrl,
      })

      setProfile(updated)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ.')
    }
  })

  const toggleLike = async (postId: string) => {
    try {
      const updated = await postService.toggleLike(postId)
      setUserPosts((current) => current.map((post) => (post.id === postId ? updated : post)))
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Không thể cập nhật lượt thích.')
    }
  }

  const addComment = async (postId: string, content: string) => {
    try {
      const created = await postService.addComment(postId, content)
      setUserPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                commentCount: post.commentCount + 1,
                recentComments: [created, ...post.recentComments].slice(0, 3),
              }
            : post,
        ),
      )
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Không thể thêm bình luận.')
      throw err
    }
  }

  const sharePost = async (postId: string) => {
    try {
      const shared = await postService.share(postId)
      if (shared.user.id === profileId) {
        setUserPosts((current) => [shared, ...current])
      }
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Không thể chia sẻ bài viết.')
      throw err
    }
  }

  const reportPost = async (postId: string, reason: string) => {
    try {
      await postService.report(postId, reason)
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Không thể report bài viết.')
      throw err
    }
  }

  const deletePost = async (postId: string) => {
    try {
      await postService.remove(postId)
      setUserPosts((current) => current.filter((post) => post.id !== postId))
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Không thể xóa bài viết.')
      throw err
    }
  }

  const updatePost = async (postId: string, content: string) => {
    try {
      const updated = await postService.update(postId, { content })
      setUserPosts((current) => current.map((post) => (post.id === postId ? updated : post)))
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Không thể cập nhật bài viết.')
      throw err
    }
  }

  const handleRelationshipAction = async (action: 'send' | 'accept' | 'decline' | 'remove') => {
    if (!profileId) {
      return
    }

    setRelationshipBusy(true)
    setRelationshipError(null)

    try {
      if (action === 'send') {
        await friendService.sendRequest(profileId)
      }

      if (action === 'accept') {
        await friendService.accept(profileId)
      }

      if (action === 'decline') {
        await friendService.decline(profileId)
      }

      if (action === 'remove') {
        await friendService.remove(profileId)
      }

      const latest = await friendService.getRelationship(profileId)
      setRelationship(latest)
    } catch (err) {
      setRelationshipError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái bạn bè.')
    } finally {
      setRelationshipBusy(false)
    }
  }

  const relationshipLabel = useMemo(() => {
    if (isOwnProfile) {
      return 'Bạn'
    }

    switch (relationship?.status) {
      case 'Friends':
        return 'Bạn bè'
      case 'RequestSent':
        return 'Đã gửi lời mời'
      case 'RequestReceived':
        return 'Đã nhận lời mời'
      case 'Self':
        return 'Bạn'
      default:
        return 'Chưa kết bạn'
    }
  }, [isOwnProfile, relationship?.status])

  if (loading) {
    return <LoadingSkeleton lines={5} variant="user" />
  }

  return (
    <section className="cards-section cards-section--single profile-page mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="status-card profile-card profile-hero-card p-4 sm:p-5 lg:p-6">
        <div className="profile-hero">
          <div className="profile-hero__identity">
            <Avatar src={previewUrl ?? profile?.avatarUrl ?? null} alt={profile?.fullName ?? 'User avatar'} size="lg" />

            <div className="profile-hero__meta">
              <p className="profile-hero__eyebrow">Social Profile</p>
              <h1 className="title-with-icon">
                <UserRoundPen size={20} aria-hidden="true" />
                <span>{profile?.fullName ?? 'Profile'}</span>
              </h1>

              <div className="profile-hero__chips">
                <span>
                  <AtSign size={14} aria-hidden="true" />
                  {profile?.userName ?? 'username'}
                </span>
                <span>
                  <Mail size={14} aria-hidden="true" />
                  {profile?.email ?? 'email'}
                </span>
              </div>

              <p>{profile?.bio?.trim() ? profile.bio : 'Chưa có bio. Hãy thêm mô tả ngắn để hồ sơ nổi bật hơn.'}</p>
            </div>
          </div>

          <div className="profile-hero__stats" aria-label="Profile statistics">
            <article>
              <strong>{userPosts.length}</strong>
              <span>Bài đăng</span>
            </article>
            <article>
              <strong>{userStories.length}</strong>
              <span>Stories</span>
            </article>
            <article>
              <strong>{relationshipLabel}</strong>
              <span>Chế độ hồ sơ</span>
            </article>
          </div>
        </div>

        {isOwnProfile ? (
          <form className="auth-form profile-editor" onSubmit={onSubmit} noValidate>
            <h2>Chỉnh sửa hồ sơ</h2>

            {error ? <p className="form-error">{error}</p> : null}

            <TextInput
              label="Họ tên"
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'Họ tên là bắt buộc.',
                minLength: { value: 2, message: 'Họ tên tối thiểu 2 ký tự.' },
              })}
            />

            <TextInput
              label="Bio"
              error={errors.bio?.message}
              {...register('bio', {
                maxLength: { value: 280, message: 'Bio tối đa 280 ký tự.' },
              })}
            />

            <FileInput label="Avatar" previewUrl={previewUrl ?? profile?.avatarUrl ?? null} accept="image/*" {...register('avatar')} />

            {submitError ? <p className="form-error">{submitError}</p> : null}

            <Button type="submit" busy={isSubmitting}>
              <Save size={15} aria-hidden="true" />
              Lưu thay đổi
            </Button>
          </form>
        ) : (
          <div className="auth-form profile-editor" role="status" aria-live="polite">
            <h2>Kết nối</h2>
            <p>Bạn đang xem hồ sơ của người dùng khác.</p>

            {relationshipLoading ? <p>Đang tải trạng thái kết bạn...</p> : null}
            {relationshipError ? <p className="form-error">{relationshipError}</p> : null}

            {!relationshipLoading ? (
              <p className="profile-relationship-status">Trạng thái hiện tại: {relationshipLabel}</p>
            ) : null}

            {!relationshipLoading && relationship?.status === 'NotFriends' ? (
              <Button type="button" variant="ghost" busy={relationshipBusy} onClick={() => void handleRelationshipAction('send')}>
                <UserRoundPlus size={15} aria-hidden="true" />
                Gửi lời mời kết bạn
              </Button>
            ) : null}

            {!relationshipLoading && relationship?.status === 'RequestSent' ? (
              <Button type="button" variant="ghost" disabled>
                <Clock3 size={15} aria-hidden="true" />
                Đã gửi lời mời
              </Button>
            ) : null}

            {!relationshipLoading && relationship?.status === 'RequestReceived' ? (
              <div className="profile-relationship-actions">
                <Button type="button" variant="primary" busy={relationshipBusy} onClick={() => void handleRelationshipAction('accept')}>
                  <Check size={15} aria-hidden="true" />
                  Chấp nhận
                </Button>
                <Button type="button" variant="danger" busy={relationshipBusy} onClick={() => void handleRelationshipAction('decline')}>
                  <X size={15} aria-hidden="true" />
                  Từ chối
                </Button>
              </div>
            ) : null}

            {!relationshipLoading && relationship?.status === 'Friends' ? (
              <Button type="button" variant="danger" busy={relationshipBusy} onClick={() => void handleRelationshipAction('remove')}>
                <UserRoundCheck size={15} aria-hidden="true" />
                Hủy kết bạn
              </Button>
            ) : null}
          </div>
        )}
      </article>

      <article className="status-card profile-activity p-4 sm:p-5 lg:p-6">
        <div className="profile-activity__section">
          <h2 className="title-with-icon">
            <Newspaper size={18} aria-hidden="true" />
            <span>Bài đăng của người dùng</span>
          </h2>

          {activityError ? <p className="form-error">{activityError}</p> : null}
          {activityLoading ? <LoadingSkeleton lines={3} variant="post" /> : null}
          {!activityLoading && userPosts.length === 0 ? <p>Chưa có bài đăng nào.</p> : null}

          <div className="profile-post-list">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={toggleLike}
                onComment={addComment}
                onShare={sharePost}
                onReport={reportPost}
                onDelete={deletePost}
                onUpdate={updatePost}
              />
            ))}
          </div>
        </div>

        <div className="profile-activity__section">
          <h2 className="title-with-icon">
            <Clapperboard size={18} aria-hidden="true" />
            <span>Stories của người dùng</span>
          </h2>

          {!isOwnProfile ? <p>Story hiện chỉ khả dụng với hồ sơ của bạn trong phiên bản API hiện tại.</p> : null}
          {isOwnProfile && !activityLoading && userStories.length === 0 ? <p>Bạn chưa có story nào đang hoạt động.</p> : null}

          {isOwnProfile ? (
            <div className="profile-story-grid">
              {userStories.map((story) => (
                <article key={story.id} className="profile-story-item">
                  <img src={story.mediaUrl} alt="User story" />
                  <small>{new Date(story.createdAt).toLocaleString()}</small>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  )
}
