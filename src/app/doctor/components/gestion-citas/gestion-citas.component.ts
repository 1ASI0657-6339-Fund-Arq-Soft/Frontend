import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { Observable } from 'rxjs';
import type { AppointmentResource } from '../../../core/models/generated/appointments.types';
import { ResidentsApiService } from '../../../core/services/residents-api.service';
import { UsersApiService } from '../../../core/services/users-api.service';
import { LayoutComponent } from "../layout/layout.component";

@Component({
  selector: "app-gestion-citas",
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: "./gestion-citas.component.html",
  styleUrl: "./gestion-citas.component.css"
})
export class GestionCitasComponent implements OnInit {
  appointments$!: Observable<AppointmentResource[]>;
  residentsMap: Record<number, string> = {}
  doctorsMap: Record<number, string> = {}

  constructor(private appointmentApi: AppointmentApiService, private residentsApi: ResidentsApiService, private usersApi: UsersApiService) {}

  ngOnInit(): void {
    this.appointments$ = this.appointmentApi.getAll();

    // preload maps for display (resident full name and doctor name)
    this.residentsApi.getAll().subscribe((list) => {
      list.forEach((r) => { if (r.id) this.residentsMap[r.id] = `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() })
    })
    this.usersApi.getAllDoctors().subscribe((list) => {
      list.forEach((d) => { if (d.id) this.doctorsMap[d.id] = `${d.fullName?.firstName ?? ''} ${d.fullName?.lastName ?? ''}`.trim() })
    })
  }

  accept(id: number | undefined) {
    if (!id) return;
    // fetch full appointment, update status and PUT
    this.appointmentApi.getById(id).subscribe((a) => {
      if (!a) return
      const payload = { ...a, status: 'accepted' }
      this.appointmentApi.update(id, payload).subscribe(() => { this.appointments$ = this.appointmentApi.getAll() })
    })
  }

  reject(id: number | undefined) {
    if (!id) return;
    this.appointmentApi.getById(id).subscribe((a) => {
      if (!a) return
      const payload = { ...a, status: 'rejected' }
      this.appointmentApi.update(id, payload).subscribe(() => { this.appointments$ = this.appointmentApi.getAll() })
    })
  }

  view(a: AppointmentResource) {
    const resident = a.residentId ? this.residentsMap[a.residentId] ?? a.residentId : 'N/A'
    const doctor = a.doctorId ? this.doctorsMap[a.doctorId] ?? a.doctorId : 'N/A'
    alert(JSON.stringify({ ...a, resident, doctor }, null, 2));
  }
}
