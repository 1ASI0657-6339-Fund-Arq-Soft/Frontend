export interface Receipt {
  receiptId?: number
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
