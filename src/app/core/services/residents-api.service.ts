import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { API_CONFIG } from '../config/api-config'
import type { ResidentResource, ResidentDetailsResource, CreateResidentResource } from '../models/generated/residents.types'
import type { Resident } from '../models/api/resident.model'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class ResidentsApiService {
  private baseUrl = `${API_CONFIG.BASE_URL}/residents`

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

  getAll(): Observable<ResidentResource[]> {
    console.log('[ResidentsApiService] Obteniendo todos los residentes');
    return this.http.get<ResidentResource[]>(this.baseUrl, this.getHttpOptions()).pipe(
      tap(residents => {
        console.log('[ResidentsApiService] Residentes obtenidos exitosamente:', residents.length);
      }),
      catchError((err) => {
        console.error('[ResidentsApiService] Error al obtener residentes:', err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  getById(id: number): Observable<ResidentResource> {
    console.log(`[ResidentsApiService] Obteniendo residente con ID: ${id}`);
    return this.http.get<ResidentResource>(`${this.baseUrl}/${id}`, this.getHttpOptions()).pipe(
      tap(resident => {
        console.log('[ResidentsApiService] Residente obtenido:', resident);
      }),
      catchError((err) => {
        console.error(`[ResidentsApiService] Error al obtener residente ${id}:`, err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  getDetails(id: number): Observable<ResidentDetailsResource> {
    console.log(`[ResidentsApiService] Obteniendo detalles del residente ${id}`);
    return this.http.get<ResidentDetailsResource>(`${this.baseUrl}/${id}/details`, this.getHttpOptions()).pipe(
      tap(details => {
        console.log('[ResidentsApiService] Detalles del residente obtenidos:', details);
      }),
      catchError((err) => {
        console.error(`[ResidentsApiService] Error al obtener detalles del residente ${id}:`, err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  create(payload: CreateResidentResource): Observable<ResidentResource> {
    console.log('[ResidentsApiService] Creando nuevo residente:', payload);
    return this.http.post<ResidentResource>(this.baseUrl, payload, this.getHttpOptions()).pipe(
      tap(newResident => {
        console.log('[ResidentsApiService] Residente creado exitosamente:', newResident);
      }),
      catchError((err) => {
        console.error('[ResidentsApiService] Error al crear residente:', err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  update(id: number, payload: CreateResidentResource): Observable<ResidentResource> {
    console.log(`[ResidentsApiService] Actualizando residente ${id}:`, payload);
    return this.http.put<ResidentResource>(`${this.baseUrl}/${id}`, payload, this.getHttpOptions()).pipe(
      tap(updatedResident => {
        console.log('[ResidentsApiService] Residente actualizado exitosamente:', updatedResident);
      }),
      catchError((err) => {
        console.error(`[ResidentsApiService] Error al actualizar residente ${id}:`, err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  delete(id: number): Observable<void> {
    console.log(`[ResidentsApiService] Eliminando residente con ID: ${id}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[ResidentsApiService] Residente ${id} eliminado exitosamente`);
      }),
      catchError((err) => {
        console.error(`[ResidentsApiService] Error al eliminar residente ${id}:`, err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  searchByDni(dni: string): Observable<ResidentResource> {
    console.log(`[ResidentsApiService] Buscando residente por DNI: ${dni}`);
    return this.http.get<ResidentResource>(`${this.baseUrl}/searchByDni`, { 
      params: { dni },
      ...this.getHttpOptions()
    }).pipe(
      tap(resident => {
        console.log('[ResidentsApiService] Residente encontrado por DNI:', resident);
      }),
      catchError((err) => {
        console.error(`[ResidentsApiService] Error al buscar residente por DNI ${dni}:`, err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  /**
   * Obtiene residentes por ID de familiar
   */
  getResidentsByFamilyMember(familyMemberId: number): Observable<ResidentResource[]> {
    console.log(`[ResidentsApiService] Obteniendo residentes para familiar ${familyMemberId}`);
    return this.http.get<ResidentResource[]>(`${this.baseUrl}/family-member/${familyMemberId}`, this.getHttpOptions()).pipe(
      tap(residents => {
        console.log('[ResidentsApiService] Residentes del familiar obtenidos:', residents.length);
      }),
      catchError((err) => {
        console.error(`[ResidentsApiService] Error al obtener residentes del familiar ${familyMemberId}:`, err);
        return throwError(() => this.normalize(err));
      })
    );
  }

  private normalize(err: any): ApiError {
    return { status: err?.status, message: err?.error?.message ?? err?.message ?? 'Unknown error', details: err }
  }
}
