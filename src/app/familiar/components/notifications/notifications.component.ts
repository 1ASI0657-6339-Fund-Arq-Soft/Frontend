import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.css"],
})
export class NotificationsComponent {
  notifications = [
    {
      id: 1,
      title: "Cita Próxima de Realización-Urgente",
      description: "Cirugía de Cataratas lo más pronto posible dentro de 10 dias",
      type: "urgent",
      date: "Oct, 2025",
    },
    {
      id: 2,
      title: "Día Completado-Cardiología",
      description: "Se completó la cita con el cardiólogo y recibió recomendaciones",
      type: "info",
      date: "Nov, 2025",
    },
    {
      id: 3,
      title: "Importante en su Medicamento",
      description: "Importante no olvidar tomar su medicamento a las horas indicadas",
      type: "warning",
      date: "Dic, 2025",
    },
  ]

  paymentHistory = [
    { period: "Oct, 2025", amount: "S/. 1,200.00", status: "Pagado", concept: "Cuidado Mensual + Servicios" },
    { period: "Nov, 2025", amount: "S/. 1,200.00", status: "Pagado", concept: "Cuidado Mensual + Servicios" },
    { period: "Dic, 2025", amount: "S/. 1,200.00", status: "Pagado", concept: "Cuidado Mensual + Servicios" },
  ]
}
