import { Component, OnDestroy, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"
import { NotificationsService } from "../../../core/services/notifications.service"
import { NotificationApiService } from '../../../core/services/notification-api.service'
import { API_CONFIG } from '../../../core/config/api-config'
import { AuthService } from "../../../core/services/auth.service"
import type { Notification } from "../../../core/models/notification.model"
import type { NotificationDTO } from "../../../core/models/generated/notifications.types"
import { BehaviorSubject, combineLatest, map, Observable, Subscription } from "rxjs"

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.css"],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = []
  paymentHistory = [
    { period: "Oct, 2025", amount: "S/. 1,200.00", status: "Pagado", concept: "Cuidado Mensual + Servicios" },
    { period: "Nov, 2025", amount: "S/. 1,200.00", status: "Pagado", concept: "Cuidado Mensual + Servicios" },
    { period: "Dic, 2025", amount: "S/. 1,200.00", status: "Pagado", concept: "Cuidado Mensual + Servicios" },
  ]

  currentFilter: BehaviorSubject<'all' | 'read' | 'unread' | 'archived'> = new BehaviorSubject<'all' | 'read' | 'unread' | 'archived'>('all')
  filteredNotifications: Observable<Notification[]>

  private sub: Subscription | null = null
  private backendSub: Subscription | null = null

  constructor(private notificationsService: NotificationsService, private authService: AuthService, private notificationApi: NotificationApiService) {
    console.log('[NotificationsComponent] constructor')

    this.filteredNotifications = combineLatest([
      this.notificationsService.notifications$,
      this.currentFilter,
      this.authService.currentUser$,
    ]).pipe(
      map(([notifications, filter, currentUser]) => {
        if (!currentUser) {
          return []
        }
        return notifications
          .filter((n) => n.recipientId === currentUser.id)
          .map((n) => ({
            ...n,
            status: n.status || (n.read ? 'read' : 'unread'), // Ensure status is set
          }))
          .filter((n) => {
            if (filter === 'all') {
              return n.status !== 'archived'
            }
            return n.status === filter
          })
      })
    )
  }

  ngOnInit(): void {
    console.log('[NotificationsComponent] ngOnInit - subscribing to filtered notifications')
    // If backend is enabled, fetch user notifications from API
    if (API_CONFIG.useBackendServices) {
      this.backendSub = this.authService.currentUser$.subscribe((u) => {
        if (u && u.id) {
          this.notificationApi.forUser(u.id).subscribe({ next: (items: NotificationDTO[]) => this.notificationsService.setNotifications(items), error: (e: any) => console.warn('Failed to load backend notifications', e) })
        }
      })
    }
    this.sub = this.filteredNotifications.subscribe((items: Notification[]) => {
      this.notifications = items
      console.log('[NotificationsComponent] received filtered notifications', this.notifications)
    })
  }

  applyFilter(filter: 'all' | 'read' | 'unread' | 'archived'): void {
    this.currentFilter.next(filter)
  }

  markAsRead(id: string): void {
    console.log('[NotificationsComponent] markAsRead', id)
    this.notificationsService.updateNotificationStatus(id, 'read')
  }

  markAsUnread(id: string): void {
    console.log('[NotificationsComponent] markAsUnread', id)
    this.notificationsService.updateNotificationStatus(id, 'unread')
  }

  archiveNotification(id: string): void {
    console.log('[NotificationsComponent] archiveNotification', id)
    this.notificationsService.updateNotificationStatus(id, 'archived')
  }

  deleteNotification(id: string): void {
    console.log('[NotificationsComponent] deleteNotification', id)
    this.notificationsService.deleteNotification(id)
  }

  clearAll(): void {
    console.log('[NotificationsComponent] clearAll')
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return
    this.notificationsService.removeForRecipient(currentUser.id)
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
    this.backendSub?.unsubscribe()
    this.currentFilter.complete()
  }
}
