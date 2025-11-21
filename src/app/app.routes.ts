import type { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
    path: 'doctor',
    loadChildren: () =>
      import('./doctor/doctor.routes').then((m) => m.DOCTOR_ROUTES),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
