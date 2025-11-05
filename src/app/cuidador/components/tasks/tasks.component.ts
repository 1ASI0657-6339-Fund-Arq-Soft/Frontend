import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-tasks",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./tasks.component.html",
  styleUrls: ["./tasks.component.css"],
})
export class TasksComponent {
  tasks = [
    {
      id: 1,
      title: "Administrar Medicamento",
      patient: "Carlos García",
      time: "10:00 AM",
      priority: "Alta",
      completed: false,
    },
    {
      id: 2,
      title: "Cambio de Vendaje",
      patient: "Maria López",
      time: "11:30 AM",
      priority: "Media",
      completed: false,
    },
    {
      id: 3,
      title: "Toma de Signos Vitales",
      patient: "Juan Pérez",
      time: "2:00 PM",
      priority: "Media",
      completed: true,
    },
  ]

  completeTask(taskId: number): void {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.completed = !task.completed
    }
  }
}
