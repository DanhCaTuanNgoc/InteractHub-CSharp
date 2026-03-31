import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { uploadService } from '../../services/uploadService'
import { Button } from '../common/Button'
import { FileInput } from '../common/FileInput'
import { TextInput } from '../common/TextInput'

type PostFormValues = {
  content: string
  image: FileList
}

type PostFormProps = {
  onSubmitPost: (content: string, imageUrl?: string) => Promise<void>
  busy?: boolean
}

export function PostForm({ onSubmitPost, busy = false }: PostFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
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

    if (values.image?.[0]) {
      const uploaded = await uploadService.uploadImage(values.image[0])
      imageUrl = uploaded.url
    }

    try {
      await onSubmitPost(values.content, imageUrl)
      reset()
      setPreviewUrl(null)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Tạo bài viết thất bại.')
    }
  })

  return (
    <form className="post-form" onSubmit={submit}>
      <h2>Tạo bài viết</h2>

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
        accept="image/*"
        previewUrl={previewUrl}
        error={errors.image?.message}
        {...register('image')}
      />

      {submitError ? <p className="form-error">{submitError}</p> : null}

      <Button type="submit" busy={busy}>
        Đăng bài
      </Button>
    </form>
  )
}
