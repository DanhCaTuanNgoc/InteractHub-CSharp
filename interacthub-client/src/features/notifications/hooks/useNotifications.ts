import { useCallback, useEffect, useMemo, useState } from 'react'
import { connectNotificationHub, disconnectNotificationHub } from '../../../shared/services/signalRService'
import { notificationService } from '../../../shared/services/notificationService'
import type { Notification } from '../../../shared/types/notification'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => (item.isRead ? count : count + 1), 0),
    [notifications],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await notificationService.getAll()
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông báo.')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setMarkingAllRead(true)
    setError(null)

    try {
      await notificationService.markAllRead()
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đánh dấu đã đọc.')
    } finally {
      setMarkingAllRead(false)
    }
  }, [])

  const markRead = useCallback(async (notificationId: string) => {
    setError(null)
    try {
      await notificationService.markRead(notificationId)
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật thông báo.')
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const start = async () => {
      try {
        await load()
        const connection = await connectNotificationHub()

        if (!mounted || !connection) {
          return
        }

        connection.on('ReceiveNotification', (payload: Notification) => {
          setNotifications((current) => [payload, ...current])
        })
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể kết nối thông báo thời gian thực.')
        }
      }
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
    markingAllRead,
    error,
    reload: load,
    markRead,
    markAllRead,
  }
}
