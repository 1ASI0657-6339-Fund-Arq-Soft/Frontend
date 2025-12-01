export interface User {
  id: string
  email: string
  name: string
  role: "familiar" | "cuidador" | "doctor"
  familyMemberId?: number
  linkedResidentId?: number
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: "familiar" | "cuidador" | "doctor"
  // Campos del residente (cuando es familiar)
  residentName?: string
  residentAge?: string  
  residentBirthDate?: string
  residentCondition?: string
  residentDni?: string
  residentGender?: string
  // Campos de dirección del residente
  residentStreet?: string
  residentCity?: string
  residentState?: string
  residentCountry?: string
  residentZipCode?: string
  // Campos del familiar
  phone?: string
  relationship?: string
  // Campos del doctor
  licenseNumber?: string
  specialty?: string
  doctorPhone?: string
  doctorStreet?: string
  doctorCity?: string
  doctorState?: string
  doctorCountry?: string
  doctorZipCode?: string
}
