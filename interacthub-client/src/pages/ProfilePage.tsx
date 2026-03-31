import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Button } from '../shared/components/common/Button'
import { FileInput } from '../shared/components/common/FileInput'
import { LoadingSkeleton } from '../shared/components/common/LoadingSkeleton'
import { TextInput } from '../shared/components/common/TextInput'
import { useAuth } from '../features/auth/hooks/useAuth'
import { uploadService } from '../shared/services/uploadService'
import { userService } from '../shared/services/userService'
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
  const [profile, setProfile] = useState<UserSummary | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const profileId = useMemo(() => (id === 'me' ? user?.id : id), [id, user?.id])

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

  const onSubmit = handleSubmit(async (values) => {
    if (!profileId) {
      return
    }

    let avatarUrl = profile?.avatarUrl ?? undefined

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
  })

  if (loading) {
    return <LoadingSkeleton lines={5} variant="user" />
  }

  if (error) {
    return <p className="form-error">{error}</p>
  }

  return (
    <section className="cards-section cards-section--single">
      <article className="status-card profile-card">
        <h1>Profile</h1>
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

          <Button type="submit" busy={isSubmitting}>
            Lưu thay đổi
          </Button>
        </form>
      </article>
    </section>
  )
}
