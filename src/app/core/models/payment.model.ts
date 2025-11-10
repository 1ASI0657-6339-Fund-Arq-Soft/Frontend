export type PaymentStatus = 'paid' | 'due' | 'pending'

export interface Payment {
  id: string
  period: string
  concept: string
  amount: string
  status: PaymentStatus
  createdAt?: string
  requester?: string // nombre del solicitante
  requesterId?: string // id del cuidador que solicita
  payer?: string // quien pagó (familiar)
  payerId?: string // id del familiar que pagó
  receiptUrl?: string // link al comprobante
}
