import type { Routes } from "@angular/router"
import { NursesComponent } from "./nurses/nurses.component"

export const CUIDADOR_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () => import("./components/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "patients",
    loadComponent: () => import("./components/patients/patients.component").then((m) => m.PatientsComponent),
  },
  {
    path: "citas",
    loadComponent: () => import("./components/citas/citas.component").then((m) => m.CitasComponent),
  },
  {
    path: "payments",
    loadComponent: () => import("./components/payments/payments.component").then((m) => m.PaymentsComponent),
  },
  {
    path: "notifications",
    loadComponent: () => import("./components/notifications/notifications.component").then((m) => m.CuidadorNotificationsComponent),
  },
  {
    path: "food",
    loadComponent: () => import("./components/food/food.component").then((m) => m.FoodComponent),
  },

  {
    path: "nurses",
    component: NursesComponent,
  },
]
