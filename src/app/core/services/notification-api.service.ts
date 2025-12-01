import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { API_CONFIG } from '../config/api-config'
import type { NotificationDTO } from '../models/generated/notifications.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private baseUrl = `${API_CONFIG.BASE_URL}/notifications`

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

  getAll(): Observable<NotificationDTO[]> {
    console.log('[NotificationApiService] Obteniendo todas las notificaciones');
    return this.http.get<NotificationDTO[]>(this.baseUrl, this.getHttpOptions()).pipe(
      tap(notifications => {
        console.log('[NotificationApiService] Notificaciones obtenidas exitosamente:', notifications.length);
      }),
      catchError((e) => {
        console.error('[NotificationApiService] Error al obtener notificaciones:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  forUser(userId: string): Observable<NotificationDTO[]> {
    console.log(`[NotificationApiService] Obteniendo notificaciones para usuario: ${userId}`);
    return this.http.get<NotificationDTO[]>(`${this.baseUrl}/notifications/${userId}`, this.getHttpOptions()).pipe(
      tap(notifications => {
        console.log('[NotificationApiService] Notificaciones del usuario obtenidas:', notifications.length);
      }),
      catchError((e) => {
        console.error(`[NotificationApiService] Error al obtener notificaciones del usuario ${userId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  searchByStatus(status: string): Observable<NotificationDTO[]> {
    console.log(`[NotificationApiService] Buscando notificaciones por estado: ${status}`);
    return this.http.get<NotificationDTO[]>(`${this.baseUrl}/search`, { 
      params: { status },
      ...this.getHttpOptions()
    }).pipe(
      tap(notifications => {
        console.log('[NotificationApiService] Notificaciones encontradas por estado:', notifications.length);
      }),
      catchError((e) => {
        console.error(`[NotificationApiService] Error al buscar notificaciones por estado ${status}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  create(payload: Partial<NotificationDTO>): Observable<NotificationDTO> {
    console.log('[NotificationApiService] Creando nueva notificación:', payload);
    return this.http.post<NotificationDTO>(this.baseUrl, payload, this.getHttpOptions()).pipe(
      tap(newNotification => {
        console.log('[NotificationApiService] Notificación creada exitosamente:', newNotification);
      }),
      catchError((e) => {
        console.error('[NotificationApiService] Error al crear notificación:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  delete(id: string): Observable<void> {
    console.log(`[NotificationApiService] Eliminando notificación con ID: ${id}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[NotificationApiService] Notificación ${id} eliminada exitosamente`);
      }),
      catchError((e) => {
        console.error(`[NotificationApiService] Error al eliminar notificación ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  markAsRead(id: string): Observable<NotificationDTO> {
    console.log(`[NotificationApiService] Marcando notificación como leída: ${id}`);
    return this.http.post<NotificationDTO>(`${this.baseUrl}/${id}/mark-as-read`, {}, this.getHttpOptions()).pipe(
      tap(notification => {
        console.log('[NotificationApiService] Notificación marcada como leída:', notification);
      }),
      catchError((e) => {
        console.error(`[NotificationApiService] Error al marcar notificación como leída ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  archive(id: string): Observable<NotificationDTO> {
    console.log(`[NotificationApiService] Archivando notificación: ${id}`);
    return this.http.post<NotificationDTO>(`${this.baseUrl}/${id}/archive`, {}, this.getHttpOptions()).pipe(
      tap(notification => {
        console.log('[NotificationApiService] Notificación archivada:', notification);
      }),
      catchError((e) => {
        console.error(`[NotificationApiService] Error al archivar notificación ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  unarchive(id: string): Observable<NotificationDTO> {
    console.log(`[NotificationApiService] Desarchivando notificación: ${id}`);
    return this.http.post<NotificationDTO>(`${this.baseUrl}/${id}/unarchive`, {}, this.getHttpOptions()).pipe(
      tap(notification => {
        console.log('[NotificationApiService] Notificación desarchivada:', notification);
      }),
      catchError((e) => {
        console.error(`[NotificationApiService] Error al desarchivar notificación ${id}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
