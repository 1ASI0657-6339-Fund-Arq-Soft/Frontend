import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PaymentApiService } from '../services/payment-api.service'
import type { ReceiptResource as Receipt } from '../models/generated/payments.types'

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-receipts-viewer',
  templateUrl: './receipts-viewer.component.html',
})
export class ReceiptsViewerComponent implements OnInit {
  receipts: Receipt[] = []
  loading = false
  error: string | null = null

  constructor(private paymentApi: PaymentApiService) {}

  ngOnInit(): void {
    this.loadAll()
  }

  loadAll() {
    this.loading = true
    this.paymentApi.getAll().subscribe({ next: (data) => { this.receipts = data; this.loading = false }, error: (e) => { this.error = e?.message ?? 'Failed to fetch receipts'; this.loading = false } })
  }
}
