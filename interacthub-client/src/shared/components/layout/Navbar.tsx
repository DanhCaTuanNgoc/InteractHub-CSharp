import { useState } from 'react'
import { Clapperboard, Compass, House, Menu, Shield, UserRound, UserRoundPlus, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../features/auth/hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { Button } from '../common/Button'
import { NotificationDropdown } from '../notifications/NotificationDropdown'

const navItems = [
  { to: ROUTES.home, label: 'Trang chủ', icon: House },
  { to: ROUTES.explore, label: 'Khám phá', icon: Compass },
  { to: ROUTES.friendRequests, label: 'Lời mời kết bạn', icon: UserRoundPlus },
  { to: ROUTES.stories, label: 'Stories', icon: Clapperboard },
  { to: ROUTES.admin, label: 'Admin', icon: Shield },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout, hasRole } = useAuth()

  const visibleNavItems = navItems.filter((item) => item.to !== ROUTES.admin || hasRole('Admin'))

  return (
    <header className="relative border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1450px] flex-wrap items-center gap-3 px-3 py-3 sm:px-5 lg:px-8 md:flex-nowrap md:gap-4">
        <Link to={ROUTES.home} className="inline-flex items-center gap-2 text-sm sm:text-base" aria-label="InteractHub home">
          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]" />
          <span className="grid leading-tight">
            <strong className="text-base text-slate-900">InteractHub</strong>
            <small className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Social space</small>
          </span>
        </Link>

        <button
          type="button"
          className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          <span>Menu</span>
        </button>

        <nav id="primary-nav" className={[
          'flex w-full flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-2 md:w-auto md:rounded-full',
          open ? 'block' : 'hidden md:flex',
        ].join(' ')} aria-label="Main navigation">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              end={item.to === ROUTES.home}
              className={({ isActive }: { isActive: boolean }) =>
                isActive
                  ? 'inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm'
                  : 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900'
              }
            >
              <item.icon size={16} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to={ROUTES.profile(user?.id ?? 'me')}
            onClick={() => setOpen(false)}
            className={({ isActive }: { isActive: boolean }) =>
              isActive
                ? 'inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm'
                : 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900'
            }
          >
            <UserRound size={16} aria-hidden="true" />
            <span>Cá nhân</span>
          </NavLink>
        </nav>

        <div className="flex w-full justify-end md:ml-auto md:w-auto">
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 sm:inline-flex" aria-label="Current user">
            <UserRound size={14} aria-hidden="true" />
            <span>{user?.fullName ?? user?.username ?? 'Member'}</span>
          </div>
          <NotificationDropdown />
          <Button
            type="button"
            variant="ghost"
            onClick={logout}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  )
}
