/* AUTO-GENERATED from OpenAPI: Appointment Service */

export interface LocalTime {
  hour?: number
  minute?: number
  second?: number
  nano?: number
}

export interface AppointmentResource {
  id?: number
  residentId?: number
  doctorId?: number
  date?: string // date
  time?: string // Format: "HH:mm:ss"
  status?: string
}

export interface CreateAppointmentResource {
  residentId?: number
  doctorId?: number
  date?: string
  time?: string // Format: "HH:mm:ss"
  status?: string
}
