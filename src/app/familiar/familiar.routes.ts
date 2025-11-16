import type { Routes } from "@angular/router"
import { PatientsComponent } from "./patients/patients.component"

export const FAMILIAR_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () => import("./components/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "appointments",
    loadComponent: () =>
      import("./components/appointments/appointments.component").then((m) => m.AppointmentsComponent),
  },
  {
    path: "notifications",
    loadComponent: () =>
      import("./components/notifications/notifications.component").then((m) => m.NotificationsComponent),
  },
  {
    path: "payments",
    loadComponent: () => import("./components/payments/payments.component").then((m) => m.PaymentsComponent),
  },
  {
    path: "food",
    loadComponent: () => import("./components/food/food.component").then((m) => m.FoodComponent),
  },
  {
    path: "medical-records",
    loadComponent: () =>
      import("./components/medical-records/medical-records.component").then((m) => m.MedicalRecordsComponent),
  },
  {
    path: "resident-profile",
    loadComponent: () =>
      import("./components/resident-profile/resident-profile.component").then((m) => m.ResidentProfileComponent),
  },
  {
    path: "pages",
    loadComponent: () => import("./components/pages/pages.component").then((m) => m.PagesComponent),
  },
  {
    path: "settings",
    loadComponent: () => import("./components/settings/settings.component").then((m) => m.SettingsComponent),
  },
  {
    path: "patients",
    component: PatientsComponent,
  },
]
