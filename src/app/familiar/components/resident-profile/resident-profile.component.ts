import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { ResidentDataService, Residente, Familiar, PerfilCompleto } from '../../services/resident-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resident-profile',
  standalone: true,
  imports: [CommonModule, LayoutComponent, ReactiveFormsModule],
  templateUrl: './resident-profile.component.html',
  styleUrls: ['./resident-profile.component.css']
})
export class ResidentProfileComponent implements OnInit, OnDestroy {
  perfilForm!: FormGroup;
  familiarForm!: FormGroup;
  perfilActual: PerfilCompleto | null = null;

  modoEdicionResidente = false;
  modoEdicionFamiliar = false;

  mostrarExito = false;
  mensajeExito = '';

  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private residentDataService: ResidentDataService
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.residentDataService.perfilActual$.subscribe(perfil => {
        if (perfil) {
          this.perfilActual = perfil;
          this.cargarDatosEnFormularios();
        } else {
          this.cargarPrimerPerfil();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private inicializarFormularios(): void {
    this.perfilForm = this.fb.group({
      nombre: [{value: '', disabled: true}, Validators.required],
      edad: [{value: '', disabled: true}, [Validators.required, Validators.min(0)]],
      fechaNacimiento: [{value: '', disabled: true}],
      condiciones: [{value: '', disabled: true}],
      estadoGeneral: [{value: 'Estable', disabled: true}],
      ultimoChequeo: [{value: '', disabled: true}]
    });

    this.familiarForm = this.fb.group({
      usuario: [{value: '', disabled: true}, Validators.required],
      correo: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      telefono: [{value: '', disabled: true}],
      relacion: [{value: '', disabled: true}],
      tipoUsuario: [{value: 'Familiar', disabled: true}]
    });
  }

  private cargarPrimerPerfil(): void {
    const perfiles = this.residentDataService.obtenerTodosPerfiles();
    if (perfiles.length > 0) {
      this.perfilActual = perfiles[0];
      this.residentDataService.establecerPerfilActual(perfiles[0].residente.id!);
      this.cargarDatosEnFormularios();
    }
  }

  private cargarDatosEnFormularios(): void {
    if (this.perfilActual) {
      this.perfilForm.patchValue({
        nombre: this.perfilActual.residente.nombre,
        edad: this.perfilActual.residente.edad,
        fechaNacimiento: this.perfilActual.residente.fechaNacimiento,
        condiciones: this.perfilActual.residente.condiciones,
        estadoGeneral: this.perfilActual.residente.estadoGeneral,
        ultimoChequeo: this.perfilActual.residente.ultimoChequeo
      });

      this.familiarForm.patchValue({
        usuario: this.perfilActual.familiar.usuario,
        correo: this.perfilActual.familiar.correo,
        telefono: this.perfilActual.familiar.telefono,
        relacion: this.perfilActual.familiar.relacion,
        tipoUsuario: this.perfilActual.familiar.tipoUsuario
      });
    }
  }

  toggleEdicionResidente(): void {
    this.modoEdicionResidente = !this.modoEdicionResidente;

    if (this.modoEdicionResidente) {
      this.perfilForm.enable();
    } else {
      this.perfilForm.disable();
      this.cargarDatosEnFormularios();
    }
  }

  toggleEdicionFamiliar(): void {
    this.modoEdicionFamiliar = !this.modoEdicionFamiliar;

    if (this.modoEdicionFamiliar) {
      this.familiarForm.enable();
      this.familiarForm.get('tipoUsuario')?.disable();
    } else {
      this.familiarForm.disable();
      this.cargarDatosEnFormularios();
    }
  }

  guardarResidente(): void {
    if (this.perfilForm.valid && this.perfilActual) {
      const residenteActualizado: Residente = {
        ...this.perfilActual.residente,
        ...this.perfilForm.value
      };

      this.residentDataService.actualizarResidente(residenteActualizado);
      this.modoEdicionResidente = false;
      this.perfilForm.disable();

      this.mostrarMensajeExito('Información del residente actualizada correctamente');
    }
  }

  guardarFamiliar(): void {
    if (this.familiarForm.valid && this.perfilActual) {
      const familiarActualizado: Familiar = {
        ...this.perfilActual.familiar,
        ...this.familiarForm.value,
        tipoUsuario: this.perfilActual.familiar.tipoUsuario
      };

      this.residentDataService.actualizarFamiliar(familiarActualizado);
      this.modoEdicionFamiliar = false;
      this.familiarForm.disable();

      this.mostrarMensajeExito('Información del familiar actualizada correctamente');
    }
  }

  private mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mostrarExito = true;

    setTimeout(() => {
      this.mostrarExito = false;
    }, 3000);
  }

  cambiarEstadoGeneral(nuevoEstado: string): void {
    if (this.perfilActual && this.modoEdicionResidente) {
      this.perfilForm.patchValue({ estadoGeneral: nuevoEstado });
    }
  }

  get estadosDisponibles(): string[] {
    return ['Estable', 'Requiere Atención', 'Crítico', 'En Recuperación'];
  }
}
