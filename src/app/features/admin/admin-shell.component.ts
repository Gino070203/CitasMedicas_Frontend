import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside class="admin-sidebar">
      <a class="admin-sidebar-brand" routerLink="dashboard">
        <div>CM Buenos Aires<span>Gestión Clínica</span></div>
      </a>

      <ul class="admin-sidebar-menu">
        <li routerLinkActive="active">
          <a routerLink="dashboard"><i class="bi bi-grid-1x2-fill"></i> Dashboard</a>
        </li>
        <li routerLinkActive="active">
          <a routerLink="usuarios"><i class="bi bi-people"></i> Usuarios</a>
        </li>
        <li routerLinkActive="active">
          <a routerLink="citas"><i class="bi bi-calendar-event"></i> Citas</a>
        </li>
        <li routerLinkActive="active">
          <a routerLink="medicos"><i class="bi bi-person-badge"></i> Médicos</a>
        </li>
        <li routerLinkActive="active">
          <a routerLink="pacientes"><i class="bi bi-people-fill"></i> Pacientes</a>
        </li>
        <li routerLinkActive="active">
          <a routerLink="especialidades"><i class="bi bi-clipboard2-pulse"></i> Especialidades</a>
        </li>
        <li routerLinkActive="active">
          <a routerLink="horarios"><i class="bi bi-clock-history"></i> Horarios</a>
        </li>
        <li routerLinkActive="active">
          <a routerLink="pagos"><i class="bi bi-wallet2"></i> Pagos</a>
        </li>
      </ul>

      <div class="admin-sidebar-footer">
        <button class="admin-btn-logout" type="button" (click)="cerrarSesion()">
          <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
        </button>
      </div>
    </aside>

    <div class="admin-main-content">
      <router-outlet />
    </div>
  `,
})
export class AdminShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
