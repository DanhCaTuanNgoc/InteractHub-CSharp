import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, Clapperboard, ImagePlus, Sparkles, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../shared/components/common/Button'
import { FileInput } from '../shared/components/common/FileInput'
import { storyService } from '../shared/services/storyService'
import { uploadService } from '../shared/services/uploadService'
import type { Story } from '../shared/types/story'

type StoryFormValues = {
  media: FileList
}

export function StoriesPage() {
  const queryClient = useQueryClient()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StoryFormValues>()

  const mediaInput = watch('media')

  useEffect(() => {
    const file = mediaInput?.[0]
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [mediaInput])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await storyService.getAll()
        setStories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải stories.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const selectedFile = values.media?.[0]
      if (!selectedFile) {
        setSubmitError('Vui lòng chọn ảnh trước khi đăng story.')
        return
      }

      const uploaded = await uploadService.uploadImage(selectedFile)
      const created = await storyService.create({ mediaUrl: uploaded.url })
      setStories((current) => [created, ...current])
      await queryClient.invalidateQueries({ queryKey: ['stories'] })
      reset()
      setPreviewUrl(null)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể đăng story.')
    }
  })

  const removeStory = async (storyId: string) => {
    setDeletingId(storyId)
    setError(null)

    try {
      await storyService.remove(storyId)
      setStories((current) => current.filter((story) => story.id !== storyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa story.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="relative space-y-5 px-1 py-2 sm:py-4">
      <motion.article
        className="relative overflow-hidden rounded-2xl border border-white/65 bg-white/75 p-5 shadow-sm backdrop-blur-xl sm:p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      >
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                <Clapperboard size={20} aria-hidden="true" />
                <span>Stories</span>
              </h1>
              <p className="mt-1 text-sm text-slate-600">Tạo story mới và quản lý danh sách story đang hoạt động.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              <Sparkles size={14} />
              Live stories
            </span>
          </div>

          <form className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm" onSubmit={onSubmit}>
            <FileInput
              label="Chọn ảnh story"
              accept="image/*"
              previewUrl={previewUrl}
              error={errors.media?.message}
              {...register('media', {
                validate: (fileList) => {
                  if (!fileList || fileList.length === 0) {
                    return 'Vui lòng chọn ảnh story.'
                  }

                  return true
                },
              })}
            />
            <Button
              type="submit"
              busy={isSubmitting}
              className="mt-3 rounded-2xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 hover:shadow-lg"
            >
              <ImagePlus size={15} aria-hidden="true" />
              Đăng story
            </Button>
          </form>

          {error ? <p className="form-error">{error}</p> : null}
          {submitError ? <p className="form-error">{submitError}</p> : null}
          {loading ? <p className="text-sm text-slate-500">Đang tải stories...</p> : null}

          {!loading && stories.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Chưa có story nào, hãy đăng story đầu tiên của bạn.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, index) => (
              <motion.article
                key={story.id}
                className="group overflow-hidden rounded-2xl border border-white/75 bg-white shadow-sm transition-shadow hover:shadow-lg"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <motion.img
                    src={story.mediaUrl}
                    alt="Story media"
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3">
                    <p className="truncate text-xs font-medium text-white">{story.user.fullName}</p>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarClock size={13} />
                    {new Date(story.createdAt).toLocaleString()}
                  </div>

                  <Button
                    type="button"
                    variant="danger"
                    busy={deletingId === story.id}
                    onClick={() => void removeStory(story.id)}
                    className="w-full justify-center rounded-2xl"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Xóa
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.article>
    </section>
  )
}
