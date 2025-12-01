import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { ReceiptResource, CreateReceiptResource, UpdateReceiptResource } from '../models/generated/payments.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private base = API_CONFIG.paymentsBaseUrl

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReceiptResource[]> {
    return this.http.get<ReceiptResource[]>(`${this.base}/receipts`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  getById(receiptId: number): Observable<ReceiptResource> {
    return this.http.get<ReceiptResource>(`${this.base}/receipts/${receiptId}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  getByResident(residentId: number): Observable<ReceiptResource[]> {
    return this.http.get<ReceiptResource[]>(`${this.base}/receipts/resident/${residentId}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  create(payload: CreateReceiptResource): Observable<ReceiptResource> {
    return this.http.post<ReceiptResource>(`${this.base}/receipts`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  update(receiptId: number, payload: UpdateReceiptResource): Observable<ReceiptResource> {
    return this.http.put<ReceiptResource>(`${this.base}/receipts/${receiptId}`, payload).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  delete(receiptId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/receipts/${receiptId}`).pipe(catchError((e) => throwError(this.normalize(e))))
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
