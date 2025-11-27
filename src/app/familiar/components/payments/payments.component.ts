import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../../services/stripe.service';

interface MedicalBill {
  id: string;
  residentName: string;
  doctorName: string;
  date: Date;
  service: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: Date;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit, OnDestroy {
  medicalBills: MedicalBill[] = [
    {
      id: 'REC-001',
      residentName: 'María González',
      doctorName: 'Dr. Carlos Ramírez',
      date: new Date('2024-11-20'),
      service: 'Consulta General',
      description: 'Consulta médica general de rutina y revisión de signos vitales',
      amount: 80.00,
      status: 'pending',
      dueDate: new Date('2024-12-05')
    },
    {
      id: 'REC-002',
      residentName: 'María González',
      doctorName: 'Dra. Ana Torres',
      date: new Date('2024-11-18'),
      service: 'Análisis de Laboratorio',
      description: 'Exámenes de sangre completos y análisis de glucosa',
      amount: 120.00,
      status: 'pending',
      dueDate: new Date('2024-12-03')
    },
    {
      id: 'REC-003',
      residentName: 'María González',
      doctorName: 'Dr. Luis Mendoza',
      date: new Date('2024-11-10'),
      service: 'Fisioterapia',
      description: 'Sesión de fisioterapia para movilidad de rodilla',
      amount: 50.00,
      status: 'paid',
      dueDate: new Date('2024-11-25')
    }
  ];

  selectedBill: MedicalBill | null = null;
  showPaymentModal = false;

  cardholderName = '';
  isProcessing = false;
  paymentSuccess = false;
  paymentError = '';

  constructor(private stripeService: StripeService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.stripeService.initializeStripe();
    } catch (error) {
      console.error('Error inicializando Stripe:', error);
      this.paymentError = 'Error al cargar el sistema de pagos';
    }
  }

  ngOnDestroy(): void {
    this.stripeService.destroyCardElement();
  }

  get pendingBills() {
    return this.medicalBills.filter(b => b.status === 'pending');
  }

  get paidBills() {
    return this.medicalBills.filter(b => b.status === 'paid');
  }

  get totalPending() {
    return this.pendingBills.reduce((sum, bill) => sum + bill.amount, 0);
  }

  selectBillToPay(bill: MedicalBill): void {
    if (bill.status !== 'pending') return;

    this.selectedBill = bill;
    this.showPaymentModal = true;
    this.paymentError = '';
    this.paymentSuccess = false;

    setTimeout(() => {
      this.stripeService.createCardElement('card-element');
    }, 100);
  }

  closeModal(): void {
    this.showPaymentModal = false;
    this.selectedBill = null;
    this.cardholderName = '';
    this.stripeService.destroyCardElement();
  }

  async processPayment(): Promise<void> {
    if (!this.selectedBill || !this.cardholderName.trim()) {
      this.paymentError = 'Por favor completa todos los campos';
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';

    try {
      const { clientSecret } = await this.stripeService
        .createPaymentIntent(Math.round(this.selectedBill.amount * 100))
        .toPromise();

      const paymentIntent = await this.stripeService.processPayment(
        clientSecret,
        {
          name: this.cardholderName,
          email: 'familiar@example.com',
          address: {
            line1: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US'
          }
        }
      );

      if (paymentIntent.status === 'succeeded') {
        this.paymentSuccess = true;
        // Actualizar estado del recibo
        const billIndex = this.medicalBills.findIndex(b => b.id === this.selectedBill!.id);
        if (billIndex !== -1) {
          this.medicalBills[billIndex].status = 'paid';
        }

        setTimeout(() => {
          this.closeModal();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error procesando pago:', error);
      this.paymentError = error.message || 'Error al procesar el pago. Por favor intenta de nuevo.';
    } finally {
      this.isProcessing = false;
    }
  }

  getBillStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  }

  getBillStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      default: return status;
    }
  }
}
