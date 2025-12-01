import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { LayoutComponent } from "../layout/layout.component"
import { AuthService } from "../../../core/services/auth.service"
import { ResidentsApiService } from "../../../core/services/residents-api.service"
import { AppointmentApiService } from "../../../core/services/appointment-api.service"
import { User } from "../../../core/models/user.model"
import { Router } from "@angular/router"
import { NotificationsService } from "../../../core/services/notifications.service"
import { forkJoin } from "rxjs"

@Component({
  selector: "app-cuidador-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null

  patients: any[] = []
  patientsAssigned = 0

  // form fields for creating notification
  notifTitle = ''
  notifDesc = ''
  notifType: 'urgent' | 'info' | 'warning' | 'success' = 'info'

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationsService: NotificationsService,
    private residentsApi: ResidentsApiService,
    private appointmentApi: AppointmentApiService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
    console.log('[Dashboard Cuidador] Inicializando con datos reales de microservicios, user=', this.currentUser)
    this.loadRealData()
  }

  private loadRealData(): void {
    console.log('[Dashboard Cuidador] Cargando datos reales de residentes y citas');
    
    forkJoin({
      residents: this.residentsApi.getAll(),
      appointments: this.appointmentApi.getAll()
    }).subscribe({
      next: (data) => {
        console.log('[Dashboard Cuidador] Datos cargados:', data);
        
        // Procesar residentes como "pacientes"
        this.patients = data.residents.map(resident => {
          // Buscar la última cita del residente para determinar último chequeo
          const lastAppointment = data.appointments
            .filter(apt => apt.residentId === resident.id)
            .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())[0];
          
          return {
            id: resident.id,
            name: `${resident.firstName} ${resident.lastName}`,
            status: this.getPatientStatus(resident),
            lastCheck: lastAppointment ? this.formatTime(lastAppointment.time) : 'Sin registro'
          };
        });
        
        this.patientsAssigned = this.patients.length;
      },
      error: (error) => {
        console.error('[Dashboard Cuidador] Error al cargar datos:', error);
        this.patients = [];
        this.patientsAssigned = 0;
      }
    });
  }

  private getPatientStatus(resident: any): string {
    // Lógica simple para determinar estado basado en datos del residente
    if (resident.allergies && resident.allergies.toLowerCase().includes('crítico')) {
      return 'Requiere atención';
    }
    if (resident.medicalHistory && resident.medicalHistory.toLowerCase().includes('urgente')) {
      return 'Requiere atención';
    }
    return 'Bien';
  }

  private formatTime(time: any): string {
    if (!time) return 'N/A';
    const hour = time.hour?.toString().padStart(2, '0') || '00';
    const minute = time.minute?.toString().padStart(2, '0') || '00';
    const period = parseInt(hour) >= 12 ? 'PM' : 'AM';
    const displayHour = parseInt(hour) > 12 ? (parseInt(hour) - 12).toString() : hour;
    return `${displayHour}:${minute} ${period}`;
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  createNotification() {
    if (!this.notifTitle || !this.notifDesc) return

    console.log('[Dashboard Cuidador] creating notification', this.notifTitle, this.notifType)

    this.notificationsService.createNotification({
      title: this.notifTitle,
      description: this.notifDesc,
      type: this.notifType,
      date: new Date().toLocaleString(),
      sender: this.currentUser?.name,
    })

    // clear form
    this.notifTitle = ''
    this.notifDesc = ''
    this.notifType = 'info'
  }
}
