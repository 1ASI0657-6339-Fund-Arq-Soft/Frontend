import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import type { Notification } from '../models/notification.model'

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([])
  public notifications$ = this.notificationsSubject.asObservable()

  constructor() {
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
  }

  deleteNotification(notificationId: string): void {
    const remaining = this.notificationsSubject.value.filter(
      (n) => n.id !== notificationId,
    )
    this.notificationsSubject.next(remaining)
    this.saveToStorage(remaining)
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
    try {
      const raw = localStorage.getItem('notifications')
      if (raw) {
        const parsed = JSON.parse(raw) as Notification[]
        // Ensure all loaded notifications have a 'status' property
        const withStatus = parsed.map(n => ({
          ...n,
          status: n.status || (n.read ? 'read' : 'unread') // Derive status from 'read' if not present
        }));
        this.notificationsSubject.next(withStatus)
      } else {
        // seed with example notifications to aid development / testing
        const seed: Notification[] = [
          {
            id: this.generateId(),
            title: 'Cita programada',
            description: 'Tiene una cita programada para el 20 de Noviembre',
            type: 'info',
            date: new Date().toLocaleString(),
            status: 'unread',
            createdAt: new Date().toISOString(),
            sender: 'Sistema',
          },
          {
            id: this.generateId(),
            title: 'Medicamento urgente',
            description: 'Recordatorio: administrar medicamento a las 18:00',
            type: 'urgent',
            date: new Date().toLocaleString(),
            status: 'unread',
            createdAt: new Date().toISOString(),
            sender: 'Cuidador',
          },
        ]
        this.notificationsSubject.next(seed)
        this.saveToStorage(seed)
      }
    } catch (e) {
      console.error('Error loading notifications:', e)
      this.notificationsSubject.next([])
    }
  }

  private generateId(): string {
    // simple unique id based on timestamp + random
    return 'n_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
  }
}
