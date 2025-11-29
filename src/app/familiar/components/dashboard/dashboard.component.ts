import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ResidentDataService, PerfilCompleto } from '../../services/resident-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  perfilActual: PerfilCompleto | null = null;

  proximasCitas = [
    {
      fecha: '01-15',
      tipo: 'Consulta Médica',
      profesional: 'Dr. Juan Pérez',
      hora: '10:00 AM'
    },
    {
      fecha: '01-18',
      tipo: 'Terapia Física',
      profesional: 'Lic. María González',
      hora: '2:00 PM'
    }
  ];

  estadisticas = {
    proximasCitas: 3,
    notificaciones: 7,
    paginasPendientes: 1
  };

  private subscription = new Subscription();

  constructor(private residentDataService: ResidentDataService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.residentDataService.perfilActual$.subscribe(perfil => {
        this.perfilActual = perfil;

        if (!perfil) {
          const perfiles = this.residentDataService.obtenerTodosPerfiles();
          if (perfiles.length > 0) {
            this.residentDataService.establecerPerfilActual(perfiles[0].residente.id!);
          }
        }
      })
    );
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
