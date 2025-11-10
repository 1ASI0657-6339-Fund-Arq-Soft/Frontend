import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutComponent } from '../layout/layout.component'
import { PaymentsService } from '../../../core/services/payments.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Payment } from '../../../core/models/payment.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-familiar-payments',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit, OnDestroy {
  payments: Payment[] = []
  private sub: Subscription | null = null

  constructor(private paymentsService: PaymentsService, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser()
    this.sub = this.paymentsService.payments$.subscribe((items) => {
      if (currentUser) {
        this.payments = items.filter((p) => p.payerId === currentUser.id)
      } else {
        this.payments = []
      }
      console.log('[Familiar Payments] payments', this.payments)
    })
  }

  pay(payment: Payment) {
    const fakeReceipt = 'https://example.com/receipt/' + payment.id
    const currentUser = this.authService.getCurrentUser()
    this.paymentsService.markAsPaid(payment.id, fakeReceipt, currentUser?.name, currentUser?.id)
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
