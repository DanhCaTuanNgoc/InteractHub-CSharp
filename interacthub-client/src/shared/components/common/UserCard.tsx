import type { ReactNode } from 'react'
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
        <Avatar src={user.avatarUrl} alt={user.fullName} />
        <div>
          <h3>{user.fullName}</h3>
          <p>@{user.userName}</p>
        </div>
      </div>
      <small>{user.email}</small>
      {action ? <div className="mt-2">{action}</div> : null}
    </article>
  )
}
