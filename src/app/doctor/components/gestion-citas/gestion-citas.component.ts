import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppointmentService } from "../../../core/services/appointment.service";
import { Observable } from "rxjs";
import type { Appointment } from "../../../core/models/appointment.model";
import { LayoutComponent } from "../layout/layout.component";

@Component({
  selector: "app-gestion-citas",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./gestion-citas.component.html",
  styleUrl: "./gestion-citas.component.css"
})
export class GestionCitasComponent implements OnInit {
  appointments$!: Observable<Appointment[]>;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointments$ = this.appointmentService.getAppointments();
  }

  accept(id: number | undefined) {
    if (!id) return;
    this.appointmentService
      .patchAppointment(id, { status: "accepted" })
      .subscribe(() => {
        this.appointments$ = this.appointmentService.getAppointments();
      });
  }

  reject(id: number | undefined) {
    if (!id) return;
    this.appointmentService
      .patchAppointment(id, { status: "rejected" })
      .subscribe(() => {
        this.appointments$ = this.appointmentService.getAppointments();
      });
  }

  view(a: Appointment) {
    alert(JSON.stringify(a, null, 2));
  }
}
