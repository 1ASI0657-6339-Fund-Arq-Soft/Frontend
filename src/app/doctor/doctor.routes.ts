import type { Routes } from "@angular/router";

export const DOCTOR_ROUTES: Routes = [
  {
    path: "gestion-citas",
    loadComponent: () => import("./components/gestion-citas/gestion-citas.component").then((m) => m.GestionCitasComponent),
  },
];
