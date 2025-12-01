import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { tap } from 'rxjs/operators'
import { API_CONFIG } from '../config/api-config'
import type { ReceiptResource, CreateReceiptResource, UpdateReceiptResource } from '../models/generated/payments.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private baseUrl = `${API_CONFIG.BASE_URL}/receipts`

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

  getAll(): Observable<ReceiptResource[]> {
    console.log('[PaymentApiService] Obteniendo todos los recibos');
    return this.http.get<ReceiptResource[]>(this.baseUrl, this.getHttpOptions()).pipe(
      tap(receipts => {
        console.log('[PaymentApiService] Recibos obtenidos exitosamente:', receipts.length);
      }),
      catchError((e) => {
        console.error('[PaymentApiService] Error al obtener recibos:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  getById(receiptId: number): Observable<ReceiptResource> {
    console.log(`[PaymentApiService] Obteniendo recibo con ID: ${receiptId}`);
    return this.http.get<ReceiptResource>(`${this.baseUrl}/${receiptId}`, this.getHttpOptions()).pipe(
      tap(receipt => {
        console.log('[PaymentApiService] Recibo obtenido:', receipt);
      }),
      catchError((e) => {
        console.error(`[PaymentApiService] Error al obtener recibo ${receiptId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  getByResident(residentId: number): Observable<ReceiptResource[]> {
    console.log(`[PaymentApiService] Obteniendo recibos para residente ${residentId}`);
    return this.http.get<ReceiptResource[]>(`${this.baseUrl}/resident/${residentId}`, this.getHttpOptions()).pipe(
      tap(receipts => {
        console.log('[PaymentApiService] Recibos del residente obtenidos:', receipts.length);
      }),
      catchError((e) => {
        console.error(`[PaymentApiService] Error al obtener recibos del residente ${residentId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  create(payload: CreateReceiptResource): Observable<ReceiptResource> {
    console.log('[PaymentApiService] Creando nuevo recibo:', payload);
    return this.http.post<ReceiptResource>(this.baseUrl, payload, this.getHttpOptions()).pipe(
      tap(newReceipt => {
        console.log('[PaymentApiService] Recibo creado exitosamente:', newReceipt);
      }),
      catchError((e) => {
        console.error('[PaymentApiService] Error al crear recibo:', e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  update(receiptId: number, payload: UpdateReceiptResource): Observable<ReceiptResource> {
    console.log(`[PaymentApiService] Actualizando recibo ${receiptId}:`, payload);
    return this.http.put<ReceiptResource>(`${this.baseUrl}/${receiptId}`, payload, this.getHttpOptions()).pipe(
      tap(updatedReceipt => {
        console.log('[PaymentApiService] Recibo actualizado exitosamente:', updatedReceipt);
      }),
      catchError((e) => {
        console.error(`[PaymentApiService] Error al actualizar recibo ${receiptId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  delete(receiptId: number): Observable<void> {
    console.log(`[PaymentApiService] Eliminando recibo con ID: ${receiptId}`);
    return this.http.delete<void>(`${this.baseUrl}/${receiptId}`, this.getHttpOptions()).pipe(
      tap(() => {
        console.log(`[PaymentApiService] Recibo ${receiptId} eliminado exitosamente`);
      }),
      catchError((e) => {
        console.error(`[PaymentApiService] Error al eliminar recibo ${receiptId}:`, e);
        return throwError(() => this.normalize(e));
      })
    );
  }

  private normalize(e: any): ApiError {
    return { status: e?.status, message: e?.error?.message ?? e?.message ?? 'Unknown', details: e }
  }
}
