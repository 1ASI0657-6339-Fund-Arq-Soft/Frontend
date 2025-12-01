import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { DoctorResource, CarerResource, FamilyMemberResource, CreateDoctorResource, CreateCarerResource, CreateFamilyMemberResource, UpdateDoctorResource, UpdateFamilyMemberResource } from '../models/generated/users.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private base = API_CONFIG.usersBaseUrl

  constructor(private http: HttpClient) {}

  // Doctors
  getAllDoctors(): Observable<DoctorResource[]> {
    return this.http.get<DoctorResource[]>(`${this.base}/doctors`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  getDoctorById(id: number): Observable<DoctorResource> {
    return this.http.get<DoctorResource>(`${this.base}/doctors/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  createDoctor(payload: CreateDoctorResource): Observable<DoctorResource> {
    return this.http.post<DoctorResource>(`${this.base}/doctors`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  updateDoctor(id: number, payload: UpdateDoctorResource): Observable<DoctorResource> {
    return this.http.put<DoctorResource>(`${this.base}/doctors/${id}`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/doctors/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  // Carers
  getAllCarers(): Observable<CarerResource[]> {
    return this.http.get<CarerResource[]>(`${this.base}/carers`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  getCarerById(id: number): Observable<CarerResource> {
    return this.http.get<CarerResource>(`${this.base}/carers/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  createCarer(payload: CreateCarerResource): Observable<CarerResource> {
    return this.http.post<CarerResource>(`${this.base}/carers`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  updateCarer(id: number, payload: CreateCarerResource): Observable<CarerResource> {
    return this.http.put<CarerResource>(`${this.base}/carers/${id}`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  deleteCarer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/carers/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  // Family members
  getAllFamilyMembers(): Observable<FamilyMemberResource[]> {
    return this.http.get<FamilyMemberResource[]>(`${this.base}/family-members`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  getFamilyMemberById(id: number): Observable<FamilyMemberResource> {
    return this.http.get<FamilyMemberResource>(`${this.base}/family-members/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  createFamilyMember(payload: CreateFamilyMemberResource): Observable<FamilyMemberResource> {
    return this.http.post<FamilyMemberResource>(`${this.base}/family-members`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  updateFamilyMember(id: number, payload: UpdateFamilyMemberResource): Observable<FamilyMemberResource> {
    return this.http.put<FamilyMemberResource>(`${this.base}/family-members/${id}`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  deleteFamilyMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/family-members/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
