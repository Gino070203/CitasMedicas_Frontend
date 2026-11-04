import { Routes } from '@angular/router';

export const medicoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./medico-shell.component').then((m) => m.MedicoShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.MedicoDashboardComponent),
      },
      {
        path: 'diagnostico/:id',
        loadComponent: () =>
          import('./diagnostico/diagnostico.component').then((m) => m.MedicoDiagnosticoComponent),
      },
    ],
  },
];
