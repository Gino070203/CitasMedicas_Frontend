import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Dashboard } from '../../../core/models/dashboard.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <main class="container-fluid px-4 py-4">
      @if (error) {
        <div class="alert alert-danger" role="alert">{{ error }}</div>
      }

      <div class="admin-banner">
        <div>
          <h2>Panel de Administración</h2>
          <p>
            Bienvenido al sistema de gestión de citas médicas. Desde este panel puedes administrar
            los módulos del centro médico, monitorear la afluencia y supervisar operaciones diarias.
          </p>
        </div>
      </div>

      <div class="admin-citas-hoy">
        <div class="d-flex align-items-center gap-3">
          <div class="admin-citas-hoy-icon">
            <i class="bi bi-calendar-event"></i>
          </div>
          <div>
            <span class="d-block text-dark fw-bold">
              Citas programadas para hoy: {{ dashboard?.citasHoy ?? 0 }}
            </span>
            <small class="text-muted">No hay retrasos de consulta registrados para el turno de la mañana.</small>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <div class="row g-3">
          <div class="col-12 col-sm-6 col-lg-2">
            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span>Usuarios</span>
                <div class="admin-stat-icon admin-color-usuarios"><i class="bi bi-people-fill"></i></div>
              </div>
              <div class="admin-stat-value">{{ dashboard?.totalUsuarios ?? 0 }}</div>
              <span class="admin-stat-sub">Usuarios registrados</span>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-2">
            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span>Médicos</span>
                <div class="admin-stat-icon admin-color-medicos"><i class="bi bi-person-badge-fill"></i></div>
              </div>
              <div class="admin-stat-value">{{ dashboard?.totalMedicos ?? 0 }}</div>
              <span class="admin-stat-sub">Médicos registrados</span>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-2">
            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span>Pacientes</span>
                <div class="admin-stat-icon admin-color-pacientes"><i class="bi bi-person-heart"></i></div>
              </div>
              <div class="admin-stat-value">{{ dashboard?.totalPacientes ?? 0 }}</div>
              <span class="admin-stat-sub">Pacientes registrados</span>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-2">
            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span>Especialidades</span>
                <div class="admin-stat-icon admin-color-especialidades"><i class="bi bi-clipboard2-pulse"></i></div>
              </div>
              <div class="admin-stat-value">{{ dashboard?.totalEspecialidades ?? 0 }}</div>
              <span class="admin-stat-sub">Especialidades médicas</span>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-2">
            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span>Citas</span>
                <div class="admin-stat-icon admin-color-citas"><i class="bi bi-calendar-check-fill"></i></div>
              </div>
              <div class="admin-stat-value">{{ dashboard?.totalCitas ?? 0 }}</div>
              <span class="admin-stat-sub">Citas registradas</span>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-2">
            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span>Pagos</span>
                <div class="admin-stat-icon admin-color-pagos"><i class="bi bi-cash-coin"></i></div>
              </div>
              <div class="admin-stat-value">{{ dashboard?.totalPagos ?? 0 }}</div>
              <span class="admin-stat-sub">Pagos registrados</span>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-4 mb-5">
        <div class="admin-section-title">
          <span><i class="bi bi-grid-fill text-primary me-1"></i> Módulos de Administración</span>
        </div>

        <div class="row g-3">
          <div class="col-6 col-md-4 col-lg-3">
            <a routerLink="/admin/usuarios" class="admin-menu-card">
              <i class="bi bi-people"></i>
              <h6>Usuarios</h6>
              <small class="text-muted">Gestionar cuentas y roles</small>
            </a>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <a routerLink="/admin/medicos" class="admin-menu-card">
              <i class="bi bi-person-badge"></i>
              <h6>Médicos</h6>
              <small class="text-muted">Gestionar médicos y turnos</small>
            </a>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <a routerLink="/admin/pacientes" class="admin-menu-card">
              <i class="bi bi-person-heart"></i>
              <h6>Pacientes</h6>
              <small class="text-muted">Gestionar pacientes e historial</small>
            </a>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <a routerLink="/admin/especialidades" class="admin-menu-card">
              <i class="bi bi-clipboard2-pulse"></i>
              <h6>Especialidades</h6>
              <small class="text-muted">Áreas médicas y tarifas</small>
            </a>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <a routerLink="/admin/horarios" class="admin-menu-card">
              <i class="bi bi-clock-history"></i>
              <h6>Horarios</h6>
              <small class="text-muted">Horarios de atención clínica</small>
            </a>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <a routerLink="/admin/citas" class="admin-menu-card">
              <i class="bi bi-calendar-check"></i>
              <h6>Citas</h6>
              <small class="text-muted">Gestionar reservas y agenda</small>
            </a>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <a routerLink="/admin/pagos" class="admin-menu-card">
              <i class="bi bi-cash-stack"></i>
              <h6>Pagos</h6>
              <small class="text-muted">Control de pagos y facturación</small>
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="admin-footer">
      <p class="mb-0">© 2026 Centro Médico Buenos Aires de Villa | Sistema de Gestión de Citas Médicas</p>
    </footer>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: Dashboard | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.service.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cdr.detectChanges();
      },
    });
  }
}
