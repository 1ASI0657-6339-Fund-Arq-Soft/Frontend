import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-doctor-layout",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./layout.component.html",
  styleUrl: "./layout.component.css"
})
export class LayoutComponent {
  sidebarOpen = false;
  currentUser = { name: "Doctor" };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
