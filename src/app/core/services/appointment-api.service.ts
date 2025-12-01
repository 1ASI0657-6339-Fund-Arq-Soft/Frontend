import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { API_CONFIG } from '../config/api-config'
import type { AppointmentResource, CreateAppointmentResource } from '../models/generated/appointments.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private baseUrl = `${API_CONFIG.BASE_URL}/appointments`

  constructor(private http: HttpClient) {}

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      })
    };
  }

  getAll(): Observable<AppointmentResource[]> {
    console.log('[AppointmentApiService] Obteniendo todas las citas');
    return this.http.get<AppointmentResource[]>(this.baseUrl, this.getHttpOptions()).pipe(
      tap(appointments => {
        console.log('[AppointmentApiService] Citas obtenidas exitosamente:', appointments.length);
      }),
      catchError((e) => {
        console.error('[AppointmentApiService] Error al obtener citas:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  getById(id: number): Observable<AppointmentResource> {
    console.log(`[AppointmentApiService] Obteniendo cita con ID: ${id}`);
    return this.http.get<AppointmentResource>(`${this.baseUrl}/${id}`, this.getHttpOptions()).pipe(
      tap(appointment => {
        console.log('[AppointmentApiService] Cita obtenida:', appointment);
      }),
      catchError((e) => {
        console.error(`[AppointmentApiService] Error al obtener cita ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  create(payload: CreateAppointmentResource): Observable<AppointmentResource> {
    console.log('[AppointmentApiService] Creando nueva cita:', payload);
    return this.http.post<AppointmentResource>(this.baseUrl, payload, this.getHttpOptions()).pipe(
      tap(newAppointment => {
        console.log('[AppointmentApiService] Cita creada exitosamente:', newAppointment);
      }),
      catchError((e) => {
        console.error('[AppointmentApiService] Error al crear cita:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  update(id: number, payload: CreateAppointmentResource): Observable<AppointmentResource> {
    console.log(`[AppointmentApiService] Actualizando cita ${id}:`, payload);
    return this.http.put<AppointmentResource>(`${this.baseUrl}/${id}`, payload, this.getHttpOptions()).pipe(
      tap(updatedAppointment => {
        console.log('[AppointmentApiService] Cita actualizada exitosamente:', updatedAppointment);
      }),
      catchError((e) => {
        console.error(`[AppointmentApiService] Error al actualizar cita ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  delete(id: number): Observable<void> {
    console.log(`[AppointmentApiService] Eliminando cita con ID: ${id}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[AppointmentApiService] Cita ${id} eliminada exitosamente`);
      }),
      catchError((e) => {
        console.error(`[AppointmentApiService] Error al eliminar cita ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  searchByResidentId(residentId: number): Observable<AppointmentResource[]> {
    console.log(`[AppointmentApiService] Buscando citas por residente: ${residentId}`);
    return this.http.get<AppointmentResource[]>(`${this.baseUrl}/searchByResidentId`, { 
      params: { residentId: String(residentId) },
      ...this.getHttpOptions()
    }).pipe(
      tap(appointments => {
        console.log('[AppointmentApiService] Citas del residente encontradas:', appointments.length);
      }),
      catchError((e) => {
        console.error(`[AppointmentApiService] Error al buscar citas por residente ${residentId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  searchByDoctorId(doctorId: number): Observable<AppointmentResource[]> {
    console.log(`[AppointmentApiService] Buscando citas por doctor: ${doctorId}`);
    return this.http.get<AppointmentResource[]>(`${this.baseUrl}/searchByDoctorId`, { 
      params: { doctorId: String(doctorId) },
      ...this.getHttpOptions()
    }).pipe(
      tap(appointments => {
        console.log('[AppointmentApiService] Citas del doctor encontradas:', appointments.length);
      }),
      catchError((e) => {
        console.error(`[AppointmentApiService] Error al buscar citas por doctor ${doctorId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
