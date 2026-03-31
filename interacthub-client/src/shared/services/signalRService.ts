import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { getAccessToken } from '../auth/tokenStorage'

let notificationConnection: HubConnection | null = null

function buildHubUrl(): string {
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5191/api'
  return apiBase.replace('/api', '/hubs/notifications')
}

export async function connectNotificationHub(): Promise<HubConnection | null> {
  const token = getAccessToken()
  if (!token) {
    return null
  }

  if (notificationConnection && notificationConnection.state !== HubConnectionState.Disconnected) {
    return notificationConnection
  }

  notificationConnection = new HubConnectionBuilder()
    .withUrl(buildHubUrl(), {
      accessTokenFactory: () => getAccessToken() ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  await notificationConnection.start()
  return notificationConnection
}

export async function disconnectNotificationHub(): Promise<void> {
  if (!notificationConnection) {
    return
  }

  if (notificationConnection.state !== HubConnectionState.Disconnected) {
    await notificationConnection.stop()
  }

  notificationConnection = null
}
