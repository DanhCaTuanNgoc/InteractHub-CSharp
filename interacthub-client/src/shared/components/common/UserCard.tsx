import type { UserSummary } from '../../types/user'
import { Avatar } from './Avatar'

type UserCardProps = {
  user: UserSummary
}

export function UserCard({ user }: UserCardProps) {
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
    </article>
  )
}
