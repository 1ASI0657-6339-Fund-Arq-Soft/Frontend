import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-analytics",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"],
})
export class AnalyticsComponent {
  chartData = [
    { date: "Ene", users: 400, appointments: 240 },
    { date: "Feb", users: 580, appointments: 290 },
    { date: "Mar", users: 720, appointments: 350 },
    { date: "Abr", users: 890, appointments: 420 },
  ]
}
