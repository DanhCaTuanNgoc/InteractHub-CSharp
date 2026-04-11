import type { ReactNode } from 'react'
import { NotificationDropdown } from './NotificationDropdown'

type NotificationBellProps = {
  triggerIcon?: ReactNode
}

export function NotificationBell({ triggerIcon }: NotificationBellProps) {
  return <NotificationDropdown triggerIcon={triggerIcon} />
}
