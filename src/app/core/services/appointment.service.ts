import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, delay } from 'rxjs';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [
    {
      id: 1,
      title: 'Consulta Médica - Dr. García',
      start: '2025-11-17T10:00:00',
      end: '2025-11-17T11:00:00',
      description: 'Chequeo general del paciente Juan Pérez'
    },
    {
      id: 2,
      title: 'Terapia Física',
      start: '2025-11-17T14:00:00',
      end: '2025-11-17T15:00:00',
      description: 'Sesión de rehabilitación para María López'
    },
    {
      id: 3,
      title: 'Control de Medicamentos',
      start: '2025-11-18T09:00:00',
      end: '2025-11-18T09:30:00',
      description: 'Revisión de dosis y efectos secundarios'
    },
    {
      id: 4,
      title: 'Visita a Domicilio',
      start: '2025-11-18T16:00:00',
      end: '2025-11-18T17:00:00',
      description: 'Visita programada para Carlos Rodríguez'
    }
  ];
  private appointmentsSubject = new BehaviorSubject<Appointment[]>(this.appointments);

  constructor() {}
  getAppointments(): Observable<Appointment[]> {
    return this.appointmentsSubject.asObservable();
  }

  getAppointmentById(id: number): Observable<Appointment | undefined> {
    const appointment = this.appointments.find(a => a.id === id);
    return of(appointment).pipe(delay(300));
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now()
    };
    this.appointments.push(newAppointment);
    this.appointmentsSubject.next([...this.appointments]);
    return of(newAppointment).pipe(delay(500));
  }

  updateAppointment(id: number, appointment: Appointment): Observable<Appointment> {
    const index = this.appointments.findIndex(a => a.id === id);

    if (index !== -1) {
      this.appointments[index] = { ...appointment, id };
      this.appointmentsSubject.next([...this.appointments]);
      return of(this.appointments[index]).pipe(delay(500));
    }

    throw new Error(`Cita con ID ${id} no encontrada`);
  }

  patchAppointment(id: number, patch: Partial<Appointment>): Observable<Appointment> {
    const index = this.appointments.findIndex(a => a.id === id);

    if (index !== -1) {
      const updated = { ...this.appointments[index], ...patch } as Appointment;
      this.appointments[index] = updated;
      this.appointmentsSubject.next([...this.appointments]);
      return of(updated).pipe(delay(300));
    }

    throw new Error(`Cita con ID ${id} no encontrada`);
  }

  deleteAppointment(id: number): Observable<void> {
    const index = this.appointments.findIndex(a => a.id === id);

    if (index !== -1) {
      this.appointments.splice(index, 1);
      this.appointmentsSubject.next([...this.appointments]);
      return of(void 0).pipe(delay(500));
    }

    throw new Error(`Cita con ID ${id} no encontrada`);
  }

  getAppointmentsByDateRange(startDate: Date, endDate: Date): Observable<Appointment[]> {
    const filtered = this.appointments.filter(appointment => {
      const appointmentStart = new Date(appointment.start);
      return appointmentStart >= startDate && appointmentStart <= endDate;
    });

    return of(filtered).pipe(delay(300));
  }

  searchAppointments(query: string): Observable<Appointment[]> {
    const lowerQuery = query.toLowerCase();
    const filtered = this.appointments.filter(appointment =>
      appointment.title.toLowerCase().includes(lowerQuery) ||
      appointment.description?.toLowerCase().includes(lowerQuery)
    );

    return of(filtered).pipe(delay(300));
  }
}
