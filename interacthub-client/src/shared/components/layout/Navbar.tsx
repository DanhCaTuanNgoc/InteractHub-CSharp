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
    <header className="navbar relative">
      <div className="navbar__inner flex-wrap gap-3 md:flex-nowrap md:gap-4">
        <Link to={ROUTES.home} className="navbar__brand text-sm sm:text-base" aria-label="InteractHub home">
          <span className="navbar__dot" />
          <span className="navbar__brand-text">
            <strong>InteractHub</strong>
            <small>Social space</small>
          </span>
        </Link>

        <button
          type="button"
          className="navbar__menu-btn ml-auto md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          <span>Menu</span>
        </button>

        <nav
          id="primary-nav"
          className={open ? 'navbar__links navbar__links--open w-full md:w-auto' : 'navbar__links w-full md:w-auto'}
          aria-label="Main navigation"
        >
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              end={item.to === ROUTES.home}
              className={({ isActive }: { isActive: boolean }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
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
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            <UserRound size={16} aria-hidden="true" />
            <span>Cá nhân</span>
          </NavLink>
        </nav>

        <div className="navbar__actions w-full justify-end md:ml-auto md:w-auto">
          <div className="navbar__user-pill hidden sm:inline-flex" aria-label="Current user">
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
