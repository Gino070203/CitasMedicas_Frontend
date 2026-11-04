import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-paciente-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav
      class="navbar navbar-expand-lg navbar-dark patient-navbar"
      data-bs-theme="dark"
      aria-label="Navegación del paciente"
    >
      <div class="container">
        <a class="navbar-brand" routerLink="/paciente/dashboard">
          <i class="bi bi-heart-pulse-fill me-2" aria-hidden="true"></i>
          Centro Médico Buenos Aires - Chorrillos
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navegacionPaciente"
          aria-controls="navegacionPaciente"
          aria-expanded="false"
          aria-label="Mostrar u ocultar navegación"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navegacionPaciente">
          <ul class="navbar-nav ms-auto align-items-lg-center">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/paciente/dashboard"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <i class="bi bi-house-door me-1" aria-hidden="true"></i>Inicio
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/paciente/reservar" routerLinkActive="active">
                <i class="bi bi-calendar-plus me-1" aria-hidden="true"></i>Reservar cita
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/paciente/citas" routerLinkActive="active">
                <i class="bi bi-clipboard2-heart me-1" aria-hidden="true"></i>Mis citas
              </a>
            </li>
            <li class="nav-item ms-lg-2">
              <a
                class="patient-user-chip patient-user-link"
                routerLink="/paciente/perfil"
                routerLinkActive="patient-user-chip-active"
                title="Ver y editar mi perfil"
              >
                <i class="bi bi-person-circle" aria-hidden="true"></i>
                <span>{{ nombre }}</span>
                <i class="bi bi-pencil-square patient-user-edit-icon" aria-hidden="true"></i>
              </a>
            </li>
            <li class="nav-item ms-lg-2">
              <button class="btn btn-sm btn-outline-light" type="button" (click)="cerrarSesion()">
                <i class="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet />
  `,
})
export class PacienteShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  nombre = this.auth.getNombre() ?? 'Paciente';

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
