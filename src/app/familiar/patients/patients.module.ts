import { PatientsComponent } from "./patients.component";
import { PatientsRoutingModule } from "./patients-routing.module";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PatientsRoutingModule,
  ]
})
export class PatientsModule {}
