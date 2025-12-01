/* AUTO-GENERATED from OpenAPI: Payment Microservice */

export interface ReceiptResource {
  receiptId?: number
  issueDate?: string // date-time
  dueDate?: string // date-time
  totalAmount?: number
  status?: boolean
  residentId?: number
  paymentId?: number
  paymentDate?: string // date-time
  amountPaid?: number
  paymentMethod?: number
  type?: string
}

export interface CreateReceiptResource {
  issueDate?: string
  dueDate?: string
  totalAmount?: number
  status?: boolean
  residentId?: number
  paymentId?: number
  paymentDate?: string
  amountPaid?: number
  paymentMethod?: number
  type?: string
}

export interface UpdateReceiptResource extends CreateReceiptResource {}
