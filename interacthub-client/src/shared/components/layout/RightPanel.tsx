import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useStoriesQuery } from '../../../features/stories/hooks/useStoriesQuery'

export function RightPanel() {
  const { data: stories = [], isLoading } = useStoriesQuery()
  const previewStories = stories.slice(0, 5)

  return (
    <aside className="hidden 2xl:block">
      <div className="sticky top-6 space-y-4">
        <section className="rounded-3xl border border-ink-200/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/75">
          <h3 className="font-title text-lg text-ink-900 dark:text-white">Latest Stories</h3>
          {isLoading ? (
            <div className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-3 animate-pulse rounded-full bg-ink-200 dark:bg-ink-700" />
              ))}
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {previewStories.length === 0 ? <li className="text-sm text-ink-500 dark:text-ink-400">Chưa có stories mới.</li> : null}
              {previewStories.map((item) => (
                <li key={item.id} className="rounded-2xl bg-ink-50 p-3 text-sm text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                  <p className="font-semibold">{item.user.fullName}</p>
                  <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-ink-200/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-ink-700 dark:bg-ink-900/75">
          <h3 className="font-title text-lg text-ink-900 dark:text-white">Profile Hub</h3>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">Cập nhật hồ sơ và quản lý nội dung cá nhân.</p>
          <Link
            to={ROUTES.profile('me')}
            className="mt-3 inline-flex rounded-xl bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700"
          >
            Đi tới Profile
          </Link>
        </section>
      </div>
    </aside>
  )
}
