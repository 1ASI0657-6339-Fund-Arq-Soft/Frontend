import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppointmentService } from "../../../core/services/appointment.service";
import { Observable } from "rxjs";
import type { Appointment } from "../../../core/models/appointment.model";
import { LayoutComponent } from "../layout/layout.component";

@Component({
  selector: "app-citas",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  template: `
    <app-cuidador-layout>
      <div class="citas-page">
        <div class="page-header">
          <h2>Citas</h2>
          <button class="btn btn-primary" (click)="openCreateModal()">Crear Cita</button>
        </div>

        <div *ngIf="showModal" class="modal modal-card">
          <div class="modal-card-body">
            <h3 *ngIf="!selectedAppointment">Nueva Cita</h3>
            <h3 *ngIf="selectedAppointment">Modificar Cita</h3>
            <form [formGroup]="appointmentForm" (ngSubmit)="saveAppointment()" class="form-grid">
              <input formControlName="title" placeholder="Título" class="form-input" />
              <input type="datetime-local" formControlName="start" class="form-input" />
              <input type="datetime-local" formControlName="end" class="form-input" />
              <input type="text" formControlName="specialty" placeholder="Especialidad (ej. Cardiología)" class="form-input" />
              <textarea formControlName="description" placeholder="Descripción" class="form-input"></textarea>
              <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" class="btn" (click)="closeModal()">Cancelar</button>
              </div>
            </form>
          </div>
        </div>

        <div class="citas-list card">
          <div *ngFor="let c of (appointments$ | async)" class="cita-item">
            <div class="cita-main">
              <div class="cita-title">{{ c.title }}</div>
              <div class="cita-meta">{{ c.start | date:'short' }} - {{ c.end | date:'short' }}</div>
              <div class="cita-specialty" *ngIf="c.specialty">Especialidad: {{ c.specialty }}</div>
              <div class="cita-status">Estado: {{ c.status || 'pendiente' }}</div>
            </div>
            <div class="cita-actions">
              <button class="btn" (click)="viewAppointment(c)">Ver detalles</button>
              <button class="btn" (click)="editAppointment(c)">Modificar</button>
              <button class="btn btn-danger" (click)="deleteAppointment(c.id)">Quitar</button>
              <button class="btn btn-success" (click)="finalizeAppointment(c.id)">Finalizar</button>
            </div>
          </div>
        </div>
      </div>
    </app-cuidador-layout>
  `,
})
export class CitasComponent implements OnInit {
  appointments$!: Observable<Appointment[]>;
  showModal = false;
  selectedAppointment: Appointment | null = null;
  appointmentForm!: FormGroup;

  constructor(private appointmentService: AppointmentService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.appointments$ = this.appointmentService.getAppointments();
    this.initForm();
  }

  initForm() {
    this.appointmentForm = this.fb.group({
      title: ["", Validators.required],
      start: ["", Validators.required],
      end: ["", Validators.required],
      specialty: [""],
      description: [""],
    });
  }

  openCreateModal() {
    this.showModal = true;
    this.selectedAppointment = null;
    this.appointmentForm.reset();
  }

  closeModal() {
    this.showModal = false;
  }

  saveAppointment() {
    if (this.appointmentForm.invalid) return;

    const payload = this.appointmentForm.value;

    if (this.selectedAppointment && this.selectedAppointment.id !== undefined) {
      this.appointmentService.updateAppointment(this.selectedAppointment.id, payload).subscribe(() => {
        this.appointments$ = this.appointmentService.getAppointments();
        this.closeModal();
      });
    } else {
      this.appointmentService.addAppointment(payload).subscribe(() => {
        this.appointments$ = this.appointmentService.getAppointments();
        this.closeModal();
      });
    }
  }

  deleteAppointment(id: number | undefined) {
    if (!id) return;
    if (!confirm('¿Desea eliminar la cita?')) return;
    this.appointmentService.deleteAppointment(id).subscribe(() => {
      this.appointments$ = this.appointmentService.getAppointments();
    });
  }

  editAppointment(appt: Appointment) {
    this.selectedAppointment = appt;
    this.showModal = true;
    this.appointmentForm.patchValue(appt as any);
  }

  viewAppointment(appt: Appointment) {
    // open modal for details
    this.selectedAppointment = appt;
    this.showModal = true;
    this.appointmentForm.patchValue(appt as any);
  }

  finalizeAppointment(id: number | undefined) {
    if (!id) return;
    this.appointmentService.patchAppointment(id, { status: 'finalized' }).subscribe(() => {
      this.appointments$ = this.appointmentService.getAppointments();
    });
  }
}
