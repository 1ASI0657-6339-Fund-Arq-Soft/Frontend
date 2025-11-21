import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { LayoutComponent } from "../layout/layout.component"
import { AuthService } from "../../../core/services/auth.service"
import { User } from "../../../core/models/user.model"
import { Router } from "@angular/router"
import { NotificationsService } from "../../../core/services/notifications.service"

@Component({
  selector: "app-cuidador-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null

  patients = [
    { id: 1, name: "Carlos García", status: "Bien", lastCheck: "10:30 AM" },
    { id: 2, name: "Maria López", status: "Bien", lastCheck: "09:15 AM" },
    { id: 3, name: "Juan Pérez", status: "Requiere atención", lastCheck: "11:00 AM" },
  ]

  patientsAssigned = 3

  // form fields for creating notification
  notifTitle = ''
  notifDesc = ''
  notifType: 'urgent' | 'info' | 'warning' | 'success' = 'info'

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
    console.log('[Dashboard Cuidador] initialized, user=', this.currentUser)
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  createNotification() {
    if (!this.notifTitle || !this.notifDesc) return

    console.log('[Dashboard Cuidador] creating notification', this.notifTitle, this.notifType)

    this.notificationsService.createNotification({
      title: this.notifTitle,
      description: this.notifDesc,
      type: this.notifType,
      date: new Date().toLocaleString(),
      sender: this.currentUser?.name,
    })

    // clear form
    this.notifTitle = ''
    this.notifDesc = ''
    this.notifType = 'info'
  }
}
