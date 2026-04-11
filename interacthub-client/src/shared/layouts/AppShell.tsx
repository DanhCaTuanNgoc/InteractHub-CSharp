import { Bell, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { NotificationBell } from '../components/notifications/NotificationBell'
import { MainSidebar } from '../components/layout/MainSidebar'
import { RightPanel } from '../components/layout/RightPanel'
import { useState } from 'react'
import { CreatePostModal } from '../components/feed/CreatePostModal'
import { useInfinitePosts } from '../../features/posts/hooks/useInfinitePosts'
import { ROUTES } from '../constants/routes'

export function AppShell() {
  const location = useLocation()
  const { user, logout, hasRole } = useAuth()
  const [openCreatePost, setOpenCreatePost] = useState(false)
  const { createPost } = useInfinitePosts()

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-4 pb-24 sm:px-5 lg:px-8 xl:pb-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-soft opacity-70 dark:opacity-25" />

      <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-[1450px] -translate-x-1/2 rounded-3xl border border-ink-200/70 bg-white/75 p-3 shadow-soft backdrop-blur-xl sm:w-[calc(100%-2.5rem)] lg:w-[calc(100%-4rem)] dark:border-ink-700 dark:bg-ink-900/80">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.home} className="inline-flex items-center gap-2 rounded-2xl px-2 py-1 transition hover:bg-ink-100/80 dark:hover:bg-ink-800">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(15,118,110,0.18)]" />
            <h1 className="font-title text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">InteractHub</h1>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to={ROUTES.profile(user?.id ?? 'me')}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-ink-200/70 bg-white/70 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-ink-700 dark:bg-ink-900/80"
              aria-label="Go to profile"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="text-sm font-semibold text-ink-700 dark:text-ink-100">
                  {(user?.fullName ?? user?.username ?? 'U').slice(0, 1).toUpperCase()}
                </span>
              )}
            </Link>

            {/* <ThemeToggle isDark={isDark} onToggle={toggleTheme} /> */}
            <NotificationBell triggerIcon={<Bell size={16} />} />
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-ink-200/70 bg-white/70 text-ink-700 transition hover:bg-red-50 hover:text-red-600 dark:border-ink-700 dark:bg-ink-900/75 dark:text-ink-200 dark:hover:bg-red-900/20"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1450px] grid-cols-1 gap-4 pt-20 xl:max-w-[980px] xl:grid-cols-[250px_minmax(0,680px)] xl:justify-center 2xl:max-w-[1450px] 2xl:grid-cols-[250px_minmax(0,680px)_320px]">
        <MainSidebar onCreatePost={() => setOpenCreatePost(true)} showAdmin={hasRole('Admin')} />

        <div className="min-w-0 w-full max-w-[760px] mx-auto xl:max-w-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        <RightPanel />
      </main>

      <CreatePostModal
        open={openCreatePost}
        busy={createPost.isPending}
        onClose={() => setOpenCreatePost(false)}
        onSubmitPost={async (content, imageUrl) => {
          await createPost.mutateAsync({ content, imageUrl })
        }}
      />
    </div>
  )
}
