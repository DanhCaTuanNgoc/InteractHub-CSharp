import { Bell, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { NotificationDropdown } from '../components/notifications/NotificationDropdown'
import { MainSidebar } from '../components/layout/MainSidebar'
import { RightPanel } from '../components/layout/RightPanel'
import { useState } from 'react'
import { CreatePostModal } from '../components/feed/CreatePostModal'
import { useInfinitePosts } from '../../features/posts/hooks/useInfinitePosts'
import { ROUTES } from '../constants/routes'
import { LazyImage } from '../components/common/LazyImage'

export function AppShell() {
  const location = useLocation()
  const { user, logout, hasRole } = useAuth()
  const [openCreatePost, setOpenCreatePost] = useState(false)
  const { createPost } = useInfinitePosts()

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-4 pb-24 sm:px-5 lg:px-8 xl:pb-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-soft opacity-80" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_32%)] opacity-70" />

      <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-[1450px] -translate-x-1/2 rounded-3xl border border-slate-200/70 bg-white/75 p-3 shadow-xl backdrop-blur-xl sm:w-[calc(100%-2.5rem)] lg:w-[calc(100%-4rem)]">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.home} className="inline-flex items-center gap-2 rounded-2xl px-2 py-1 transition hover:bg-slate-100/80">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(34,211,238,0.18)]" />
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">InteractHub</h1>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to={ROUTES.profile(user?.id ?? 'me')}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-1.5 pr-3 transition hover:-translate-y-0.5 hover:shadow-lg"
              aria-label="Go to profile"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                {user?.avatarUrl ? (
                  <LazyImage src={user.avatarUrl} alt={user.fullName} wrapperClassName="h-full w-full" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-slate-700">
                    {(user?.fullName ?? user?.username ?? 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="max-w-[200px] truncate text-sm font-semibold text-slate-700">
                {user?.fullName ?? 'User'}
              </span>
            </Link>

            {/* <ThemeToggle isDark={isDark} onToggle={toggleTheme} /> */}
            <NotificationDropdown triggerIcon={<Bell size={16} />} />
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/70 text-slate-700 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
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
