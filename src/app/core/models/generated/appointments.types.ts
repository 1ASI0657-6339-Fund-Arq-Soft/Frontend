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
  time?: LocalTime
  status?: string
}

export interface CreateAppointmentResource {
  residentId?: number
  doctorId?: number
  date?: string
  time?: LocalTime
  status?: string
}
