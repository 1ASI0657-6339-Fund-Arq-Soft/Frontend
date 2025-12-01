import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { NotificationDTO } from '../models/generated/notifications.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private base = API_CONFIG.notificationsBaseUrl

  constructor(private http: HttpClient) {}

  getAll(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.base}/notifications`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  forUser(userId: string): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.base}/notifications/notifications/${userId}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  searchByStatus(status: string): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.base}/notifications/search`, { params: { status } }).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  create(payload: Partial<NotificationDTO>): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(`${this.base}/notifications`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/notifications/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  markAsRead(id: string): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(`${this.base}/notifications/${id}/mark-as-read`, {}).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  archive(id: string): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(`${this.base}/notifications/${id}/archive`, {}).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  unarchive(id: string): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(`${this.base}/notifications/${id}/unarchive`, {}).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
