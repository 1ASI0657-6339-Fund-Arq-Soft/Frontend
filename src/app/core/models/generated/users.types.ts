/* AUTO-GENERATED from OpenAPI: Users Service */

export interface Address {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface ContactInfo {
  phone?: string
  address?: Address
}

export interface FullName {
  firstName?: string
  lastName?: string
}

export interface DoctorResource {
  id?: number
  licenseNumber?: string
  specialty?: string
  fullName?: FullName
  contactInfo?: ContactInfo
}

export interface CreateDoctorResource {
  licenseNumber?: string
  specialty?: string
  fullName?: FullName
  contactInfo?: ContactInfo
}

export interface UpdateDoctorResource {
  licenseNumber?: string
  specialty?: string
  fullName?: FullName
  contactInfo?: ContactInfo
}

export interface CarerResource {
  id?: number
  dni?: string
  fullName?: string
  email?: string
}

export interface CreateCarerResource {
  dni?: string
  fullName?: string
  email?: string
  password?: string
}

export interface FamilyMemberResource {
  id?: number
  relationship?: string
  linkedResidentId?: number
  fullName?: FullName
  contactEmail?: ContactInfo
}

export interface CreateFamilyMemberResource {
  relationship?: string
  linkedResidentId?: number
  fullName?: FullName
}

export interface UpdateFamilyMemberResource {
  relationship?: string
  linkedResidentId?: number
  fullName?: FullName
}
