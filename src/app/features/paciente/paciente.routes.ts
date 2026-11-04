import { Routes } from '@angular/router';

export const pacienteRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paciente-shell.component').then((m) => m.PacienteShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.PacienteDashboardComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./perfil/perfil.component').then((m) => m.PacientePerfilComponent),
      },
      {
        path: 'reservar',
        loadComponent: () =>
          import('./reservar/reservar.component').then((m) => m.PacienteReservarComponent),
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./citas/citas.component').then((m) => m.PacienteCitasComponent),
      },
    ],
  },
];
