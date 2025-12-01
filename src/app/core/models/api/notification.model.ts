export interface Notification {
  id?: string
  message?: string
  userId?: string
  status?: 'read' | 'unread' | 'archived' | string
  createdAt?: string
}
