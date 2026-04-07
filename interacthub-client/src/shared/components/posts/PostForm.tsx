import { useEffect, useState } from 'react'
import { PenSquare, SendHorizontal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { uploadService } from '../../services/uploadService'
import { Button } from '../common/Button'
import { FileInput } from '../common/FileInput'
import { TextInput } from '../common/TextInput'

type PostFormValues = {
  content: string
  image: FileList
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])

type PostFormProps = {
  onSubmitPost: (content: string, imageUrl?: string) => Promise<void>
  busy?: boolean
}

export function PostForm({ onSubmitPost, busy = false }: PostFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostFormValues>()

  const imageFile = watch('image')

  useEffect(() => {
    const file = imageFile?.[0]
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const submit = handleSubmit(async (values) => {
    setSubmitError(null)
    let imageUrl: string | undefined

    try {
      setUploading(true)

      if (values.image?.[0]) {
        const uploaded = await uploadService.uploadImage(values.image[0])
        imageUrl = uploaded.url
      }

      await onSubmitPost(values.content, imageUrl)
      reset()
      setPreviewUrl(null)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Tạo bài viết thất bại.')
    } finally {
      setUploading(false)
    }
  })

  return (
    <form className="post-form" onSubmit={submit}>
      <h2 className="title-with-icon">
        <PenSquare size={18} aria-hidden="true" />
        <span>Tạo bài viết của bạn</span>
      </h2>

      <TextInput
        label="Nội dung"
        placeholder="Bạn đang nghĩ gì?"
        error={errors.content?.message}
        {...register('content', {
          required: 'Nội dung không được để trống.',
          minLength: { value: 1, message: 'Nội dung không được để trống.' },
          maxLength: { value: 2000, message: 'Nội dung tối đa 2000 ký tự.' },
        })}
      />

      <FileInput
        label="Ảnh đính kèm"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        previewUrl={previewUrl}
        error={errors.image?.message}
        {...register('image', {
          validate: {
            supportedType: (files) => {
              const file = files?.[0]
              if (!file) {
                return true
              }
              return ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase()) || 'Dinh dang anh khong ho tro. Chi chap nhan JPG, PNG, WEBP, GIF.'
            },
            maxSize: (files) => {
              const file = files?.[0]
              if (!file) {
                return true
              }
              return file.size <= MAX_IMAGE_SIZE_BYTES || 'Anh vuot qua gioi han 5MB. Vui long chon anh nho hon.'
            },
          },
        })}
      />

      {submitError ? <p className="form-error">{submitError}</p> : null}

      <Button type="submit" busy={busy || uploading}>
        <SendHorizontal size={15} aria-hidden="true" />
        Đăng bài
      </Button>
    </form>
  )
}
