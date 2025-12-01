import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { AppointmentResource, CreateAppointmentResource } from '../models/generated/appointments.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private base = API_CONFIG.appointmentsBaseUrl

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppointmentResource[]> {
    return this.http.get<AppointmentResource[]>(`${this.base}/appointments`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  getById(id: number): Observable<AppointmentResource> {
    return this.http.get<AppointmentResource>(`${this.base}/appointments/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  create(payload: CreateAppointmentResource): Observable<AppointmentResource> {
    return this.http.post<AppointmentResource>(`${this.base}/appointments`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  update(id: number, payload: CreateAppointmentResource): Observable<AppointmentResource> {
    return this.http.put<AppointmentResource>(`${this.base}/appointments/${id}`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/appointments/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  searchByResidentId(residentId: number): Observable<AppointmentResource[]> {
    return this.http.get<AppointmentResource[]>(`${this.base}/appointments/searchByResidentId`, { params: { residentId: String(residentId) } }).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  searchByDoctorId(doctorId: number): Observable<AppointmentResource[]> {
    return this.http.get<AppointmentResource[]>(`${this.base}/appointments/searchByDoctorId`, { params: { doctorId: String(doctorId) } }).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
