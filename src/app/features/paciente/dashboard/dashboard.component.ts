import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-paciente-dashboard',
  imports: [RouterLink],
  template: `
    <main class="patient-main">
      <section class="patient-hero" aria-labelledby="saludoPaciente">
        <div class="patient-hero-content">
          <p class="patient-hero-eyebrow">Tu salud esta en buenas manos</p>
          <h1 id="saludoPaciente">Hola, <span>{{ nombre }}</span></h1>
        </div>
        <div class="patient-hero-symbol" aria-hidden="true">
          <i class="bi bi-heart-pulse"></i>
        </div>
      </section>

      <section aria-labelledby="accesosPaciente">
        <h2 class="patient-section-heading" id="accesosPaciente">¿Qué deseas hacer?</h2>
        <div class="row row-cols-1 row-cols-md-2 g-3">
          <div class="col">
            <a class="patient-action-card" routerLink="/paciente/reservar">
              <span class="patient-action-icon" aria-hidden="true">
                <i class="bi bi-calendar2-plus"></i>
              </span>
              <h3>Reservar una cita</h3>
              <p>Explora las especialidades y elige el horario que mejor te convenga.</p>
              <span class="patient-action-link">
                Buscar horarios <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
              </span>
            </a>
          </div>
          <div class="col">
            <a class="patient-action-card" routerLink="/paciente/citas">
              <span class="patient-action-icon" aria-hidden="true">
                <i class="bi bi-clipboard2-heart"></i>
              </span>
              <h3>Mis citas e historial</h3>
              <p>Consulta las fechas, los horarios y el estado de tus citas médicas.</p>
              <span class="patient-action-link">
                Ver mis citas <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section class="patient-panel mt-4" aria-label="Información de ayuda">
        <div class="d-flex align-items-start gap-3">
          <span class="patient-action-icon mb-0" aria-hidden="true">
            <i class="bi bi-info-circle"></i>
          </span>
          <div>
            <h2 class="patient-panel-heading mb-1">¿Necesitas ayuda?</h2>
            <p class="patient-page-intro">
              Si tienes dudas sobre una cita, comunícate con el centro médico antes de acudir.
            </p>
          </div>
        </div>
      </section>
    </main>

    <footer class="patient-footer">Centro Médico · Portal del paciente</footer>
  `,
})
export class PacienteDashboardComponent {
  private readonly auth = inject(AuthService);

  nombre = this.auth.getNombre() ?? 'Paciente';
}
