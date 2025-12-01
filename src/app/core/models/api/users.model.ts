export interface Address {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface FullName {
  firstName?: string
  lastName?: string
}

export interface ContactInfo {
  phone?: string
  address?: Address
}

export interface Doctor {
  id?: number
  licenseNumber?: string
  specialty?: string
  fullName?: FullName
  contactInfo?: ContactInfo
}

export interface Carer {
  id?: number
  dni?: string
  fullName?: string
  email?: string
}

export interface FamilyMember {
  id?: number
  relationship?: string
  linkedResidentId?: number
  fullName?: FullName
  contactEmail?: ContactInfo | null
}
