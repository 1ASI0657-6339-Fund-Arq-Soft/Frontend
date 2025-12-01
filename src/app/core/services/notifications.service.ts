import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { NotificationApiService } from './notification-api.service'
import { API_CONFIG } from '../config/api-config'
import type { Notification } from '../models/notification.model'
import type { NotificationDTO } from '../models/generated/notifications.types'

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([])
  public notifications$ = this.notificationsSubject.asObservable()

  constructor(private notificationApi: NotificationApiService) {
    this.loadFromStorage()
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value
  }

  createNotification(payload: Omit<Notification, 'id' | 'createdAt' | 'read' | 'status'>): Notification {
    const notif: Notification = {
      id: this.generateId(),
      ...payload,
      status: 'unread', // Default status for new notifications
      createdAt: new Date().toISOString(),
    }

    const current = [notif, ...this.notificationsSubject.value]
    this.notificationsSubject.next(current)
    this.saveToStorage(current)

    // If backend available, try to create in remote notifications service as well (fire-and-forget)
    if (API_CONFIG.useBackendServices) {
      const dto: Partial<NotificationDTO> = { message: `${payload.title || ''} ${payload.description || ''}`.trim(), userId: payload.recipientId ?? undefined }
      this.notificationApi.create(dto as any).subscribe({ next: (res) => console.debug('Notification created in backend', res), error: (e) => console.warn('Notifications API create failed:', e) })
    }

    return notif
  }

  updateNotificationStatus(notificationId: string, newStatus: 'read' | 'unread' | 'archived'): void {
    const updated = this.notificationsSubject.value.map((n) =>
      n.id === notificationId
        ? { ...n, status: newStatus, read: newStatus === 'read' }
        : n,
    )
    this.notificationsSubject.next(updated)
    this.saveToStorage(updated)

    if (API_CONFIG.useBackendServices) {
      if (newStatus === 'read') {
        this.notificationApi.markAsRead(notificationId).subscribe({ next: () => undefined, error: (e) => console.warn('Mark as read failed', e) })
      } else if (newStatus === 'archived') {
        this.notificationApi.archive(notificationId).subscribe({ next: () => undefined, error: (e) => console.warn('Archive failed', e) })
      }
    }
  }

  deleteNotification(notificationId: string): void {
    const remaining = this.notificationsSubject.value.filter(
      (n) => n.id !== notificationId,
    )
    this.notificationsSubject.next(remaining)
    this.saveToStorage(remaining)

    if (API_CONFIG.useBackendServices) {
      this.notificationApi.delete(notificationId).subscribe({ next: () => undefined, error: (e) => console.warn('Notification delete failed', e) })
    }
  }

  markAsRead(notificationId: string): void {
    this.updateNotificationStatus(notificationId, 'read')
  }

  removeForRecipient(recipientId: string): void {
    const remaining = this.notificationsSubject.value.filter(
      (n) => n.recipientId !== recipientId,
    )
    this.notificationsSubject.next(remaining)
    this.saveToStorage(remaining)

    // Backend doesn't expose bulk removal in OpenAPI, skip.
  }

  clearAll(): void {
    this.notificationsSubject.next([])
    localStorage.removeItem('notifications')
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter((n) => n.status === 'unread').length
  }

  private saveToStorage(items: Notification[]) {
    try {
      localStorage.setItem('notifications', JSON.stringify(items))
    } catch (e) {
      console.error('Error saving notifications:', e)
    }
  }

  private loadFromStorage() {
    if (API_CONFIG.useBackendServices) {
      this.notificationApi.getAll().subscribe({
        next: (items) => {
          this.setNotifications(items) // Use setNotifications to map DTOs and save to storage
        },
        error: (e) => {
          console.warn('Failed to load notifications from backend, falling back to local storage/seed.', e)
          this.loadLocalNotifications()
        }
      })
    } else {
      this.loadLocalNotifications()
    }
  }

  private loadLocalNotifications() {
    try {
      const raw = localStorage.getItem('notifications')
      if (raw) {
        const parsed = JSON.parse(raw) as Notification[]
        const withStatus = parsed.map(n => ({
          ...n,
          status: n.status || (n.read ? 'read' : 'unread')
        }));
        this.notificationsSubject.next(withStatus)
      } else {
        // No local seed data. Prefer backend-only flows. If there is cached data in localStorage it would
        // have been handled above; otherwise keep the list empty so UI shows no mock notifications.
        this.notificationsSubject.next([])
      }
    } catch (e) {
      console.error('Error loading local notifications:', e)
      this.notificationsSubject.next([])
    }
  }

  // Allow externally setting the full notifications list (e.g. from backend query)
  public setNotifications(items: NotificationDTO[]) {
    const mapped: Notification[] = items.map((i) => ({
      id: i.id ?? this.generateId(),
      title: 'Notification', // Default title
      description: i.message || '', // Map DTO message to description
      type: 'info', // Default type
      date: i.createdAt ? new Date(i.createdAt).toLocaleString() : new Date().toLocaleString(), // Derive date from createdAt
      recipientId: i.userId, // Map DTO userId to recipientId
      status: (i.status as 'read' | 'unread' | 'archived') || 'unread', // Ensure status is a valid type
      createdAt: i.createdAt,
    }))
    this.notificationsSubject.next(mapped)
    this.saveToStorage(mapped)
  }

  private generateId(): string {
    // simple unique id based on timestamp + random
    return 'n_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
  }
}
