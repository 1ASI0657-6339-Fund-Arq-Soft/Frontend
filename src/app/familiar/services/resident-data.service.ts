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
    
    console.log('[ResidentDataService] Usuario actual completo:', currentUser);
    console.log('[ResidentDataService] familyMemberId:', currentUser.familyMemberId);
    console.log('[ResidentDataService] linkedResidentId:', currentUser.linkedResidentId);

    // Obtener datos del familiar actual y sus residentes
    forkJoin({
      residents: this.residentsApi.getAll(),
      familyMembers: this.usersApi.getAllFamilyMembers()
    }).subscribe({
      next: (data) => {
        console.log('[ResidentDataService] Datos cargados:', data);
        console.log('[ResidentDataService] Usuario actual:', currentUser);
        
        // Buscar el familiar actual usando familyMemberId del usuario
        const currentFamily = data.familyMembers.find(fm => 
          fm.id?.toString() === currentUser.familyMemberId?.toString()
        );
        
        console.log('[ResidentDataService] Familiar encontrado:', currentFamily);

        if (currentFamily) {
          // Filtrar solo el residente vinculado a este familiar
          const linkedResident = data.residents.find(resident => 
            resident.id?.toString() === currentFamily.linkedResidentId?.toString()
          );
          
          console.log('[ResidentDataService] Residente vinculado encontrado:', linkedResident);
          console.log('[ResidentDataService] Datos específicos del residente:');
          console.log('- ID:', linkedResident?.id);
          console.log('- Nombre:', linkedResident?.firstName, linkedResident?.lastName);
          console.log('- Fecha nacimiento (original):', linkedResident?.birthDate);
          console.log('- DNI:', linkedResident?.dni);
          console.log('- Género:', linkedResident?.gender);
          console.log('- Dirección:', linkedResident?.street, linkedResident?.city);
          
          if (linkedResident) {
            // Crear perfil del residente vinculado
            const perfiles: PerfilCompleto[] = [{
              residente: {
                id: linkedResident.id?.toString(),
                nombre: `${linkedResident.firstName || ''} ${linkedResident.lastName || ''}`.trim(),
                edad: this.calcularEdad(linkedResident.birthDate),
                fechaNacimiento: linkedResident.birthDate,
                condiciones: '',
                estadoGeneral: '',
                ultimoChequeo: ''
              },
              familiar: {
                id: currentFamily.id?.toString(),
                usuario: `${currentFamily.fullName?.firstName || ''} ${currentFamily.fullName?.lastName || ''}`.trim(),
                correo: currentFamily.contactEmail?.phone || 'Sin correo registrado',
                tipoUsuario: 'familiar',
                residenteId: linkedResident.id?.toString(),
                telefono: currentFamily.contactEmail?.phone || '',
                relacion: currentFamily.relationship || 'Familiar'
              }
            }];
            
            this.perfilesSubject.next(perfiles);
            this.perfilActualSubject.next(perfiles[0]);
            
            console.log('[ResidentDataService] Perfil cargado exitosamente:', perfiles[0]);
          } else {
            console.warn('[ResidentDataService] No se encontró el residente vinculado al familiar');
            this.perfilesSubject.next([]);
          }
        } else {
          console.warn('[ResidentDataService] No se encontró el familiar actual');
          this.perfilesSubject.next([]);
        }
      },
      error: (error) => {
        console.error('[ResidentDataService] Error al cargar datos:', error);
        this.perfilesSubject.next([]);
      }
    });
  }
  
  private calcularEdad(birthDate?: string): number {
    console.log('[ResidentDataService] Calculando edad para fecha:', birthDate);
    
    if (!birthDate) {
      console.warn('[ResidentDataService] No hay fecha de nacimiento, retornando 0');
      return 0;
    }
    
    try {
      const hoy = new Date();
      const nacimiento = new Date(birthDate);
      
      // Verificar si la fecha es válida
      if (isNaN(nacimiento.getTime())) {
        console.error('[ResidentDataService] Fecha de nacimiento inválida:', birthDate);
        return 0;
      }
      
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      
      console.log('[ResidentDataService] Edad calculada:', edad, 'años');
      return Math.max(0, edad); // Asegurar que no sea negativa
    } catch (error) {
      console.error('[ResidentDataService] Error al calcular edad:', error);
      return 0;
    }
  }

  // Métodos públicos para gestionar perfiles
  obtenerTodosPerfiles(): PerfilCompleto[] {
    return this.perfilesSubject.value;
  }

  cambiarPerfilActual(perfil: PerfilCompleto): void {
    this.perfilActualSubject.next(perfil);
  }

  establecerPerfilActual(id: string): void {
    const perfil = this.perfilesSubject.value.find((p: any) => p.residente.id === id);
    if (perfil) {
      this.perfilActualSubject.next(perfil);
    }
  }

  actualizarResidente(residente: Residente): void {
    const perfiles = this.perfilesSubject.value;
    const index = perfiles.findIndex((p: any) => p.residente.id === residente.id);
    if (index !== -1) {
      perfiles[index].residente = residente;
      this.perfilesSubject.next(perfiles);
      if (this.perfilActualSubject.value?.residente.id === residente.id) {
        this.perfilActualSubject.next(perfiles[index]);
      }
    }
  }

  actualizarFamiliar(familiar: Familiar): void {
    const perfiles = this.perfilesSubject.value;
    const index = perfiles.findIndex((p: any) => p.familiar.id === familiar.id);
    if (index !== -1) {
      perfiles[index].familiar = familiar;
      this.perfilesSubject.next(perfiles);
      if (this.perfilActualSubject.value?.familiar.id === familiar.id) {
        this.perfilActualSubject.next(perfiles[index]);
      }
    }
  }
}
