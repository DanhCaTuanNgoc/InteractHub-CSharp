import { useCallback, useEffect, useMemo, useState } from 'react'
import { notificationService } from '../../../shared/services/notificationService'
import type { Notification } from '../../../shared/types/notification'
import { useNotificationSignalR } from './useNotificationSignalR'

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

  const appendNotification = useCallback((payload: Notification) => {
    setNotifications((current) => {
      const unique = current.filter((item) => item.id !== payload.id)
      return [payload, ...unique]
    })
  }, [])

  useNotificationSignalR({
    onNotification: appendNotification,
    onError: (message) => setError(message),
  })

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const handleRefresh = () => {
      void load()
    }

    window.addEventListener('notifications:refresh', handleRefresh)
    return () => window.removeEventListener('notifications:refresh', handleRefresh)
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
