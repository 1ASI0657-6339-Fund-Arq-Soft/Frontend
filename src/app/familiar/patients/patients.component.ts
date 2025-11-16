import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { Patient } from '../../core/models/patient.model';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  showAddModal = false;
  editingPatient: Patient | null = null;
  patientForm!: FormGroup;

  constructor(private patientService: PatientService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadPatients();
    this.initForm();
  }

  loadPatients() {
    this.patientService.getPatients().subscribe(patients => (this.patients = patients));
  }

  initForm() {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required], // Capturado como string, luego convertido
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  openAddModal(patient?: Patient) {
    this.showAddModal = true;
    if (patient) {
      this.editingPatient = patient;
      const patValue = {
        ...patient,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().substring(0, 10) : ''
      };
      this.patientForm.patchValue(patValue);
    } else {
      this.editingPatient = null;
      this.patientForm.reset();
    }
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  savePatient() {
    if (this.patientForm.invalid) return;

    const formValue = {
      ...this.patientForm.value,
      dateOfBirth: new Date(this.patientForm.value.dateOfBirth),
    };

    if (this.editingPatient?.id !== undefined) {
      this.patientService.updatePatient(this.editingPatient.id, formValue).subscribe(() => {
        this.loadPatients();
        this.closeAddModal();
      });
    } else {
      this.patientService.createPatient(formValue).subscribe(() => {
        this.loadPatients();
        this.closeAddModal();
      });
    }
  }

  deletePatient(id: number) {
    this.patientService.deletePatient(id).subscribe(() => this.loadPatients());
  }

  viewPatient(patient: Patient) {
    this.openAddModal(patient);
  }
}
