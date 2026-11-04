import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'verificar',
    loadComponent: () => import('./verificar/verificar.component').then((m) => m.VerificarComponent),
  },
  {
    path: 'oauth2-redirect',
    loadComponent: () =>
      import('./oauth2-redirect/oauth2-redirect.component').then((m) => m.Oauth2RedirectComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
