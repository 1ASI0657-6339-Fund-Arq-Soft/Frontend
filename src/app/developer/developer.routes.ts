import type { Routes } from "@angular/router";

export const DEVELOPER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import("./components/layout/layout.component").then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./components/dashboard/dashboard.component").then((m) => m.DeveloperDashboardComponent),
      },
      {
        path: "analytics",
        loadComponent: () =>
          import("./components/analytics/analytics.component").then((m) => m.AnalyticsComponent),
      },
      {
        path: "system",
        loadComponent: () =>
          import("./components/system/system.component").then((m) => m.SystemComponent),
      },
      {
        path: "users",
        loadComponent: () =>
          import("./components/users/users.component").then((m) => m.UsersComponent),
      },
      {
        path: "appointments",
        loadComponent: () =>
          import("./appointments/appointments.component").then((m) => m.AppointmentsComponent),
      },
    ]
  }
];
