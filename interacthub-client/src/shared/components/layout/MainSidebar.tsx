import { Clapperboard, Compass, Home, Shield, User, UserRoundPlus } from 'lucide-react'
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

export function MainSidebar({ showAdmin }: MainSidebarProps) {
  const allNavItems = showAdmin
    ? [...navItems, { to: ROUTES.admin, label: 'Admin', icon: Shield }]
    : navItems

  return (
    <>
      <aside className="hidden xl:block">
        <div className="fixed top-24 z-40 w-[250px] max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-xl backdrop-blur-xl xl:left-[max(1.25rem,calc(50%-490px))] 2xl:left-[max(1.25rem,calc(50%-725px))]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">InteractHub</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Social Studio</h1>
          </div>

          <nav className="space-y-1">
            {allNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.home}
                className={({ isActive }) =>
                  isActive
                    ? 'relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-50 via-white to-amber-50 px-4 py-3 text-sm font-semibold text-cyan-900 ring-1 ring-cyan-300 shadow-sm before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r-full before:bg-cyan-500'
                    : 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <nav className="fixed bottom-3 left-1/2 z-40 flex w-[min(96vw,620px)] -translate-x-1/2 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-2 py-1 shadow-xl backdrop-blur-xl xl:hidden">
        {allNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.home}
            className={({ isActive }) =>
              isActive
                ? 'relative inline-flex min-w-[56px] flex-col items-center gap-1 rounded-xl bg-gradient-to-b from-cyan-50 to-white px-2 py-2 text-[11px] font-semibold text-cyan-800 ring-1 ring-cyan-300 shadow-sm before:absolute before:bottom-1 before:left-1/2 before:h-0.5 before:w-8 before:-translate-x-1/2 before:rounded-full before:bg-cyan-500'
                : 'inline-flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
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
