import { useEffect, useState } from 'react'
import { Clapperboard, ImagePlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '../shared/components/common/Button'
import { TextInput } from '../shared/components/common/TextInput'
import { storyService } from '../shared/services/storyService'
import type { Story } from '../shared/types/story'

type StoryFormValues = {
  mediaUrl: string
}

export function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoryFormValues>()

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
      const created = await storyService.create(values)
      setStories((current) => [created, ...current])
      reset()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể đăng story.')
    }
  })

  return (
    <section className="cards-section cards-section--single mt-2 grid grid-cols-1 gap-4 sm:mt-4">
      <article className="status-card p-4 sm:p-5 lg:p-6">
        <h1 className="title-with-icon">
          <Clapperboard size={20} aria-hidden="true" />
          <span>Stories</span>
        </h1>
        <p>Tạo story mới và xem danh sách đang hoạt động.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <TextInput
            label="Media URL"
            placeholder="https://..."
            error={errors.mediaUrl?.message}
            {...register('mediaUrl', {
              required: 'Media URL là bắt buộc.',
              pattern: {
                value: /^https?:\/\/.+/i,
                message: 'Media URL phải bắt đầu bằng http hoặc https.',
              },
            })}
          />
          <Button type="submit" busy={isSubmitting}>
            <ImagePlus size={15} aria-hidden="true" />
            Đăng story
          </Button>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
        {submitError ? <p className="form-error">{submitError}</p> : null}
        {loading ? <p>Đang tải stories...</p> : null}

        <div className="story-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story.id} className="story-card overflow-hidden rounded-xl">
              <img src={story.mediaUrl} alt="Story media" />
              <div>
                <strong>{story.user.fullName}</strong>
                <p>{new Date(story.createdAt).toLocaleString()}</p>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
