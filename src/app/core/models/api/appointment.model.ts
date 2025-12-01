export interface TimeOfDay {
  hour?: number
  minute?: number
  second?: number
  nano?: number
}

export interface Appointment {
  id?: number
  residentId?: number
  doctorId?: number
  date?: string // ISO date
  time?: TimeOfDay
  status?: string
}
