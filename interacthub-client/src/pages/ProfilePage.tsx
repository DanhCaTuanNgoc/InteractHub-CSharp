import { useEffect, useMemo, useState } from 'react'
import { Clapperboard, Newspaper, Save, UserRoundPen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Button } from '../shared/components/common/Button'
import { FileInput } from '../shared/components/common/FileInput'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { TextInput } from '../shared/components/common/TextInput'
import { useAuth } from '../features/auth/hooks/useAuth'
import { postService } from '../shared/services/postService'
import { storyService } from '../shared/services/storyService'
import { uploadService } from '../shared/services/uploadService'
import { userService } from '../shared/services/userService'
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

      try {
        const [feed, stories] = await Promise.all([postService.getFeed(1, 50), storyService.getAll()])
        setUserPosts(feed.items.filter((item) => item.user.id === profileId))
        setUserStories(stories.filter((item) => item.user.id === profileId))
      } catch {
        setUserPosts([])
        setUserStories([])
      } finally {
        setActivityLoading(false)
      }
    }

    void loadActivity()
  }, [profileId])

  const onSubmit = handleSubmit(async (values) => {
    if (!profileId) {
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
  if (loading) {
    return <LoadingSkeleton lines={5} variant="user" />
  }

  return (
    <section className="cards-section cards-section--single mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="status-card profile-card p-4 sm:p-5 lg:p-6">
        <h1 className="title-with-icon">
          <UserRoundPen size={20} aria-hidden="true" />
          <span>Profile</span>
        </h1>
        <p>Cập nhật thông tin cá nhân theo thời gian thực.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
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

          {submitError ? <p className="form-error">Khong the cap nhat ho so. Vui long thu lai.</p> : null}

          <Button type="submit" busy={isSubmitting}>
            <Save size={15} aria-hidden="true" />
            Lưu thay đổi
          </Button>
        </form>
      </article>

      <article className="status-card profile-activity p-4 sm:p-5 lg:p-6">
        <div className="profile-activity__section">
          <h2 className="title-with-icon">
            <Newspaper size={18} aria-hidden="true" />
            <span>Bai dang cua user</span>
          </h2>

          {activityLoading ? <LoadingSkeleton lines={3} variant="post" /> : null}
          {!activityLoading && userPosts.length === 0 ? <p>Chua co bai dang nao.</p> : null}

          <div className="profile-post-list">
            {userPosts.map((post) => (
              <article key={post.id} className="profile-post-item">
                <p>{post.content}</p>
                {post.imageUrl ? <img src={post.imageUrl} alt="User post" className="profile-post-item__image" /> : null}
                <small>
                  {post.likeCount} likes • {post.commentCount} comments • {new Date(post.createdAt).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        </div>

        <div className="profile-activity__section">
          <h2 className="title-with-icon">
            <Clapperboard size={18} aria-hidden="true" />
            <span>Stories cua user</span>
          </h2>

          {!isOwnProfile ? <p>Story chi kha dung voi ho so cua ban trong phien ban API hien tai.</p> : null}
          {isOwnProfile && !activityLoading && userStories.length === 0 ? <p>Ban chua co story nao dang hoat dong.</p> : null}

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
