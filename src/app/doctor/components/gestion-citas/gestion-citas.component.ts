import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { Observable, take, map } from 'rxjs';
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
    
    console.log(`[GestionCitasComponent] Aceptando cita con ID: ${id}`);
    
    // Solo enviamos el status para evitar conflictos de validación en el backend
    const payload = { status: 'accepted' };
    console.log(`[GestionCitasComponent] Actualizando solo status:`, payload);
    
    this.appointmentApi.update(id, payload).subscribe({
      next: () => {
        console.log(`[GestionCitasComponent] Cita ${id} aceptada exitosamente`);
        this.appointments$ = this.appointmentApi.getAll();
      },
      error: (error) => {
        console.error(`[GestionCitasComponent] Error al aceptar cita ${id}:`, error);
      }
    });
  }

  reject(id: number | undefined) {
    if (!id) return;
    
    console.log(`[GestionCitasComponent] Rechazando cita con ID: ${id}`);
    
    // Solo enviamos el status para evitar conflictos de validación en el backend
    const payload = { status: 'rejected' };
    console.log(`[GestionCitasComponent] Actualizando solo status:`, payload);
    
    this.appointmentApi.update(id, payload).subscribe({
      next: () => {
        console.log(`[GestionCitasComponent] Cita ${id} rechazada exitosamente`);
        this.appointments$ = this.appointmentApi.getAll();
      },
      error: (error) => {
        console.error(`[GestionCitasComponent] Error al rechazar cita ${id}:`, error);
      }
    });
  }

  view(a: AppointmentResource) {
    const resident = a.residentId ? this.residentsMap[a.residentId] ?? a.residentId : 'N/A'
    const doctor = a.doctorId ? this.doctorsMap[a.doctorId] ?? a.doctorId : 'N/A'
    alert(JSON.stringify({ ...a, resident, doctor }, null, 2));
  }
}
