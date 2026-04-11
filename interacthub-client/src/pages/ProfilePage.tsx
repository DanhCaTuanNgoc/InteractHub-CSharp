import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Button } from '../shared/components/common/Button'
import { FileInput } from '../shared/components/common/FileInput'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { NoticeModal } from '../shared/components/common/NoticeModal'
import { PostCard } from '../shared/components/posts/PostCard'
import { TextInput } from '../shared/components/common/TextInput'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useStoriesQuery } from '../features/stories/hooks/useStoriesQuery'
import { PostGrid } from './profile/PostGrid'
import { ProfileHeader } from './profile/ProfileHeader'
import { ProfileTabs, type ProfileTabKey } from './profile/ProfileTabs'
import { friendService } from '../shared/services/friendService'
import { postService } from '../shared/services/postService'
import { uploadService } from '../shared/services/uploadService'
import { userService } from '../shared/services/userService'
import type { FriendshipRelationship } from '../shared/types/friendshipRelationship'
import type { Post } from '../shared/types/post'
import type { UserSummary } from '../shared/types/user'

type ProfileFormValues = {
  fullName: string
  bio: string
  avatar: FileList
}

type NoticeState = {
  open: boolean
  type: 'success' | 'error' | 'info'
  title: string
  message: string
}

export function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserSummary | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [relationship, setRelationship] = useState<FriendshipRelationship | null>(null)
  const [relationshipLoading, setRelationshipLoading] = useState(false)
  const [relationshipBusy, setRelationshipBusy] = useState(false)
  const [relationshipError, setRelationshipError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [notice, setNotice] = useState<NoticeState>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  })

  const showNotice = (next: Omit<NoticeState, 'open'>) => {
    setNotice({ open: true, ...next })
  }

  const profileId = useMemo(() => (id === 'me' ? user?.id : id), [id, user?.id])
  const isOwnProfile = useMemo(() => profileId === user?.id, [profileId, user?.id])
  const {
    data: stories = [],
    isLoading: storiesLoading,
    error: storiesError,
  } = useStoriesQuery({ enabled: Boolean(profileId) })
  const userStories = useMemo(() => stories.filter((item) => item.user.id === profileId), [profileId, stories])

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
        const feed = await postService.getFeed(1, 50)
        setUserPosts(feed.items.filter((item) => item.user.id === profileId))
      } catch (err) {
        setUserPosts([])
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
      showNotice({
        type: 'info',
        title: 'Không thể cập nhật',
        message: 'Bạn chỉ có thể cập nhật hồ sơ của chính mình.',
      })
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
      showNotice({
        type: 'success',
        title: 'Cập nhật thành công',
        message: 'Thông tin hồ sơ đã được cập nhật.',
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ.')
      showNotice({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: 'Cập nhật bị lỗi. Vui lòng thử lại sau ít phút.',
      })
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
      let successMessage = 'Cập nhật trạng thái bạn bè thành công.'

      if (action === 'send') {
        await friendService.sendRequest(profileId)
        successMessage = 'Đã gửi lời mời kết bạn thành công.'
      }

      if (action === 'accept') {
        await friendService.accept(profileId)
        successMessage = 'Đã chấp nhận lời mời kết bạn thành công.'
      }

      if (action === 'decline') {
        await friendService.decline(profileId)
        successMessage = 'Đã từ chối lời mời kết bạn.'
      }

      if (action === 'remove') {
        await friendService.remove(profileId)
        successMessage = 'Đã hủy kết bạn thành công.'
      }

      const latest = await friendService.getRelationship(profileId)
      setRelationship(latest)
      showNotice({
        type: 'success',
        title: 'Thao tác thành công',
        message: successMessage,
      })
    } catch (err) {
      setRelationshipError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái bạn bè.')
      showNotice({
        type: 'error',
        title: 'Thao tác thất bại',
        message: 'Không thể xử lý yêu cầu kết bạn. Vui lòng thử lại.',
      })
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

  useEffect(() => {
    if (!selectedPost) {
      return
    }

    const latest = userPosts.find((post) => post.id === selectedPost.id)
    setSelectedPost(latest ?? null)
  }, [selectedPost, userPosts])

  const scrollToProfileEditor = () => {
    if (!isOwnProfile) {
      return
    }

    document.getElementById('profile-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId)
    setSelectedPost(null)
  }

  if (loading) {
    return <LoadingSkeleton lines={5} variant="user" />
  }

  return (
    <section className="relative space-y-5 px-1 py-2 sm:py-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-50 via-sky-50/60 to-transparent" />

      <NoticeModal
        open={notice.open}
        type={notice.type}
        title={notice.title}
        message={notice.message}
        onClose={() => setNotice((current) => ({ ...current, open: false }))}
      />

      <div className="relative z-10">
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditProfile={scrollToProfileEditor}
          postCount={userPosts.length}
          storyCount={userStories.length}
          relationship={relationship}
          relationshipLoading={relationshipLoading}
          relationshipBusy={relationshipBusy}
          relationshipLabel={relationshipLabel}
          relationshipError={relationshipError}
          onSendRequest={() => void handleRelationshipAction('send')}
          onAcceptRequest={() => void handleRelationshipAction('accept')}
          onDeclineRequest={() => void handleRelationshipAction('decline')}
          onRemoveFriend={() => void handleRelationshipAction('remove')}
        />
      </div>

      {isOwnProfile ? (
        <motion.article
          id="profile-edit-form"
          className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-cyan-100/30" />
          <form className="relative z-10 space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Edit profile details</h2>
              <p className="mt-1 text-sm text-slate-500">Update your public information and profile photo.</p>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <TextInput
                  label="Họ tên"
                  className="rounded-2xl border-slate-200 bg-white/80 shadow-sm"
                  error={errors.fullName?.message}
                  {...register('fullName', {
                    required: 'Họ tên là bắt buộc.',
                    minLength: { value: 2, message: 'Họ tên tối thiểu 2 ký tự.' },
                  })}
                />
              </div>

              <div className="md:col-span-1">
                <TextInput
                  label="Bio"
                  className="rounded-2xl border-slate-200 bg-white/80 shadow-sm"
                  error={errors.bio?.message}
                  {...register('bio', {
                    maxLength: { value: 280, message: 'Bio tối đa 280 ký tự.' },
                  })}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
              <FileInput label="Avatar" previewUrl={previewUrl ?? profile?.avatarUrl ?? null} accept="image/*" {...register('avatar')} />
            </div>

            {submitError ? <p className="form-error">{submitError}</p> : null}

            <Button
              type="submit"
              busy={isSubmitting}
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-white shadow-sm transition hover:bg-slate-800 hover:shadow-lg"
            >
              <Save size={15} aria-hidden="true" />
              Save change
            </Button>
          </form>
        </motion.article>
      ) : null}

      <motion.article
        className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-xl sm:p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-sky-50/40" />

        <div className="relative z-10 space-y-4">
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

          {activityError ? <p className="form-error">{activityError}</p> : null}
          {storiesError ? <p className="form-error">{storiesError instanceof Error ? storiesError.message : 'Không thể tải stories.'}</p> : null}
          {activityLoading ? <LoadingSkeleton lines={3} variant="post" /> : null}

          <AnimatePresence mode="wait">
            {activeTab === 'posts' ? (
              <motion.div
                key="tab-posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {!activityLoading && userPosts.length === 0 ? <p className="text-sm text-slate-500">Chưa có bài đăng nào.</p> : null}
                {!activityLoading && userPosts.length > 0 ? <PostGrid posts={userPosts} onOpenPost={setSelectedPost} /> : null}
              </motion.div>
            ) : (
              <motion.div
                key="tab-stories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >
                {!isOwnProfile ? <p className="text-sm text-slate-500">Bạn đang xem stories công khai của người dùng này.</p> : null}
                {storiesLoading ? <p className="text-sm text-slate-500">Đang tải stories...</p> : null}
                {!storiesLoading && userStories.length === 0 ? <p className="text-sm text-slate-500">Chưa có story nào đang hoạt động.</p> : null}

                {!storiesLoading && userStories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {userStories.map((story, index) => (
                      <motion.article
                        key={story.id}
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition-shadow hover:shadow-lg"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.26, delay: index * 0.04 }}
                      >
                        <motion.img
                          src={story.mediaUrl}
                          alt="User story"
                          className="h-full w-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.24, ease: 'easeOut' }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs text-white">
                          {new Date(story.createdAt).toLocaleString()}
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>

      <AnimatePresence>
        {selectedPost ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/50 bg-white p-3 shadow-2xl sm:p-5"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close post"
                onClick={() => setSelectedPost(null)}
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              >
                <X size={16} />
              </button>

              <PostCard
                post={selectedPost}
                currentUserId={user?.id}
                onLike={toggleLike}
                onComment={addComment}
                onShare={sharePost}
                onReport={reportPost}
                onDelete={handleDeletePost}
                onUpdate={updatePost}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
