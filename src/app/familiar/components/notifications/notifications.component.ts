import { Component, OnDestroy, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"
import { NotificationsService } from "../../../core/services/notifications.service"
import { AuthService } from "../../../core/services/auth.service"
import type { Notification } from "../../../core/models/notification.model"
import { Subscription } from "rxjs"

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

  private sub: Subscription | null = null

  constructor(private notificationsService: NotificationsService, private authService: AuthService) {
    console.log('[NotificationsComponent] constructor')
  }

  ngOnInit(): void {
    console.log('[NotificationsComponent] ngOnInit - subscribing to notifications')
    const currentUser = this.authService.getCurrentUser()
    this.sub = this.notificationsService.notifications$.subscribe((items) => {
      // show only notifications for this familiar
      if (currentUser) {
        this.notifications = items.filter((n) => n.recipientId === currentUser.id)
      } else {
        this.notifications = []
      }
      console.log('[NotificationsComponent] received notifications', this.notifications)
    })
  }

  markAsRead(id: string) {
    console.log('[NotificationsComponent] markAsRead', id)
    this.notificationsService.markAsRead(id)
  }

  clearAll() {
    console.log('[NotificationsComponent] clearAll')
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) return
    this.notificationsService.removeForRecipient(currentUser.id)
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
