import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../features/auth/hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { Button } from '../common/Button'
import { NotificationBell } from '../notifications/NotificationBell'

const navItems = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.explore, label: 'Explore' },
  { to: ROUTES.stories, label: 'Stories' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to={ROUTES.home} className="navbar__brand" aria-label="InteractHub home">
          <span className="navbar__dot" />
          InteractHub
        </Link>

        <button type="button" className="navbar__menu-btn" onClick={() => setOpen((current) => !current)}>
          Menu
        </button>

        <nav className={open ? 'navbar__links navbar__links--open' : 'navbar__links'} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              end={item.to === ROUTES.home}
              className={({ isActive }: { isActive: boolean }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to={ROUTES.profile(user?.id ?? 'me')}
            onClick={() => setOpen(false)}
            className={({ isActive }: { isActive: boolean }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            Profile
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <NotificationBell />
          <Button type="button" variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
