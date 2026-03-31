import { useEffect, useState } from 'react'
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
    const created = await storyService.create(values)
    setStories((current) => [created, ...current])
    reset()
  })

  return (
    <section className="cards-section cards-section--single">
      <article className="status-card">
        <h1>Stories</h1>
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
            Đăng story
          </Button>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p>Đang tải stories...</p> : null}

        <div className="story-grid">
          {stories.map((story) => (
            <article key={story.id} className="story-card">
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
