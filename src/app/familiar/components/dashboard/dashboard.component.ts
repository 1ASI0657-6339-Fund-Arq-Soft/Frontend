import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ResidentDataService, PerfilCompleto } from '../../services/resident-data.service';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { PaymentApiService } from '../../../core/services/payment-api.service';
import { Subscription, forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import type { AppointmentResource } from '../../../core/models/generated/appointments.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  perfilActual: PerfilCompleto | null = null;

  proximasCitas: any[] = [];

  estadisticas = {
    proximasCitas: 0,
    notificaciones: 0,
    paginasPendientes: 0
  };

  private subscription = new Subscription();

  constructor(
    private residentDataService: ResidentDataService,
    private appointmentApi: AppointmentApiService,
    private notificationApi: NotificationApiService,
    private paymentApi: PaymentApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('[Dashboard Familiar] Inicializando con datos reales de microservicios');
    
    this.subscription.add(
      this.residentDataService.perfilActual$.subscribe(perfil => {
        this.perfilActual = perfil;

        if (!perfil) {
          const perfiles = this.residentDataService.obtenerTodosPerfiles();
          if (perfiles.length > 0) {
            this.residentDataService.establecerPerfilActual(perfiles[0].residente.id!);
          }
        }
        
        // Cargar datos reales cuando se selecciona un perfil
        if (perfil) {
          this.loadRealData();
        }
      })
    );

    // Cargar datos iniciales
    this.loadRealData();
  }

  private loadRealData(): void {
    console.log('[Dashboard Familiar] Cargando datos reales de microservicios');
    
    // Obtener datos en paralelo de todos los microservicios
    forkJoin({
      appointments: this.appointmentApi.getAll(),
      notifications: this.notificationApi.getAll(),
      payments: this.paymentApi.getAll()
    }).subscribe({
      next: (data) => {
        console.log('[Dashboard Familiar] Datos cargados:', data);
        
        // Procesar citas próximas
        this.processAppointments(data.appointments);
        
        // Actualizar estadísticas
        this.estadisticas = {
          proximasCitas: this.proximasCitas.length,
          notificaciones: data.notifications?.length || 0,
          paginasPendientes: data.payments?.filter(p => !p.status).length || 0
        };
      },
      error: (error) => {
        console.error('[Dashboard Familiar] Error al cargar datos:', error);
        // Mantener valores por defecto en caso de error
        this.estadisticas = {
          proximasCitas: 0,
          notificaciones: 0,
          paginasPendientes: 0
        };
      }
    });
  }

  private processAppointments(appointments: AppointmentResource[]): void {
    // Filtrar y formatear las próximas citas
    const now = new Date();
    const upcomingAppointments = appointments
      .filter(apt => {
        if (!apt.date) return false;
        const aptDate = new Date(apt.date);
        return aptDate >= now; // Solo citas futuras
      })
      .sort((a, b) => {
        const dateA = new Date(a.date!);
        const dateB = new Date(b.date!);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3); // Solo las próximas 3

    this.proximasCitas = upcomingAppointments.map(apt => ({
      fecha: this.formatAppointmentDate(apt.date!),
      tipo: 'Consulta Médica', // Por defecto, se podría agregar campo tipo en el backend
      profesional: `Doctor ID: ${apt.doctorId}`, // Se podría hacer join con users service
      hora: this.formatAppointmentTime(apt.time)
    }));
  }

  private formatAppointmentDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  private formatAppointmentTime(time: any): string {
    if (!time) return '00:00';
    const hour = time.hour?.toString().padStart(2, '0') || '00';
    const minute = time.minute?.toString().padStart(2, '0') || '00';
    return `${hour}:${minute}`;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get nombreResidente(): string {
    return this.perfilActual?.residente.nombre || 'Residente';
  }

  get edadResidente(): number {
    return this.perfilActual?.residente.edad || 0;
  }

  get estadoGeneral(): string {
    return this.perfilActual?.residente.estadoGeneral || 'Estable';
  }

  get ultimoChequeo(): string {
    if (!this.perfilActual?.residente.ultimoChequeo) {
      return new Date().toISOString().split('T')[0];
    }
    return this.perfilActual.residente.ultimoChequeo;
  }

  get condiciones(): string {
    return this.perfilActual?.residente.condiciones || 'Sin condiciones registradas';
  }

  getEstadoClass(): string {
    const estado = this.estadoGeneral;
    if (estado === 'Estable') return 'estado-estable';
    if (estado === 'Requiere Atención') return 'estado-atencion';
    if (estado === 'Crítico') return 'estado-critico';
    if (estado === 'En Recuperación') return 'estado-recuperacion';
    return 'estado-estable';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No registrado';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
