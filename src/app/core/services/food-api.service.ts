import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { FoodEntry } from '../models/food.model' // Using FoodEntry as the resource type
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class FoodApiService {
  private base = API_CONFIG.foodBaseUrl

  constructor(private http: HttpClient) {}

  getAll(): Observable<FoodEntry[]> {
    return this.http.get<FoodEntry[]>(`${this.base}/food-entries`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  getById(id: string): Observable<FoodEntry> {
    return this.http.get<FoodEntry>(`${this.base}/food-entries/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  create(payload: Omit<FoodEntry, 'id' | 'createdAt'>): Observable<FoodEntry> {
    return this.http.post<FoodEntry>(`${this.base}/food-entries`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  update(id: string, payload: Partial<FoodEntry>): Observable<FoodEntry> {
    return this.http.put<FoodEntry>(`${this.base}/food-entries/${id}`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/food-entries/${id}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  private normalize(e: HttpErrorResponse): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
