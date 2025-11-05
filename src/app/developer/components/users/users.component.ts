import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-users",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"],
})
export class UsersComponent {
  users = [
    {
      id: 1,
      name: "Juan Familiar",
      email: "familiar@test.com",
      role: "Familiar",
      status: "Activo",
      joinDate: "2025-01-01",
    },
    {
      id: 2,
      name: "María Cuidadora",
      email: "cuidador@test.com",
      role: "Cuidador",
      status: "Activo",
      joinDate: "2025-01-02",
    },
    {
      id: 3,
      name: "Carlos García",
      email: "carlos@test.com",
      role: "Familiar",
      status: "Inactivo",
      joinDate: "2024-12-15",
    },
  ]
}
