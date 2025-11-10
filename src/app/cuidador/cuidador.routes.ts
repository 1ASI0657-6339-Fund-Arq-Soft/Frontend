import type { Routes } from "@angular/router"

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
    path: "tasks",
    loadComponent: () => import("./components/tasks/tasks.component").then((m) => m.TasksComponent),
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
    path: "reports",
    loadComponent: () => import("./components/reports/reports.component").then((m) => m.ReportsComponent),
  },
]
