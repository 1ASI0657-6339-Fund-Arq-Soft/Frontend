import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
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
      title: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      description: [''],
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

    if (this.selectedAppointment && this.selectedAppointment.id !== undefined) {
      this.appointmentService
        .updateAppointment(this.selectedAppointment.id, this.appointmentForm.value)
        .subscribe(() => {
          this.appointments$ = this.appointmentService.getAppointments();
          this.closeModal();
        });
    } else {
      this.appointmentService.addAppointment(this.appointmentForm.value).subscribe(() => {
        this.appointments$ = this.appointmentService.getAppointments();
        this.closeModal();
      });
    }
  }

  deleteAppointment(id: number) {
    this.appointmentService.deleteAppointment(id).subscribe(() => {
      this.appointments$ = this.appointmentService.getAppointments();
    });
  }

  viewAppointment(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showModal = true;
    this.appointmentForm.patchValue(appointment);
  }
}
