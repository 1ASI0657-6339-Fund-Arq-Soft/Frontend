import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LayoutComponent } from '../layout/layout.component'
import { NotificationsService } from '../../../core/services/notifications.service'
import { NotificationApiService } from '../../../core/services/notification-api.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Notification } from '../../../core/models/notification.model'
import type { NotificationDTO } from '../../../core/models/generated/notifications.types'
import type { User } from '../../../core/models/user.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-cuidador-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class CuidadorNotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = []
  familiares: User[] = []
  recipientId: string | null = null
  title = ''
  description = ''
  type: 'urgent' | 'info' | 'warning' | 'success' = 'info'
  private sub: Subscription | null = null
  error: string | null = null

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private notificationsApi: NotificationApiService,
  ) {}

  ngOnInit(): void {
    this.authService.getFamiliares().subscribe(list => this.familiares = list)

    const current = this.authService.getCurrentUser()
    if (current && current.id) {
      // try backend notifications for current user — if backend fails, set error and keep notifications empty
      this.notificationsApi.forUser(current.id).subscribe({
        next: (items: NotificationDTO[]) => this.notificationsService.setNotifications(items),
        error: (err: import('../../../core/models/api/api-error.model').ApiError) => {
          console.warn('Notifications API error', err)
          this.error = err?.message ?? 'Failed to load notifications from backend'
          this.notifications = []
        },
      })
    } else {
      // when there is no current user, there are no notifications to fetch
      this.notifications = []
    }

    // Always subscribe to the NotificationsService subject — the service will publish backend data via setNotifications
    this.sub = this.notificationsService.notifications$.subscribe((items: Notification[]) => {
      this.notifications = items
    })
  }

  getUserName(id?: string) {
    if (!id) return 'Todos'
    const u = this.familiares.find((f) => f.id === id)
    return u ? u.name : id
  }

  create() {
    if (!this.title || !this.description || !this.recipientId) return
    this.notificationsService.createNotification({ title: this.title, description: this.description, type: this.type, date: new Date().toLocaleString(), recipientId: this.recipientId, sender: this.authService.getCurrentUser()?.name })
    this.title = ''
    this.description = ''
    this.type = 'info'
    this.recipientId = null
  }

  markAsRead(id: string) {
    this.notificationsService.markAsRead(id)
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
