import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppointmentService } from "../../../core/services/appointment.service";
import { Observable } from "rxjs";
import type { Appointment } from "../../../core/models/appointment.model";

@Component({
  selector: "app-gestion-citas",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="doctor-gestion">
      <h2>Gestión de Citas</h2>
      <ul>
        <li *ngFor="let a of (appointments$ | async)">
          <div>
            <strong>{{ a.title }}</strong>
            <div>{{ a.start }} - {{ a.end }}</div>
            <div>Status: {{ a.status || 'pendiente' }}</div>
          </div>
          <div class="actions">
            <button (click)="accept(a.id)">Aceptar</button>
            <button (click)="reject(a.id)">Rechazar</button>
            <button (click)="view(a)">Ver detalles</button>
          </div>
        </li>
      </ul>
    </div>
  `,
})
export class GestionCitasComponent implements OnInit {
  appointments$!: Observable<Appointment[]>;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointments$ = this.appointmentService.getAppointments();
  }

  accept(id: number | undefined) {
    if (!id) return;
    this.appointmentService.patchAppointment(id, { status: 'accepted' }).subscribe(() => {
      this.appointments$ = this.appointmentService.getAppointments();
    });
  }

  reject(id: number | undefined) {
    if (!id) return;
    this.appointmentService.patchAppointment(id, { status: 'rejected' }).subscribe(() => {
      this.appointments$ = this.appointmentService.getAppointments();
    });
  }

  view(a: Appointment) {
    alert(JSON.stringify(a, null, 2));
  }
}
