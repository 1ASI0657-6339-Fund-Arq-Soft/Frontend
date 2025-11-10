import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LayoutComponent } from '../layout/layout.component'
import { PaymentsService } from '../../../core/services/payments.service'
import { NotificationsService } from '../../../core/services/notifications.service'
import { AuthService } from '../../../core/services/auth.service'
import type { Payment } from '../../../core/models/payment.model'
import type { User } from '../../../core/models/user.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-cuidador-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit, OnDestroy {
  payments: Payment[] = []
  familiares: User[] = []
  selectedFamiliaId: string | null = null
  period = ''
  concept = ''
  amount = ''
  private sub: Subscription | null = null

  constructor(
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.familiares = this.authService.getFamiliares()
    this.sub = this.paymentsService.payments$.subscribe((items) => {
      this.payments = items
      console.log('[Cuidador Payments] payments', items)
    })
  }

  createRequest() {
    if (!this.period || !this.concept || !this.amount || !this.selectedFamiliaId) return
    const currentUser = this.authService.getCurrentUser()
    const created = this.paymentsService.createRequest({
      period: this.period,
      concept: this.concept,
      amount: this.amount,
      requester: currentUser?.name || 'Cuidador',
      requesterId: currentUser?.id,
      payerId: this.selectedFamiliaId,
    })

    // notify the familiar (recipient only)
    this.notificationsService.createNotification({
      title: 'Nueva solicitud de pago',
      description: `${created.requester} solicita ${created.amount} por ${created.concept} (${created.period})`,
      type: 'info',
      date: created.createdAt || new Date().toLocaleString(),
      sender: created.requester,
      recipientId: this.selectedFamiliaId,
    })

    this.period = ''
    this.concept = ''
    this.amount = ''
    this.selectedFamiliaId = null
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
