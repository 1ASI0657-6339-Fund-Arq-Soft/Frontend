/* AUTO-GENERATED from OpenAPI: Residents Microservice */

export interface ResidentResource {
  id?: number
  dni?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  country?: string
  street?: string
  zipCode?: string
  birthDate?: string // date-time
  gender?: string
  receiptId?: number
}

export interface CreateResidentResource {
  dni?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  country?: string
  street?: string
  zipCode?: string
  birthDate?: string // date-time
  gender?: string
  receiptId?: number
}

export interface ResidentDetailsResource {
  id?: number
  fullName?: string
  dni?: string
}
