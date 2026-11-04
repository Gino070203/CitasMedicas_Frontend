import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./usuarios/usuarios.component').then((m) => m.AdminUsuariosComponent),
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () =>
          import('./usuarios/usuario-form.component').then((m) => m.AdminUsuarioFormComponent),
      },
      {
        path: 'usuarios/editar/:id',
        loadComponent: () =>
          import('./usuarios/usuario-form.component').then((m) => m.AdminUsuarioFormComponent),
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./pacientes/pacientes.component').then((m) => m.AdminPacientesComponent),
      },
      {
        path: 'medicos',
        loadComponent: () =>
          import('./medicos/medicos.component').then((m) => m.AdminMedicosComponent),
      },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('./especialidades/especialidades.component').then((m) => m.AdminEspecialidadesComponent),
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./horarios/horarios.component').then((m) => m.AdminHorariosComponent),
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./citas/citas.component').then((m) => m.AdminCitasComponent),
      },
      {
        path: 'citas/nuevo',
        loadComponent: () =>
          import('./citas/cita-form.component').then((m) => m.AdminCitaFormComponent),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./pagos/pagos.component').then((m) => m.AdminPagosComponent),
      },
      {
        path: 'pagos/nuevo',
        loadComponent: () =>
          import('./pagos/pago-form.component').then((m) => m.AdminPagoFormComponent),
      },
    ],
  },
];
