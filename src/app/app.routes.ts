import type { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { NursesComponent } from './cuidador/nurses/nurses.component';
import { AppointmentsComponent } from './developer/appointments/appointments.component';
import { PatientsComponent } from './familiar/patients/patients.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'nurses', component: NursesComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'patients', component: PatientsComponent },
  {
    path: 'familiar',
    loadChildren: () =>
      import('./familiar/familiar.routes').then((m) => m.FAMILIAR_ROUTES),
  },
  {
    path: 'cuidador',
    loadChildren: () =>
      import('./cuidador/cuidador.routes').then((m) => m.CUIDADOR_ROUTES),
  },
  {
    path: 'developer',
    loadChildren: () =>
      import('./developer/developer.routes').then((m) => m.DEVELOPER_ROUTES),
  },
  {
    path: '**',
    redirectTo: '/login',
  },

];
