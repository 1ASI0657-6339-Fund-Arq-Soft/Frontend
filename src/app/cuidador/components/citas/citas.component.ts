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
  templateUrl: "./citas.component.html",
  styleUrls: ["./citas.component.css"]
})
export class CitasComponent implements OnInit {

  appointments$!: Observable<Appointment[]>;
  showModal = false;
  selectedAppointment: Appointment | null = null;
  appointmentForm!: FormGroup;

  constructor(
    private appointmentService: AppointmentService,
    private fb: FormBuilder
  ) {}

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
      this.appointmentService.updateAppointment(this.selectedAppointment.id, payload)
        .subscribe(() => {
          this.refreshList();
          this.closeModal();
        });
    } else {
      this.appointmentService.addAppointment(payload)
        .subscribe(() => {
          this.refreshList();
          this.closeModal();
        });
    }
  }
  refreshList() {
    this.appointments$ = this.appointmentService.getAppointments();
  }

  deleteAppointment(id: number | undefined) {
    if (!id) return;
    if (!confirm("¿Desea eliminar la cita?")) return;

    this.appointmentService.deleteAppointment(id)
      .subscribe(() => this.refreshList());
  }

  editAppointment(appt: Appointment) {
    this.selectedAppointment = appt;
    this.showModal = true;
    this.appointmentForm.patchValue(appt);
  }

  viewAppointment(appt: Appointment) {
    this.selectedAppointment = appt;
    this.showModal = true;
    this.appointmentForm.patchValue(appt);
  }

  finalizeAppointment(id: number | undefined) {
    if (!id) return;

    this.appointmentService.patchAppointment(id, { status: "finalized" })
      .subscribe(() => this.refreshList());
  }
}
