import { useEffect } from 'react'
import { connectNotificationHub, disconnectNotificationHub } from '../../../shared/services/signalRService'
import type { Notification } from '../../../shared/types/notification'

type UseNotificationSignalROptions = {
  enabled?: boolean
  onNotification: (notification: Notification) => void
  onError?: (message: string) => void
}

export function useNotificationSignalR({
  enabled = true,
  onNotification,
  onError,
}: UseNotificationSignalROptions) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    let mounted = true

    const handleReceive = (payload: Notification) => {
      onNotification(payload)
    }

    const start = async () => {
      try {
        const connection = await connectNotificationHub()

        if (!mounted || !connection) {
          return
        }

        connection.off('ReceiveNotification', handleReceive)
        connection.on('ReceiveNotification', handleReceive)
      } catch (err) {
        if (mounted) {
          onError?.(err instanceof Error ? err.message : 'Unable to connect to real-time notifications.')
        }
      }
    }

    void start()

    return () => {
      mounted = false
      void disconnectNotificationHub()
    }
  }, [enabled, onError, onNotification])
}
