import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { ResidentsApiService } from '../../../core/services/residents-api.service';
import { UsersApiService } from '../../../core/services/users-api.service';
import { Observable, take, map } from "rxjs";
import type { AppointmentResource, CreateAppointmentResource } from '../../../core/models/generated/appointments.types';
import type { ResidentResource } from '../../../core/models/generated/residents.types';
import type { DoctorResource } from '../../../core/models/generated/users.types';
import { LayoutComponent } from "../layout/layout.component";

@Component({
  selector: "app-citas",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./citas.component.html",
  styleUrls: ["./citas.component.css"]
})
export class CitasComponent implements OnInit {

  appointments$!: Observable<AppointmentResource[]>;
  residents: ResidentResource[] = []
  doctors: DoctorResource[] = []
  showModal = false;
  selectedAppointment: AppointmentResource | null = null;
  appointmentForm!: FormGroup;

  constructor(
    private appointmentApi: AppointmentApiService,
    private residentsApi: ResidentsApiService,
    private usersApi: UsersApiService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    console.log('[Citas Component] Inicializando...');
    this.appointments$ = this.appointmentApi.getAll();
    
    console.log('[Citas Component] 🏥 Cargando residentes...');
    console.log('[Citas Component] URL: GET /api/v1/family-members');
    this.usersApi.getAllFamilyMembers().subscribe({
      next: (r: any) => {
        console.log('[Citas Component] Residentes cargados:', r);
        console.log('[Citas Component] Cantidad de residentes:', r.length);
        this.residents = r;
        
        if (r.length === 0) {
          console.warn('[Citas Component] No hay residentes disponibles');
        }
      },
      error: (e: any) => {
        console.error('[Citas Component] Error al cargar residentes:', e);
        console.error('[Citas Component] Status:', e.status, 'URL:', e.url);
        this.residents = [];
      }
    });
    
    console.log('[Citas Component] Cargando doctores...');
    console.log('[Citas Component] URL: GET /api/v1/doctors');
    this.usersApi.getAllDoctors().subscribe({
      next: (d: any) => {
        console.log('[Citas Component] Doctores cargados:', d);
        console.log('[Citas Component] Cantidad de doctores:', d.length);
        this.doctors = d;
        
        if (d.length === 0) {
          console.warn('[Citas Component] No hay doctores disponibles');
        }
      },
      error: (e: any) => {
        console.error('[Citas Component] Error al cargar doctores:', e);
        console.error('[Citas Component] Status:', e.status, 'URL:', e.url);
        this.doctors = [];
      }
    });
    
    this.initForm();
  }
  initForm() {
    // Obtener fecha actual en formato YYYY-MM-DD
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    
    this.appointmentForm = this.fb.group({
      residentId: [null, Validators.required],
      doctorId: [null, Validators.required],
      date: [defaultDate, Validators.required],
      timeHour: [9, Validators.required], // 9 AM por defecto
      timeMinute: [0, Validators.required],
      status: ['pending']
    })
  }
  openCreateModal() {
    this.showModal = true;
    this.selectedAppointment = null;
    
    // Reset con valores por defecto apropiados
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    
    this.appointmentForm.reset({
      residentId: null,
      doctorId: null,
      date: defaultDate,
      timeHour: 9,
      timeMinute: 0,
      status: 'pending'
    });
    
    console.log('[CitasComponent] Modal abierto con fecha:', defaultDate);
  }
  closeModal() {
    this.showModal = false;
  }
  saveAppointment() {
    if (this.appointmentForm.invalid) {
      console.log('[CitasComponent] Formulario inválido:', this.appointmentForm.errors);
      return;
    }

    const payload = this.appointmentForm.value;
    console.log('[CitasComponent] 📝 Payload raw del formulario:', payload);

    // Validar datos antes de procesar
    if (!payload.residentId || !payload.doctorId || !payload.date) {
      console.error('[CitasComponent] Faltan campos requeridos');
      return;
    }

    // Validar y formatear la hora
    const hour = parseInt(payload.timeHour) || 0;
    const minute = parseInt(payload.timeMinute) || 0;
    
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.error('[CitasComponent] Hora inválida:', { hour, minute });
      return;
    }
    
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
    
    const p: CreateAppointmentResource = {
      residentId: Number(payload.residentId),
      doctorId: Number(payload.doctorId),
      date: payload.date,
      time: timeString,
      status: payload.status || 'pending'
    }
    
    console.log('[CitasComponent] 🕐 Tiempo formateado:', timeString);
    console.log('[CitasComponent] 📡 Datos finales a enviar:', p);
    console.log('[CitasComponent] 🔍 Tipo de time:', typeof p.time);

    if (this.selectedAppointment && this.selectedAppointment.id !== undefined) {
      this.appointmentApi.update(this.selectedAppointment.id, p).subscribe(() => {
        this.refreshList();
        this.closeModal();
      })
    } else {
      this.appointmentApi.create(p).subscribe(() => { this.refreshList(); this.closeModal() })
    }
  }
  refreshList() {
    this.appointments$ = this.appointmentApi.getAll();
  }

  deleteAppointment(id: number | undefined) {
    if (!id) return;
    if (!confirm("¿Desea eliminar la cita?")) return;

    this.appointmentApi.delete(id as number).subscribe(() => this.refreshList());
  }
  
  // Funciones utilitarias para parsear tiempo
  private parseTimeString(timeStr: string | undefined): { hour: number, minute: number } {
    if (!timeStr) return { hour: 0, minute: 0 };
    
    const parts = timeStr.split(':');
    return {
      hour: parseInt(parts[0]) || 0,
      minute: parseInt(parts[1]) || 0
    };
  }

  editAppointment(appt: AppointmentResource) {
    this.selectedAppointment = appt;
    this.showModal = true;
    
    const timeData = this.parseTimeString(appt.time);
    this.appointmentForm.patchValue({ 
      residentId: appt.residentId, 
      doctorId: appt.doctorId, 
      date: appt.date, 
      timeHour: timeData.hour, 
      timeMinute: timeData.minute, 
      status: appt.status 
    });
  }

  viewAppointment(appt: AppointmentResource) {
    this.selectedAppointment = appt;
    this.showModal = true;
    
    const timeData = this.parseTimeString(appt.time);
    this.appointmentForm.patchValue({ 
      residentId: appt.residentId, 
      doctorId: appt.doctorId, 
      date: appt.date, 
      timeHour: timeData.hour, 
      timeMinute: timeData.minute, 
      status: appt.status 
    });
  }

  getResidentName(residentId: number | undefined): string {
    if (!residentId) return 'Residente no especificado';
    const resident = this.residents.find(r => r.id === residentId);
    if (!resident) return `Residente ID: ${residentId}`;
    return `${resident.firstName || ''} ${resident.lastName || ''}`.trim();
  }

  getDoctorName(doctorId: number | undefined): string {
    if (!doctorId) return 'Doctor no especificado';
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (!doctor) return `Doctor ID: ${doctorId}`;
    const firstName = doctor.fullName?.firstName || '';
    const lastName = doctor.fullName?.lastName || '';
    return `${firstName} ${lastName}`.trim() || `Doctor ID: ${doctorId}`;
  }

  finalizeAppointment(id: number | undefined) {
    if (!id) return;

    console.log(`[CitasComponent] Finalizando cita con ID: ${id}`);
    
    // Solo enviamos el status para evitar conflictos de validación en el backend
    const payload = { status: 'finalized' };
    console.log(`[CitasComponent] Actualizando solo status:`, payload);
    
    this.appointmentApi.update(id, payload).subscribe({
      next: () => {
        console.log(`[CitasComponent] Cita ${id} finalizada exitosamente`);
        this.refreshList();
      },
      error: (error) => {
        console.error(`[CitasComponent] Error al finalizar cita ${id}:`, error);
      }
    });
  }
}
