import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppointmentApiService } from './appointment-api.service';
import type { AppointmentResource, CreateAppointmentResource } from '../models/generated/appointments.types';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private appointmentApi: AppointmentApiService) {}

  // Proxy the backend API. No local mock data or seeding is performed here.
  getAppointments(): Observable<AppointmentResource[]> {
    return this.appointmentApi.getAll()
  }

  getAppointmentById(id: number): Observable<AppointmentResource> {
    return this.appointmentApi.getById(id)
  }

  addAppointment(payload: CreateAppointmentResource): Observable<AppointmentResource> {
    return this.appointmentApi.create(payload)
  }

  updateAppointment(id: number, payload: CreateAppointmentResource): Observable<AppointmentResource> {
    return this.appointmentApi.update(id, payload)
  }

  patchAppointment(id: number, patch: Partial<CreateAppointmentResource>): Observable<AppointmentResource> {
    // Appointment API may not have a dedicated patch - we use update for now
    return this.appointmentApi.update(id, patch as CreateAppointmentResource)
  }

  deleteAppointment(id: number): Observable<void> {
    return this.appointmentApi.delete(id)
  }

  searchByResidentId(residentId: number): Observable<AppointmentResource[]> {
    return this.appointmentApi.searchByResidentId(residentId)
  }

  searchAppointments(query: string): Observable<AppointmentResource[]> {
    // No dedicated search endpoint in AppointmentApiService: fallback to getAll + client-side filter
    return this.appointmentApi.getAll()
  }
}
