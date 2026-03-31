import { useCallback, useEffect, useMemo, useState } from 'react'
import { connectNotificationHub, disconnectNotificationHub } from '../../../shared/services/signalRService'
import { notificationService } from '../../../shared/services/notificationService'
import type { Notification } from '../../../shared/types/notification'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => (item.isRead ? count : count + 1), 0),
    [notifications],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notificationService.getAll()
      setNotifications(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead()
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
  }, [])

  useEffect(() => {
    let mounted = true

    const start = async () => {
      await load()
      const connection = await connectNotificationHub()

      if (!mounted || !connection) {
        return
      }

      connection.on('ReceiveNotification', (payload: Notification) => {
        setNotifications((current) => [payload, ...current])
      })
    }

    void start()

    return () => {
      mounted = false
      void disconnectNotificationHub()
    }
  }, [load])

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
  }
}
