import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NurseService } from '../../core/services/nurse.service';
import { Nurse } from '../../core/models/nurse.model';

@Component({
  selector: 'app-nurses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nurses.component.html',
  styleUrls: ['./nurses.component.css']
})
export class NursesComponent implements OnInit {
  nurses: Nurse[] = [];
  showAddModal = false;
  editingNurse: Nurse | null = null;
  nurseForm!: FormGroup;

  constructor(private nurseService: NurseService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadNurses();
    this.initForm();
  }

  loadNurses() {
    this.nurseService.getNurses().subscribe(nurses => this.nurses = nurses);
  }

  initForm() {
    this.nurseForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      specialty: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      available: [false]
    });
  }

  openAddModal(nurse?: Nurse) {
    this.showAddModal = true;
    if (nurse) {
      this.editingNurse = nurse;
      this.nurseForm.patchValue(nurse);
    } else {
      this.editingNurse = null;
      this.nurseForm.reset();
    }
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveNurse() {
    if (this.nurseForm.invalid) return;

    if (this.editingNurse?.id !== undefined) {
      this.nurseService.updateNurse(this.editingNurse.id, this.nurseForm.value)
        .subscribe(() => {
          this.loadNurses();
          this.closeAddModal();
        });
    } else {
      this.nurseService.createNurse(this.nurseForm.value)
        .subscribe(() => {
          this.loadNurses();
          this.closeAddModal();
        });
    }
  }

  deleteNurse(id: number) {
    this.nurseService.deleteNurse(id).subscribe(() => this.loadNurses());
  }

  viewNurse(nurse: Nurse) {
    this.openAddModal(nurse);
  }
}
