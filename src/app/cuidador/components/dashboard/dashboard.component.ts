import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"
import { AuthService } from "../../../core/services/auth.service"
import { User } from "../../../core/models/user.model"
import { Router } from "@angular/router"

@Component({
  selector: "app-cuidador-dashboard",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
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

  tasksTodo = 5
  patientsAssigned = 3
  tasksCompleted = 12

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }
}
