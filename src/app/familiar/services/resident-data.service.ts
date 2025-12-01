import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, forkJoin } from 'rxjs';
import { ResidentsApiService } from '../../core/services/residents-api.service';
import { UsersApiService } from '../../core/services/users-api.service';
import { AuthService } from '../../core/services/auth.service';

export interface Residente {
  id?: string;
  nombre: string;
  edad: number;
  fechaNacimiento?: string;
  condiciones?: string;
  estadoGeneral?: string;
  ultimoChequeo?: string;
  foto?: string;
}

export interface Familiar {
  id?: string;
  usuario: string;
  correo: string;
  tipoUsuario: string;
  residenteId?: string;
  telefono?: string;
  relacion?: string;
}

export interface PerfilCompleto {
  residente: Residente;
  familiar: Familiar;
}

@Injectable({
  providedIn: 'root'
})
export class ResidentDataService {
  private perfilesSubject = new BehaviorSubject<PerfilCompleto[]>([]);
  public perfiles$: Observable<PerfilCompleto[]> = this.perfilesSubject.asObservable();

  private perfilActualSubject = new BehaviorSubject<PerfilCompleto | null>(null);
  public perfilActual$: Observable<PerfilCompleto | null> = this.perfilActualSubject.asObservable();

  constructor(
    private residentsApi: ResidentsApiService,
    private usersApi: UsersApiService,
    private authService: AuthService
  ) {
    this.cargarDatosReales();
  }

  private cargarDatosReales(): void {
    console.log('[ResidentDataService] Cargando datos reales de microservicios');
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.warn('[ResidentDataService] No hay usuario actual, no se pueden cargar residentes');
      return;
    }

    // Obtener datos del familiar actual y sus residentes
    forkJoin({
      residents: this.residentsApi.getAll(),
      familyMembers: this.usersApi.getAllFamilyMembers()
    }).subscribe({
      next: (data) => {
        console.log('[ResidentDataService] Datos cargados:', data);
        
        // Buscar el familiar actual basado en el ID del usuario
        const currentFamily = data.familyMembers.find(fm => 
          fm.id?.toString() === currentUser.id
        ) || data.familyMembers[0]; // Fallback al primer familiar si no encuentra match

        if (currentFamily && data.residents.length > 0) {
          // Crear perfiles combinando residentes con el familiar actual
          const perfiles: PerfilCompleto[] = data.residents.map(resident => ({
            residente: {
              id: resident.id?.toString(),
              nombre: `${resident.firstName || ''} ${resident.lastName || ''}`.trim(),
              edad: 0, // ResidentResource no tiene age, usar 0 por defecto
              condiciones: 'Sin condiciones registradas', // ResidentResource no tiene campos médicos
              estadoGeneral: 'Estable', // Por defecto
              ultimoChequeo: resident.birthDate || new Date().toISOString().split('T')[0] // Usar birthDate como referencia temporal
            },
            familiar: {
              id: currentFamily.id?.toString(),
              usuario: `${currentFamily.fullName?.firstName || ''} ${currentFamily.fullName?.lastName || ''}`.trim(),
              correo: currentFamily.contactEmail?.phone || '', // Usar phone como email temporal
              tipoUsuario: 'familiar',
              residenteId: resident.id?.toString(),
              telefono: currentFamily.contactEmail?.phone || '', // Usar contactEmail.phone
              relacion: currentFamily.relationship || 'Familiar'
            }
          }));

          this.perfilesSubject.next(perfiles);
          
          // Establecer el primer perfil como actual si no hay ninguno seleccionado
          if (perfiles.length > 0 && !this.perfilActualSubject.value) {
            this.perfilActualSubject.next(perfiles[0]);
          }
        }
      },
      error: (error) => {
        console.error('[ResidentDataService] Error al cargar datos reales:', error);
        // Fallback a datos locales si existen
        this.cargarDatosLocales();
      }
    });
  }

  private cargarDatosLocales(): void {
    const datosGuardados = localStorage.getItem('perfiles_residentes');
    if (datosGuardados) {
      const perfiles = JSON.parse(datosGuardados);
      this.perfilesSubject.next(perfiles);
    }
  }

  private guardarDatosLocales(): void {
    localStorage.setItem('perfiles_residentes', JSON.stringify(this.perfilesSubject.value));
  }

  crearPerfilDesdeRegistro(datosRegistro: any): string {
    const nuevoId = this.generarId();

    const residente: Residente = {
      id: nuevoId,
      nombre: datosRegistro.nombreResidente || '',
      edad: datosRegistro.edadResidente || 0,
      fechaNacimiento: datosRegistro.fechaNacimiento || '',
      condiciones: datosRegistro.condiciones || '',
      estadoGeneral: 'Estable',
      ultimoChequeo: new Date().toISOString().split('T')[0]
    };

    const familiar: Familiar = {
      id: this.generarId(),
      usuario: datosRegistro.usuario || '',
      correo: datosRegistro.correo || '',
      tipoUsuario: datosRegistro.tipoUsuario || 'Familiar',
      residenteId: nuevoId,
      telefono: datosRegistro.telefono || '',
      relacion: datosRegistro.relacion || 'Familiar'
    };

    const perfilCompleto: PerfilCompleto = { residente, familiar };

    const perfilesActuales = this.perfilesSubject.value;
    perfilesActuales.push(perfilCompleto);
    this.perfilesSubject.next(perfilesActuales);
    this.guardarDatosLocales();

    return nuevoId;
  }

  obtenerPerfilPorId(id: string): PerfilCompleto | undefined {
    return this.perfilesSubject.value.find(p => p.residente.id === id);
  }

  establecerPerfilActual(id: string): void {
    const perfil = this.obtenerPerfilPorId(id);
    this.perfilActualSubject.next(perfil || null);
  }

  actualizarResidente(residente: Residente): void {
    const perfiles = this.perfilesSubject.value;
    const index = perfiles.findIndex(p => p.residente.id === residente.id);

    if (index !== -1) {
      perfiles[index].residente = residente;
      this.perfilesSubject.next(perfiles);
      this.guardarDatosLocales();

      const perfilActual = this.perfilActualSubject.value;
      if (perfilActual && perfilActual.residente.id === residente.id) {
        this.perfilActualSubject.next(perfiles[index]);
      }
    }
  }

  actualizarFamiliar(familiar: Familiar): void {
    const perfiles = this.perfilesSubject.value;
    const index = perfiles.findIndex(p => p.familiar.id === familiar.id);

    if (index !== -1) {
      perfiles[index].familiar = familiar;
      this.perfilesSubject.next(perfiles);
      this.guardarDatosLocales();

      const perfilActual = this.perfilActualSubject.value;
      if (perfilActual && perfilActual.familiar.id === familiar.id) {
        this.perfilActualSubject.next(perfiles[index]);
      }
    }
  }
  obtenerTodosPerfiles(): PerfilCompleto[] {
    return this.perfilesSubject.value;
  }

  eliminarPerfil(id: string): void {
    const perfiles = this.perfilesSubject.value.filter(p => p.residente.id !== id);
    this.perfilesSubject.next(perfiles);
    this.guardarDatosLocales();
  }

  private generarId(): string {
    return 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  limpiarPerfilActual(): void {
    this.perfilActualSubject.next(null);
  }
}
