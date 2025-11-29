import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor() {
    this.cargarDatosLocales();
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
