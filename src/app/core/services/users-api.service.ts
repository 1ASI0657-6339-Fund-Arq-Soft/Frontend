import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { API_CONFIG } from '../config/api-config'
import type { DoctorResource, CarerResource, FamilyMemberResource, CreateDoctorResource, CreateCarerResource, CreateFamilyMemberResource, UpdateDoctorResource, UpdateFamilyMemberResource } from '../models/generated/users.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private baseUrl = API_CONFIG.BASE_URL

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

  // Doctors
  getAllDoctors(): Observable<DoctorResource[]> {
    console.log('[UsersApiService] Obteniendo todos los doctores');
    return this.http.get<DoctorResource[]>(`${this.baseUrl}/doctors`, this.getHttpOptions()).pipe(
      tap(doctors => {
        console.log('[UsersApiService] Doctores obtenidos exitosamente:', doctors.length);
      }),
      catchError((e) => {
        console.error('[UsersApiService] Error al obtener doctores:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  getDoctorById(id: number): Observable<DoctorResource> {
    console.log(`[UsersApiService] Obteniendo doctor con ID: ${id}`);
    return this.http.get<DoctorResource>(`${this.baseUrl}/doctors/${id}`, this.getHttpOptions()).pipe(
      tap(doctor => {
        console.log('[UsersApiService] Doctor obtenido:', doctor);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al obtener doctor ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  createDoctor(payload: CreateDoctorResource): Observable<DoctorResource> {
    console.log('[UsersApiService] Creando nuevo doctor:', payload);
    return this.http.post<DoctorResource>(`${this.baseUrl}/doctors`, payload, this.getHttpOptions()).pipe(
      tap(newDoctor => {
        console.log('[UsersApiService] Doctor creado exitosamente:', newDoctor);
      }),
      catchError((e) => {
        console.error('[UsersApiService] Error al crear doctor:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  updateDoctor(id: number, payload: UpdateDoctorResource): Observable<DoctorResource> {
    console.log(`[UsersApiService] Actualizando doctor ${id}:`, payload);
    return this.http.put<DoctorResource>(`${this.baseUrl}/doctors/${id}`, payload, this.getHttpOptions()).pipe(
      tap(updatedDoctor => {
        console.log('[UsersApiService] Doctor actualizado exitosamente:', updatedDoctor);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al actualizar doctor ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  deleteDoctor(id: number): Observable<void> {
    console.log(`[UsersApiService] Eliminando doctor con ID: ${id}`);
    return this.http.delete<void>(`${this.baseUrl}/doctors/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[UsersApiService] Doctor ${id} eliminado exitosamente`);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al eliminar doctor ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  // Carers
  getAllCarers(): Observable<CarerResource[]> {
    console.log('[UsersApiService] Obteniendo todos los cuidadores');
    return this.http.get<CarerResource[]>(`${this.baseUrl}/carers`, this.getHttpOptions()).pipe(
      tap(carers => {
        console.log('[UsersApiService] Cuidadores obtenidos exitosamente:', carers.length);
      }),
      catchError((e) => {
        console.error('[UsersApiService] Error al obtener cuidadores:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  getCarerById(id: number): Observable<CarerResource> {
    console.log(`[UsersApiService] Obteniendo cuidador con ID: ${id}`);
    return this.http.get<CarerResource>(`${this.baseUrl}/carers/${id}`, this.getHttpOptions()).pipe(
      tap(carer => {
        console.log('[UsersApiService] Cuidador obtenido:', carer);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al obtener cuidador ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  createCarer(payload: CreateCarerResource): Observable<CarerResource> {
    console.log('[UsersApiService] Creando nuevo cuidador:', payload);
    return this.http.post<CarerResource>(`${this.baseUrl}/carers`, payload, this.getHttpOptions()).pipe(
      tap(newCarer => {
        console.log('[UsersApiService] Cuidador creado exitosamente:', newCarer);
      }),
      catchError((e) => {
        console.error('[UsersApiService] Error al crear cuidador:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  updateCarer(id: number, payload: CreateCarerResource): Observable<CarerResource> {
    console.log(`[UsersApiService] Actualizando cuidador ${id}:`, payload);
    return this.http.put<CarerResource>(`${this.baseUrl}/carers/${id}`, payload, this.getHttpOptions()).pipe(
      tap(updatedCarer => {
        console.log('[UsersApiService] Cuidador actualizado exitosamente:', updatedCarer);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al actualizar cuidador ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  deleteCarer(id: number): Observable<void> {
    console.log(`[UsersApiService] Eliminando cuidador con ID: ${id}`);
    return this.http.delete<void>(`${this.baseUrl}/carers/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[UsersApiService] Cuidador ${id} eliminado exitosamente`);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al eliminar cuidador ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  // Family members
  getAllFamilyMembers(): Observable<FamilyMemberResource[]> {
    console.log('[UsersApiService] Obteniendo todos los familiares');
    return this.http.get<FamilyMemberResource[]>(`${this.baseUrl}/family-members`, this.getHttpOptions()).pipe(
      tap(families => {
        console.log('[UsersApiService] Familiares obtenidos exitosamente:', families.length);
      }),
      catchError((e) => {
        console.error('[UsersApiService] Error al obtener familiares:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  getFamilyMemberById(id: number): Observable<FamilyMemberResource> {
    console.log(`[UsersApiService] Obteniendo familiar con ID: ${id}`);
    return this.http.get<FamilyMemberResource>(`${this.baseUrl}/family-members/${id}`, this.getHttpOptions()).pipe(
      tap(family => {
        console.log('[UsersApiService] Familiar obtenido:', family);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al obtener familiar ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  createFamilyMember(payload: CreateFamilyMemberResource): Observable<FamilyMemberResource> {
    console.log('[UsersApiService] Creando nuevo familiar:', payload);
    return this.http.post<FamilyMemberResource>(`${this.baseUrl}/family-members`, payload, this.getHttpOptions()).pipe(
      tap(newFamily => {
        console.log('[UsersApiService] Familiar creado exitosamente:', newFamily);
      }),
      catchError((e) => {
        console.error('[UsersApiService] Error al crear familiar:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  updateFamilyMember(id: number, payload: UpdateFamilyMemberResource): Observable<FamilyMemberResource> {
    console.log(`[UsersApiService] Actualizando familiar ${id}:`, payload);
    return this.http.put<FamilyMemberResource>(`${this.baseUrl}/family-members/${id}`, payload, this.getHttpOptions()).pipe(
      tap(updatedFamily => {
        console.log('[UsersApiService] Familiar actualizado exitosamente:', updatedFamily);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al actualizar familiar ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  deleteFamilyMember(id: number): Observable<void> {
    console.log(`[UsersApiService] Eliminando familiar con ID: ${id}`);
    return this.http.delete<void>(`${this.baseUrl}/family-members/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[UsersApiService] Familiar ${id} eliminado exitosamente`);
      }),
      catchError((e) => {
        console.error(`[UsersApiService] Error al eliminar familiar ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
