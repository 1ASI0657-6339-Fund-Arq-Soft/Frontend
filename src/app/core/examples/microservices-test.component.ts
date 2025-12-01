import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ResidentsApiService, 
  AppointmentApiService, 
  PaymentApiService, 
  NotificationApiService, 
  FoodApiService, 
  UsersApiService 
} from '../../core/services';

@Component({
  selector: 'app-microservices-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="microservices-test">
      <h2>Pruebas de Microservicios</h2>
      
      <div class="test-section">
        <h3>Residentes</h3>
        <button (click)="testResidents()" [disabled]="loading.residents">
          {{ loading.residents ? 'Cargando...' : 'Probar Residentes' }}
        </button>
        <div *ngIf="results.residents" class="result">
          <strong>Resultado:</strong> {{ results.residents }}
        </div>
      </div>

      <div class="test-section">
        <h3>Citas</h3>
        <button (click)="testAppointments()" [disabled]="loading.appointments">
          {{ loading.appointments ? 'Cargando...' : 'Probar Citas' }}
        </button>
        <div *ngIf="results.appointments" class="result">
          <strong>Resultado:</strong> {{ results.appointments }}
        </div>
      </div>

      <div class="test-section">
        <h3>Pagos</h3>
        <button (click)="testPayments()" [disabled]="loading.payments">
          {{ loading.payments ? 'Cargando...' : 'Probar Pagos' }}
        </button>
        <div *ngIf="results.payments" class="result">
          <strong>Resultado:</strong> {{ results.payments }}
        </div>
      </div>

      <div class="test-section">
        <h3>Notificaciones</h3>
        <button (click)="testNotifications()" [disabled]="loading.notifications">
          {{ loading.notifications ? 'Cargando...' : 'Probar Notificaciones' }}
        </button>
        <div *ngIf="results.notifications" class="result">
          <strong>Resultado:</strong> {{ results.notifications }}
        </div>
      </div>

      <div class="test-section">
        <h3>Alimentos</h3>
        <button (click)="testFood()" [disabled]="loading.food">
          {{ loading.food ? 'Cargando...' : 'Probar Alimentos' }}
        </button>
        <div *ngIf="results.food" class="result">
          <strong>Resultado:</strong> {{ results.food }}
        </div>
      </div>

      <div class="test-section">
        <h3>Usuarios</h3>
        <button (click)="testUsers()" [disabled]="loading.users">
          {{ loading.users ? 'Cargando...' : 'Probar Usuarios' }}
        </button>
        <div *ngIf="results.users" class="result">
          <strong>Resultado:</strong> {{ results.users }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .microservices-test {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    
    .test-section h3 {
      margin-top: 0;
      color: #333;
    }
    
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    
    button:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .result {
      margin-top: 15px;
      padding: 10px;
      background-color: #e7f3ff;
      border-left: 4px solid #007bff;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
    }
  `]
})
export class MicroservicesTestComponent implements OnInit {
  loading = {
    residents: false,
    appointments: false,
    payments: false,
    notifications: false,
    food: false,
    users: false
  };

  results = {
    residents: '',
    appointments: '',
    payments: '',
    notifications: '',
    food: '',
    users: ''
  };

  constructor(
    private residentsApi: ResidentsApiService,
    private appointmentsApi: AppointmentApiService,
    private paymentsApi: PaymentApiService,
    private notificationsApi: NotificationApiService,
    private foodApi: FoodApiService,
    private usersApi: UsersApiService
  ) {}

  ngOnInit(): void {
    console.log('[MicroservicesTestComponent] Componente de prueba inicializado');
  }

  testResidents(): void {
    this.loading.residents = true;
    this.results.residents = '';
    
    this.residentsApi.getAll().subscribe({
      next: (residents) => {
        this.results.residents = `✅ Éxito: Se obtuvieron ${residents.length} residentes`;
        this.loading.residents = false;
      },
      error: (error) => {
        this.results.residents = `❌ Error: ${error.message || error}`;
        this.loading.residents = false;
      }
    });
  }

  testAppointments(): void {
    this.loading.appointments = true;
    this.results.appointments = '';
    
    this.appointmentsApi.getAll().subscribe({
      next: (appointments) => {
        this.results.appointments = `✅ Éxito: Se obtuvieron ${appointments.length} citas`;
        this.loading.appointments = false;
      },
      error: (error) => {
        this.results.appointments = `❌ Error: ${error.message || error}`;
        this.loading.appointments = false;
      }
    });
  }

  testPayments(): void {
    this.loading.payments = true;
    this.results.payments = '';
    
    this.paymentsApi.getAll().subscribe({
      next: (payments) => {
        this.results.payments = `✅ Éxito: Se obtuvieron ${payments.length} pagos`;
        this.loading.payments = false;
      },
      error: (error) => {
        this.results.payments = `❌ Error: ${error.message || error}`;
        this.loading.payments = false;
      }
    });
  }

  testNotifications(): void {
    this.loading.notifications = true;
    this.results.notifications = '';
    
    this.notificationsApi.getAll().subscribe({
      next: (notifications) => {
        this.results.notifications = `✅ Éxito: Se obtuvieron ${notifications.length} notificaciones`;
        this.loading.notifications = false;
      },
      error: (error) => {
        this.results.notifications = `❌ Error: ${error.message || error}`;
        this.loading.notifications = false;
      }
    });
  }

  testFood(): void {
    this.loading.food = true;
    this.results.food = '';
    
    this.foodApi.getAll().subscribe({
      next: (foodEntries) => {
        this.results.food = `✅ Éxito: Se obtuvieron ${foodEntries.length} entradas de alimentos`;
        this.loading.food = false;
      },
      error: (error) => {
        this.results.food = `❌ Error: ${error.message || error}`;
        this.loading.food = false;
      }
    });
  }

  testUsers(): void {
    this.loading.users = true;
    this.results.users = '';
    
    // Probar todos los tipos de usuarios
    Promise.all([
      this.usersApi.getAllDoctors().toPromise(),
      this.usersApi.getAllCarers().toPromise(),
      this.usersApi.getAllFamilyMembers().toPromise()
    ]).then(([doctors, carers, families]) => {
      const doctorsCount = doctors?.length || 0;
      const carersCount = carers?.length || 0;
      const familiesCount = families?.length || 0;
      
      this.results.users = `✅ Éxito: Doctores: ${doctorsCount}, Cuidadores: ${carersCount}, Familiares: ${familiesCount}`;
      this.loading.users = false;
    }).catch((error) => {
      this.results.users = `❌ Error: ${error.message || error}`;
      this.loading.users = false;
    });
  }
}