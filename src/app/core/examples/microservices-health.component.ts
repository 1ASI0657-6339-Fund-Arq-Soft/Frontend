import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-microservices-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>🔍 Diagnóstico de Microservicios</h2>
      
      <div style="margin: 20px 0;">
        <button (click)="testAllServices()" 
                style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px;">
          🚀 Probar Todos los Servicios
        </button>
      </div>

      <div *ngFor="let result of healthResults" 
           [style.color]="result.status === 'OK' ? 'green' : 'red'"
           style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        
        <strong>{{result.service}}</strong> ({{result.url}})
        <br>
        <span>Status: {{result.status}}</span>
        <span *ngIf="result.error"> - Error: {{result.error}}</span>
        <span *ngIf="result.data"> - Data: {{result.data}}</span>
      </div>
    </div>
  `
})
export class MicroservicesHealthComponent implements OnInit {
  healthResults: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  testAllServices(): void {
    this.healthResults = [];
    
    const services = [
      { name: 'IAM Service', url: '/api/v1/authentication/health', port: 8080 },
      { name: 'Residents Service', url: '/api/v1/residents', port: 8081 },
      { name: 'Payments Service', url: '/api/v1/receipts', port: 8082 },
      { name: 'Users Service (Familiares)', url: '/api/v1/family-members', port: 8083 },
      { name: 'Users Service (Doctores)', url: '/api/v1/doctors', port: 8083 },
      { name: 'Notifications Service', url: '/api/v1/notifications', port: 8084 },
      { name: 'Appointments Service', url: '/api/v1/appointments', port: 8085 },
      { name: 'Nutrition Service', url: '/api/v1/food-entries', port: 8086 }
    ];

    services.forEach(service => {
      this.http.get(service.url).subscribe({
        next: (data: any) => {
          this.healthResults.push({
            service: service.name,
            url: service.url,
            status: 'OK ✅',
            data: Array.isArray(data) ? `${data.length} items` : 'Response received',
            error: null
          });
        },
        error: (error) => {
          this.healthResults.push({
            service: service.name,
            url: service.url,
            status: 'ERROR ❌',
            data: null,
            error: `${error.status} - ${error.statusText || error.message}`
          });
        }
      });
    });
  }
}