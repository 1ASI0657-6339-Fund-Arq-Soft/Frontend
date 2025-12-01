import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { ResidentsApiService } from '../../../core/services/residents-api.service';
import { UsersApiService } from '../../../core/services/users-api.service';
import { Observable } from "rxjs";
import type { AppointmentResource, CreateAppointmentResource } from '../../../core/models/generated/appointments.types';
import { LayoutComponent } from "../layout/layout.component";

@Component({
  selector: "app-citas",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  templateUrl: "./citas.component.html",
  styleUrls: ["./citas.component.css"]
})
export class CitasComponent implements OnInit {

  appointments$!: Observable<AppointmentResource[]>;
  residents: any[] = []
  doctors: any[] = []
  showModal = false;
  selectedAppointment: AppointmentResource | null = null;
  appointmentForm!: FormGroup;

  constructor(
    private appointmentApi: AppointmentApiService,
    private residentsApi: ResidentsApiService,
    private usersApi: UsersApiService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.appointments$ = this.appointmentApi.getAll();
    this.residentsApi.getAll().subscribe((r) => this.residents = r)
    this.usersApi.getAllDoctors().subscribe((d) => this.doctors = d)
    this.initForm();
  }
  initForm() {
    this.appointmentForm = this.fb.group({
      residentId: [null, Validators.required],
      doctorId: [null, Validators.required],
      date: ['', Validators.required],
      timeHour: [0, Validators.required],
      timeMinute: [0, Validators.required],
      status: ['pending']
    })
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

    const p: CreateAppointmentResource = {
      residentId: Number(payload.residentId),
      doctorId: Number(payload.doctorId),
      date: payload.date,
      time: { hour: Number(payload.timeHour), minute: Number(payload.timeMinute), second: 0, nano: 0 },
      status: payload.status || 'pending'
    }

    if (this.selectedAppointment && this.selectedAppointment.id !== undefined) {
      this.appointmentApi.update(this.selectedAppointment.id, p).subscribe(() => {
        this.refreshList();
        this.closeModal();
      })
    } else {
      this.appointmentApi.create(p).subscribe(() => { this.refreshList(); this.closeModal() })
    }
  }
  refreshList() {
    this.appointments$ = this.appointmentApi.getAll();
  }

  deleteAppointment(id: number | undefined) {
    if (!id) return;
    if (!confirm("¿Desea eliminar la cita?")) return;

    this.appointmentApi.delete(id as number).subscribe(() => this.refreshList());
  }

  editAppointment(appt: AppointmentResource) {
    this.selectedAppointment = appt;
    this.showModal = true;
    this.appointmentForm.patchValue({ residentId: appt.residentId, doctorId: appt.doctorId, date: appt.date, timeHour: appt.time?.hour ?? 0, timeMinute: appt.time?.minute ?? 0, status: appt.status })
  }

  viewAppointment(appt: AppointmentResource) {
    this.selectedAppointment = appt;
    this.showModal = true;
    this.appointmentForm.patchValue({ residentId: appt.residentId, doctorId: appt.doctorId, date: appt.date, timeHour: appt.time?.hour ?? 0, timeMinute: appt.time?.minute ?? 0, status: appt.status })
  }

  finalizeAppointment(id: number | undefined) {
    if (!id) return;

    this.appointmentApi.getById(id as number).subscribe((a) => {
      if (!a) return
      const payload = { ...a, status: 'finalized' }
      this.appointmentApi.update(id as number, payload).subscribe(() => this.refreshList())
    })
  }
}
