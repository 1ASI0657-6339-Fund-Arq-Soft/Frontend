import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-system",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./system.component.html",
  styleUrls: ["./system.component.css"],
})
export class SystemComponent {}
