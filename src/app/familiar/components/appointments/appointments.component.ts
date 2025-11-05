import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"

@Component({
  selector: "app-appointments",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./appointments.component.html",
  styleUrls: ["./appointments.component.css"],
})
export class AppointmentsComponent {
  appointments = [
    {
      id: 1,
      title: "Consulta Médica",
      date: "2025-01-15",
      time: "10:00",
      doctor: "Dr. Juan Pérez",
      status: "Confirmada",
    },
    {
      id: 2,
      title: "Terapia Física",
      date: "2025-01-18",
      time: "14:00",
      doctor: "Lic. María González",
      status: "Pendiente",
    },
    {
      id: 3,
      title: "Laboratorio",
      date: "2025-01-20",
      time: "09:30",
      doctor: "Centro Diagnóstico",
      status: "Confirmada",
    },
  ]

  editingId: number | null = null
  editingData: any = {}

  editAppointment(appointment: any): void {
    this.editingId = appointment.id
    this.editingData = { ...appointment }
  }

  saveAppointment(): void {
    const index = this.appointments.findIndex((a) => a.id === this.editingId)
    if (index !== -1) {
      this.appointments[index] = { ...this.editingData }
    }
    this.editingId = null
  }

  cancelAppointment(appointmentId: number): void {
    if (confirm("¿Desea cancelar esta cita?")) {
      this.appointments = this.appointments.filter((a) => a.id !== appointmentId)
    }
  }
}
