export interface Resident {
  id?: number
  dni?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  country?: string
  street?: string
  zipCode?: string
  birthDate?: string // ISO date
  gender?: string
  receiptId?: number
}

export interface ResidentDetails {
  id?: number
  fullName?: string
  dni?: string
}
