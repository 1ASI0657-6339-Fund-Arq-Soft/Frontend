import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, catchError, of, map } from 'rxjs'
import type { Payment, PaymentStatus } from '../models/payment.model'
import { PaymentApiService } from './payment-api.service'
import { API_CONFIG } from '../config/api-config'
import type { ReceiptResource, CreateReceiptResource, UpdateReceiptResource } from '../models/generated/payments.types'
import { HttpClient } from '@angular/common/http' // Added HttpClient for potential local fallbacks if needed. Though payment-api.service has it.

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private paymentsSubject = new BehaviorSubject<Payment[]>([])
  public payments$ = this.paymentsSubject.asObservable()

  constructor(private paymentApi: PaymentApiService, private http: HttpClient) { // Inject PaymentApiService and HttpClient
    this.loadFromStorage()
  }

  // Helper to map ReceiptResource to Payment
  private mapReceiptToPayment(receipt: ReceiptResource): Payment {
    return {
      id: String(receipt.receiptId), // Convert number to string
      period: '', // No direct mapping, will be lost or derived
      concept: receipt.type || '', // Using type as concept
      amount: String(receipt.totalAmount), // Convert number to string
      status: receipt.status ? 'paid' : 'pending', // Map boolean to PaymentStatus
      createdAt: receipt.issueDate, // Using issueDate
      payerId: String(receipt.residentId), // Convert number to string
      // payer, requester, requesterId, receiptUrl will be lost or need to be managed locally
    }
  }

  // Helper to map Payment to CreateReceiptResource
  private mapPaymentToCreateReceipt(payment: Omit<Payment, 'id' | 'createdAt' | 'status'>): CreateReceiptResource {
    return {
      // payload explicitly has no 'createdAt' (it's omitted by the callers), so always use a timestamp here
      issueDate: new Date().toISOString(),
      totalAmount: parseFloat(payment.amount.replace(/[^0-9.-]+/g, "")), // Parse amount string to number
      status: false, // Always pending on creation
      residentId: payment.payerId ? Number(payment.payerId) : undefined, // Convert string to number
      type: `${payment.concept} - ${payment.period}`, // Combine concept and period into type
    }
  }

  // Helper to map Payment to UpdateReceiptResource
  private mapPaymentToUpdateReceipt(payment: Partial<Payment>): UpdateReceiptResource {
    const update: UpdateReceiptResource = {}
    if (payment.amount !== undefined) {
      update.totalAmount = parseFloat(payment.amount.replace(/[^0-9.-]+/g, ""))
    }
    if (payment.status !== undefined) {
      update.status = payment.status === 'paid' ? true : false
    }
    if (payment.period !== undefined || payment.concept !== undefined) {
      // This might be tricky if only one is updated. For now, if either changes, update type.
      update.type = `${payment.concept || ''} - ${payment.period || ''}`.trim()
    }
    if (payment.payerId !== undefined) {
      update.residentId = Number(payment.payerId)
    }
    // Add other fields as needed
    return update
  }

  getPayments(): Payment[] {
    return this.paymentsSubject.value
  }

  createRequest(payload: Omit<Payment, 'id' | 'createdAt' | 'status'>): Observable<Payment> {
    const createPayload = this.mapPaymentToCreateReceipt(payload)
    return this.paymentApi.create(createPayload).pipe(
      map((receipt) => {
        // Map backend receipt to local Payment, preserving fields from original payload
        const newPayment: Payment = {
            id: String(receipt.receiptId),
            period: payload.period,
            concept: payload.concept,
            amount: String(receipt.totalAmount),
            status: receipt.status ? 'paid' : 'pending',
            createdAt: receipt.issueDate,
            payerId: String(receipt.residentId),
            requester: payload.requester,
            requesterId: payload.requesterId,
            payer: payload.payer,
            // receiptUrl, if present in ReceiptResource, should be mapped here
        }
        const current = [newPayment, ...this.paymentsSubject.value]
        this.paymentsSubject.next(current)
        return newPayment
      }),
    )
  }

  markAsPaid(id: string, receiptUrl?: string, payer?: string, payerId?: string): void {
    const currentPayment = this.paymentsSubject.value.find(p => p.id === id)
    if (!currentPayment) return

    const updatedPayment: Payment = { ...currentPayment, status: 'paid', receiptUrl, payer, payerId }

    if (!currentPayment.payerId) {
      console.warn('Cannot mark as paid in backend: payerId is missing for payment', id)
      return
    }
    const updatePayload: UpdateReceiptResource = {
      status: true, // Mark as paid
      paymentDate: new Date().toISOString(),
      residentId: Number(currentPayment.payerId),
      totalAmount: parseFloat(currentPayment.amount.replace(/[^0-9.-]+/g, ""))
    }
    this.paymentApi.update(Number(id), updatePayload).subscribe({
      next: () => {
        const updated = this.paymentsSubject.value.map((p) => (p.id === id ? updatedPayment : p))
        this.paymentsSubject.next(updated)
      },
      error: (e) => {
        console.warn('Failed to mark payment as paid in backend — state not modified locally.', e)
      }
    })
  }

  updatePayment(id: string, patch: Partial<Payment>): Payment | null {
    const currentPayment = this.paymentsSubject.value.find(p => p.id === id)
    if (!currentPayment) return null

    const updatedPayment: Payment = { ...currentPayment, ...patch }

    const updatePayload = this.mapPaymentToUpdateReceipt(patch)
    this.paymentApi.update(Number(id), updatePayload).subscribe({ // Assuming id is receiptId (number)
      next: () => {
        const updated = this.paymentsSubject.value.map((p) => (p.id === id ? updatedPayment : p))
        this.paymentsSubject.next(updated)
      },
      error: (e) => {
        console.warn('Failed to update payment in backend — state not modified locally.', e)
      }
    })
    return updatedPayment
  }

  deletePayment(id: string): void {
    this.paymentApi.delete(Number(id)).subscribe({ // Assuming id is receiptId (number)
      next: () => {
        const filtered = this.paymentsSubject.value.filter((p) => p.id !== id)
        this.paymentsSubject.next(filtered)
      },
      error: (e) => {
        console.warn('Failed to delete payment in backend — state not modified locally.', e)
      }
    })
  }

  clearAll() {
    this.paymentsSubject.next([])
  }

  private loadFromStorage() {
    this.paymentApi.getAll().subscribe({
      next: (receipts) => {
        const payments = receipts.map(this.mapReceiptToPayment)
        this.paymentsSubject.next(payments)
      },
      error: (e) => {
        console.warn('Failed to load payments from backend, initializing with empty array.', e)
        this.paymentsSubject.next([]) // Initialize with empty array if backend fails
      }
    })
  }


}
