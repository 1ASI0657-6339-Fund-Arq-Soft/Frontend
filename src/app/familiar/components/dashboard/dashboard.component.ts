import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"
import { AuthService } from "../../../core/services/auth.service"
import { User } from "../../../core/models/user.model"
import { Router } from "@angular/router"

@Component({
  selector: "app-familiar-dashboard",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null
  upcomingAppointments = [
    { id: 1, title: "Consulta Médica", date: "2025-01-15", time: "10:00 AM", doctor: "Dr. Juan Pérez" },
    { id: 2, title: "Terapia Física", date: "2025-01-18", time: "2:00 PM", doctor: "Lic. María González" },
  ]

  recentNotifications = [
    { id: 1, title: "Medicamento Tomado", message: "Se administró medicamento a las 8:30 AM", type: "success" },
    {
      id: 2,
      title: "Recordatorio Importante",
      message: "No olvidar la cita de mañana a las 10:00 AM",
      type: "warning",
    },
  ]

  residentInfo = {
    name: "Carlos García López",
    age: 78,
    healthStatus: "Estable",
    lastCheckup: "2025-01-10",
    conditions: ["Hipertensión", "Diabetes Tipo 2"],
  }

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
