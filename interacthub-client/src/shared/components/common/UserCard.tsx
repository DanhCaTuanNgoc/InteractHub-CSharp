import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import type { UserSummary } from '../../types/user'
import { Avatar } from './Avatar'

type UserCardProps = {
  user: UserSummary
  action?: ReactNode
}

export function UserCard({ user, action }: UserCardProps) {
  return (
    <article className="user-card">
      <div className="user-card__header">
        <Link to={ROUTES.profile(user.id)} className="user-card__identity-link" aria-label={`Xem hồ sơ của ${user.fullName}`}>
          <Avatar src={user.avatarUrl} alt={user.fullName} />
          <div>
            <h3>{user.fullName}</h3>
            <p>@{user.userName}</p>
          </div>
        </Link>
      </div>
      <small>{user.email}</small>
      {action ? <div className="mt-2">{action}</div> : null}
    </article>
  )
}
