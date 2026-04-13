import { Clapperboard, Compass, Home, PlusSquare, Shield, User, UserRoundPlus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

type MainSidebarProps = {
  onCreatePost: () => void
  showAdmin: boolean
}

const navItems = [
  { to: ROUTES.home, label: 'Trang chủ', icon: Home },
  { to: ROUTES.explore, label: 'Khám phá', icon: Compass },
  { to: ROUTES.friendRequests, label: 'Lời mời kết bạn', icon: UserRoundPlus },
  { to: ROUTES.stories, label: 'Stories', icon: Clapperboard },
  { to: ROUTES.profile('me'), label: 'Hồ sơ', icon: User },
]

export function MainSidebar({ onCreatePost, showAdmin }: MainSidebarProps) {
  const allNavItems = showAdmin
    ? [...navItems, { to: ROUTES.admin, label: 'Admin', icon: Shield }]
    : navItems

  return (
    <>
      <aside className="hidden xl:block">
        <div className="fixed top-24 z-40 w-[250px] max-h-[calc(100vh-7rem)] overflow-y-auto space-y-5 rounded-3xl border border-ink-200/70 bg-white/65 p-5 shadow-soft backdrop-blur-xl xl:left-[max(1.25rem,calc(50%-490px))] 2xl:left-[max(1.25rem,calc(50%-725px))] dark:border-ink-700 dark:bg-ink-900/75">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">InteractHub</p>
            <h1 className="mt-2 font-title text-2xl text-ink-900 dark:text-white">Social Studio</h1>
          </div>

          <nav className="space-y-1">
            {allNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.home}
                className={({ isActive }) =>
                  isActive
                    ? 'flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 dark:bg-ink-100 dark:text-brand-300'
                    : 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-600'
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <nav className="fixed bottom-3 left-1/2 z-40 flex w-[min(96vw,620px)] -translate-x-1/2 items-center justify-between rounded-2xl border border-ink-200/80 bg-white/88 px-2 py-1 shadow-soft-xl backdrop-blur-xl xl:hidden dark:border-ink-700 dark:bg-ink-900/88">
        {allNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.home}
            className={({ isActive }) =>
              isActive
                ? 'inline-flex min-w-[56px] flex-col items-center gap-1 rounded-xl bg-brand-50 px-2 py-2 text-[11px] font-semibold text-brand-700 dark:bg-ink-800 dark:text-brand-300'
                : 'inline-flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
            }
          >
            <item.icon size={15} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
