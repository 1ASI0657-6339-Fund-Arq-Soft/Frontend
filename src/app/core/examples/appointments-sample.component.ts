import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AppointmentApiService } from '../services/appointment-api.service'
import type { AppointmentResource as Appointment } from '../models/generated/appointments.types'

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-appointments-sample',
  templateUrl: './appointments-sample.component.html',
})
export class AppointmentsSampleComponent implements OnInit {
  appointments: Appointment[] = []
  loading = false
  error: string | null = null

  constructor(private appointmentApi: AppointmentApiService) {}

  ngOnInit(): void {
    this.loadAll()
  }

  loadAll() {
    this.loading = true
    this.appointmentApi.getAll().subscribe({ next: (d) => { this.appointments = d; this.loading = false }, error: (e) => { this.error = e?.message; this.loading = false } })
  }
}
