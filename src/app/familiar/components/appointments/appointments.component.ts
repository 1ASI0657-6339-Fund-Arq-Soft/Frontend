import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { LayoutComponent } from "../layout/layout.component"
import { AppointmentApiService } from '../../../core/services/appointment-api.service'
import type { AppointmentResource } from '../../../core/models/generated/appointments.types'
import { Subscription } from 'rxjs'

@Component({
  selector: "app-appointments",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./appointments.component.html",
  styleUrls: ["./appointments.component.css"],
})
export class AppointmentsComponent implements OnInit {
  appointments: AppointmentResource[] = []

  editingId: number | null = null
  editingData: Partial<AppointmentResource> = {}
  private sub: Subscription | null = null

  constructor(private appointmentApi: AppointmentApiService) {}

  ngOnInit(): void {
    this.sub = this.appointmentApi.getAll().subscribe({ next: (list: AppointmentResource[]) => this.appointments = list, error: (e: any) => { console.warn('Failed to load appointments', e); this.appointments = [] } })
  }

  editAppointment(appointment: AppointmentResource): void {
    this.editingId = appointment.id ?? null
    this.editingData = { ...appointment }
  }

  saveAppointment(): void {
    // If editingId exists, we update via API, otherwise ignore - add flows intentionally simple for this step
    if (!this.editingId) return
    this.appointmentApi.update(this.editingId, this.editingData as any).subscribe({ next: () => this.refreshList(), error: (e: any) => console.warn('Failed to update appointment', e) })
    this.editingId = null
  }

  cancelAppointment(appointmentId: number): void {
    if (!appointmentId) return
    if (!confirm("¿Desea cancelar esta cita?")) return
    this.appointmentApi.delete(appointmentId).subscribe({ next: () => this.refreshList(), error: (e: any) => console.warn('Failed to delete appointment', e) })
  }

  refreshList(): void {
    this.sub?.unsubscribe()
    this.sub = this.appointmentApi.getAll().subscribe({ next: (list: AppointmentResource[]) => this.appointments = list, error: (e: any) => { console.warn('Failed to refresh appointments', e); this.appointments = [] } })
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
