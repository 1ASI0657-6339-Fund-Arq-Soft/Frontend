import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LayoutComponent } from "../layout/layout.component";
import { AuthService } from "../../../core/services/auth.service";
import { User } from "../../../core/models/user.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-developer-dashboard",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DeveloperDashboardComponent implements OnInit {
  currentUser: User | null = null;

  systemMetrics = {
    uptime: "99.8%",
    users: 1250,
    activeUsers: 325,
    apiCalls: 45230,
  };

  recentActivity = [
    { timestamp: "2025-01-04 10:32", action: "Usuario registrado", detail: "Juan Pérez" },
    { timestamp: "2025-01-04 09:15", action: "Cita creada", detail: "Carlos García - Dr. López" },
    { timestamp: "2025-01-04 08:45", action: "Medicamento actualizado", detail: "Maria López" },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
