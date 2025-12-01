import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { ResidentResource, ResidentDetailsResource, CreateResidentResource } from '../models/generated/residents.types'
import type { Resident } from '../models/api/resident.model' // Added import for Resident
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class ResidentsApiService {
  private base = API_CONFIG.residentsBaseUrl

  constructor(private http: HttpClient) {}

  getAll(): Observable<ResidentResource[]> {
    // backend returns ResidentResource[] (OpenAPI generated types)
    return this.http.get<ResidentResource[]>(`${this.base}/residents`).pipe(catchError((err) => throwError(this.normalize(err))))
  }

  getById(id: number): Observable<ResidentResource> {
    return this.http.get<ResidentResource>(`${this.base}/residents/${id}`).pipe(catchError((err) => throwError(this.normalize(err))))
  }

  getDetails(id: number): Observable<ResidentDetailsResource> {
    return this.http.get<ResidentDetailsResource>(`${this.base}/residents/${id}/details`).pipe(catchError((err) => throwError(this.normalize(err))))
  }

  create(payload: CreateResidentResource): Observable<ResidentResource> {
    return this.http.post<ResidentResource>(`${this.base}/residents`, payload).pipe(catchError((err) => throwError(this.normalize(err))))
  }

  update(id: number, payload: CreateResidentResource): Observable<ResidentResource> {
    return this.http.put<ResidentResource>(`${this.base}/residents/${id}`, payload).pipe(catchError((err) => throwError(this.normalize(err))))
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/residents/${id}`).pipe(catchError((err) => throwError(this.normalize(err))))
  }

  searchByDni(dni: string): Observable<ResidentResource> {
    return this.http.get<ResidentResource>(`${this.base}/residents/searchByDni`, { params: { dni } }).pipe(catchError((err) => throwError(this.normalize(err))))
  }

  private normalize(err: any): ApiError {
    return { status: err?.status, message: err?.error?.message ?? err?.message ?? 'Unknown error', details: err }
  }
}
