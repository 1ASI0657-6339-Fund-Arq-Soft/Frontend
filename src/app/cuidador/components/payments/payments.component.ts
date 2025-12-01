import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LayoutComponent } from '../layout/layout.component'
import { PaymentsService } from '../../../core/services/payments.service'
import { NotificationsService } from '../../../core/services/notifications.service'
import { AuthService } from '../../../core/services/auth.service'
import { UsersApiService } from '../../../core/services/users-api.service'
import { API_CONFIG } from '../../../core/config/api-config'
import { StripeService } from '../../../core/services/stripe.service'
import type { Payment } from '../../../core/models/payment.model'
import type { User } from '../../../core/models/user.model'
import { Subscription } from 'rxjs'

import type { FamilyMemberResource } from '../../../core/models/generated/users.types'
// ... (other imports)

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
  loadingFamiliares: boolean = false
  backendErrorFamiliares: string | null = null
  selectedFamiliaId: string | null = null
  period: string = ''
  concept: string = ''
  amount: string = ''
  private sub: Subscription | null = null

  private mapFamilyMemberResourceToUser(fm: FamilyMemberResource): User {
    const firstName = fm.fullName?.firstName ?? '';
    const lastName = fm.fullName?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const relationship = fm.relationship ?? 'Familiar';
    
    return {
      id: String(fm.id ?? ''),
      email: fm.contactEmail?.phone ?? '', // Usar phone como email placeholder temporalmente
      name: fullName ? `${fullName} (${relationship})` : `ID: ${fm.id} (${relationship})`,
      role: 'familiar',
    }
  }

  constructor(
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private stripeService: StripeService,
    private usersApi: UsersApiService,
  ) {}

  ngOnInit(): void {
    console.log('[Payments Component] 🚀 Inicializando, cargando familiares...');
    console.log('[Payments Component] URL: GET /api/v1/family-members');
    this.loadingFamiliares = true
    this.usersApi.getAllFamilyMembers().subscribe({
      next: (list) => {
        console.log('[Payments Component] ✅ Familiares raw del microservicio:', list);
        console.log('[Payments Component] Cantidad recibida:', list.length);
        this.familiares = list.map(fm => this.mapFamilyMemberResourceToUser(fm))
        console.log('[Payments Component] ✅ Familiares mapeados:', this.familiares);
        this.loadingFamiliares = false
        
        if (this.familiares.length === 0) {
          console.warn('[Payments Component] ⚠️ No hay familiares disponibles');
        }
      },
      error: (e) => { 
        console.error('[Payments Component] ❌ Error detallado al cargar familiares:', e);
        console.error('[Payments Component] Status:', e.status);
        console.error('[Payments Component] Message:', e.message);
        console.error('[Payments Component] URL:', e.url);
        this.backendErrorFamiliares = e?.message ?? 'Failed to load family members'; 
        this.loadingFamiliares = false; 
        this.familiares = [] 
      }
    })
    this.sub = this.paymentsService.payments$.subscribe((items) => {
      this.payments = items
      console.log('[Cuidador Payments] payments', items)
    })
  }

  createRequest() {
    if (!this.period || !this.concept || !this.amount || !this.selectedFamiliaId) return
    const currentUser = this.authService.getCurrentUser()
    this.paymentsService.createRequest({
      period: this.period,
      concept: this.concept,
      amount: this.amount,
      requester: currentUser?.name || 'Cuidador',
      requesterId: currentUser?.id,
      payerId: this.selectedFamiliaId,
    }).subscribe({
      next: (created: Payment) => {
        // notify the familiar (recipient only) once backend confirms
        this.notificationsService.createNotification({
          title: 'Nueva solicitud de pago',
          description: `${created.requester} solicita ${created.amount} por ${created.concept} (${created.period})`,
          type: 'info',
          date: created.createdAt || new Date().toLocaleString(),
          sender: created.requester,
          recipientId: this.selectedFamiliaId ?? undefined,
        })
      },
      error: (e: any) => {
        console.error('Failed to create payment', e)
        alert('Error creando solicitud de pago: ' + (e?.message ?? String(e)))
      }
    })

    this.period = ''
    this.concept = ''
    this.amount = ''
    this.selectedFamiliaId = null
  }

  editPayment(payment: Payment) {
    const newAmount = prompt('Nuevo importe', payment.amount) || payment.amount
    this.paymentsService.updatePayment(payment.id, { amount: newAmount })
  }

  deletePayment(payment: Payment) {
    if (!confirm('¿Eliminar pago?')) return
    this.paymentsService.deletePayment(payment.id)
    this.notificationsService.createNotification({
      title: 'Pago eliminado',
      description: `Solicitud ${payment.concept} eliminada.`,
      type: 'info',
      date: new Date().toLocaleString(),
      sender: this.authService.getCurrentUser()?.name || 'Cuidador',
      recipientId: payment.payerId,
    })
  }

  payNow(payment: Payment) {
    // call stripe mock service, then mark as paid with receipt
    this.stripeService.createCheckoutSession(payment.amount, payment.concept).subscribe((res) => {
      this.paymentsService.markAsPaid(payment.id, res.receiptUrl, payment.payer)
      alert('Pago realizado. Recibo: ' + res.receiptUrl)
    })
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
