import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import type { Payment, PaymentStatus } from '../models/payment.model'

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private paymentsSubject = new BehaviorSubject<Payment[]>([])
  public payments$ = this.paymentsSubject.asObservable()

  constructor() {
    this.loadFromStorage()
  }

  getPayments(): Payment[] {
    return this.paymentsSubject.value
  }

  createRequest(payload: Omit<Payment, 'id' | 'createdAt' | 'status'>): Payment {
    const p: Payment = {
      id: this.generateId(),
      ...payload,
      status: ('pending' as PaymentStatus),
      createdAt: new Date().toISOString(),
    }
    const current = [p, ...this.paymentsSubject.value]
    this.paymentsSubject.next(current)
    this.saveToStorage(current)
    return p
  }

  markAsPaid(id: string, receiptUrl?: string, payer?: string, payerId?: string): void {
    const updated = this.paymentsSubject.value.map((p) =>
      p.id === id ? ({ ...p, status: ('paid' as PaymentStatus), receiptUrl, payer, payerId } as Payment) : p
    )
    this.paymentsSubject.next(updated as Payment[])
    this.saveToStorage(updated as Payment[])
  }

  updatePayment(id: string, patch: Partial<Payment>): Payment | null {
    const updated = this.paymentsSubject.value.map((p) => (p.id === id ? ({ ...p, ...patch } as Payment) : p))
    this.paymentsSubject.next(updated as Payment[])
    this.saveToStorage(updated as Payment[])
    return updated.find((p) => p.id === id) || null
  }

  deletePayment(id: string): void {
    const filtered = this.paymentsSubject.value.filter((p) => p.id !== id)
    this.paymentsSubject.next(filtered)
    this.saveToStorage(filtered)
  }

  clearAll() {
    this.paymentsSubject.next([])
    localStorage.removeItem('payments')
  }

  private saveToStorage(items: Payment[]) {
    try {
      localStorage.setItem('payments', JSON.stringify(items))
    } catch (e) {
      console.error('Error saving payments:', e)
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem('payments')
      if (raw) {
        const parsed = JSON.parse(raw) as Payment[]
        this.paymentsSubject.next(parsed)
      } else {
        // seed with example payments
        const seed: Payment[] = [
          {
            id: this.generateId(),
            period: 'Oct, 2025',
            concept: 'Cuidado Mensual + Servicios',
            amount: 'S/. 1,200.00',
            status: ('paid' as PaymentStatus),
            createdAt: new Date().toISOString(),
            requester: 'Cuidador A',
            requesterId: '2',
            payer: 'Juan Familiar',
            payerId: '1',
          },
          {
            id: this.generateId(),
            period: 'Nov, 2025',
            concept: 'Cuidado Mensual + Servicios',
            amount: 'S/. 1,200.00',
            status: ('due' as PaymentStatus),
            createdAt: new Date().toISOString(),
            requester: 'Cuidador A',
            requesterId: '2',
          },
        ]
        this.paymentsSubject.next(seed)
        this.saveToStorage(seed)
      }
    } catch (e) {
      console.error('Error loading payments:', e)
      this.paymentsSubject.next([])
    }
  }

  private generateId(): string {
    return 'pay_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
  }
}
