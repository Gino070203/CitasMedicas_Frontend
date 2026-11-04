import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'paciente',
    canActivate: [authGuard, roleGuard(['PACIENTE'])],
    loadChildren: () =>
      import('./features/paciente/paciente.routes').then((m) => m.pacienteRoutes),
  },
  {
    path: 'medico',
    canActivate: [authGuard, roleGuard(['MEDICO'])],
    loadChildren: () => import('./features/medico/medico.routes').then((m) => m.medicoRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  { path: '**', redirectTo: 'auth/login' },
];
