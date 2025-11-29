export type NotificationType = 'urgent' | 'info' | 'warning' | 'success'

export interface Notification {
  id: string
  title: string
  description: string
  type: NotificationType
  date: string // human readable date or period
  read?: boolean
  status?: 'read' | 'unread' | 'archived'
  createdAt?: string
  sender?: string
  recipientId?: string // id del usuario destinatario (familiar)
}
