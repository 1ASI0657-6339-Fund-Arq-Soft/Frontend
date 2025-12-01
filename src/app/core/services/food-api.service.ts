import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { API_CONFIG } from '../config/api-config'
import type { FoodEntry } from '../models/food.model'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class FoodApiService {
  private baseUrl = `${API_CONFIG.BASE_URL}/food-entries`

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

  getAll(): Observable<FoodEntry[]> {
    console.log('[FoodApiService] Obteniendo todas las entradas de alimentos');
    return this.http.get<FoodEntry[]>(this.baseUrl, this.getHttpOptions()).pipe(
      tap(entries => {
        console.log('[FoodApiService] Entradas de alimentos obtenidas exitosamente:', entries.length);
      }),
      catchError((e) => {
        console.error('[FoodApiService] Error al obtener entradas de alimentos:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  getById(id: string): Observable<FoodEntry> {
    console.log(`[FoodApiService] Obteniendo entrada de alimento con ID: ${id}`);
    return this.http.get<FoodEntry>(`${this.baseUrl}/${id}`, this.getHttpOptions()).pipe(
      tap(entry => {
        console.log('[FoodApiService] Entrada de alimento obtenida:', entry);
      }),
      catchError((e) => {
        console.error(`[FoodApiService] Error al obtener entrada de alimento ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  create(payload: Omit<FoodEntry, 'id' | 'createdAt'>): Observable<FoodEntry> {
    console.log('[FoodApiService] Creando nueva entrada de alimento:', payload);
    return this.http.post<FoodEntry>(this.baseUrl, payload, this.getHttpOptions()).pipe(
      tap(newEntry => {
        console.log('[FoodApiService] Entrada de alimento creada exitosamente:', newEntry);
      }),
      catchError((e) => {
        console.error('[FoodApiService] Error al crear entrada de alimento:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  update(id: string, payload: Partial<FoodEntry>): Observable<FoodEntry> {
    console.log(`[FoodApiService] Actualizando entrada de alimento ${id}:`, payload);
    return this.http.put<FoodEntry>(`${this.baseUrl}/${id}`, payload, this.getHttpOptions()).pipe(
      tap(updatedEntry => {
        console.log('[FoodApiService] Entrada de alimento actualizada exitosamente:', updatedEntry);
      }),
      catchError((e) => {
        console.error(`[FoodApiService] Error al actualizar entrada de alimento ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  delete(id: string): Observable<void> {
    console.log(`[FoodApiService] Eliminando entrada de alimento con ID: ${id}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[FoodApiService] Entrada de alimento ${id} eliminada exitosamente`);
      }),
      catchError((e) => {
        console.error(`[FoodApiService] Error al eliminar entrada de alimento ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  /**
   * Obtiene entradas de alimento por ID de residente
   */
  getByResidentId(residentId: number): Observable<FoodEntry[]> {
    console.log(`[FoodApiService] Obteniendo entradas de alimento para residente ${residentId}`);
    return this.http.get<FoodEntry[]>(`${this.baseUrl}/resident/${residentId}`, this.getHttpOptions()).pipe(
      tap(entries => {
        console.log('[FoodApiService] Entradas de alimento del residente obtenidas:', entries.length);
      }),
      catchError((e) => {
        console.error(`[FoodApiService] Error al obtener entradas de alimento del residente ${residentId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  private normalize(e: HttpErrorResponse): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
