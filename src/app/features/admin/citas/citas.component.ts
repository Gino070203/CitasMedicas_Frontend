import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Cita } from '../../../core/models/cita.model';
import { Medico } from '../../../core/models/medico.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService, FiltrosCitas } from '../services/admin.service';

@Component({
  selector: 'app-admin-citas',
  imports: [RouterLink, FormsModule],
  template: `
    <main class="container-fluid px-4 py-4">
      <div class="admin-page-header">
        <div class="d-flex gap-2">
          <a routerLink="/admin/citas/nuevo" class="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-plus-lg"></i> Nueva cita
          </a>
        </div>
      </div>

      @if (error) {
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        </div>
      }

      <div class="admin-filter-bar">
        <div class="flex-grow-1">
          <input
            type="search"
            name="q"
            class="form-control"
            placeholder="Paciente, DNI, médico, especialidad o ID..."
            [(ngModel)]="filtros.q"
            (keyup.enter)="filtrar()"
          />
        </div>
        <div style="width: 165px;">
          <input type="date" name="fecha" class="form-control" [(ngModel)]="filtros.fecha" aria-label="Filtrar por fecha" />
        </div>
        <div style="width: 240px;">
          <select name="idMedico" class="form-select" [(ngModel)]="filtros.idMedico">
            <option value="">Todos los médicos</option>
            @for (m of medicos; track m.idMedico) {
              <option [value]="m.idMedico">Dr. {{ m.nombre }} {{ m.apellido }}</option>
            }
          </select>
        </div>
        <div style="width: 180px;">
          <select name="estado" class="form-select" [(ngModel)]="filtros.estado">
            <option value="">Todos los estados</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="PENDIENTE_PAGO">Pendiente de pago</option>
            <option value="ATENDIDA">Atendida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        <div>
          <button type="button" class="btn btn-primary btn-sm px-3 py-2" (click)="filtrar()">Filtrar</button>
          <button type="button" class="btn btn-outline-secondary btn-sm px-3 py-2" (click)="limpiar()">Limpiar</button>
        </div>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-body p-0">
          <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
            <h6 class="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
              <i class="bi bi-list-ul text-primary"></i> Listado de citas
              <span class="badge bg-light text-secondary border fw-normal">{{ citas.length }} registros</span>
            </h6>
          </div>

          @if (cargando) {
            <p class="text-muted p-4 mb-0">Cargando citas…</p>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 admin-table-light">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>Médico asignado</th>
                    <th>Fecha programada</th>
                    <th>Horario (Inicio - Fin)</th>
                    <th>Estado</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of citas; track c.idCita) {
                    <tr>
                      <td class="fw-semibold text-muted">{{ c.idCita }}</td>
                      <td>
                        <div class="fw-bold text-dark">{{ c.nombrePaciente }}</div>
                      </td>
                      <td>
                        <div class="fw-bold text-dark">Dr. {{ c.nombreMedico }}</div>
                      </td>
                      <td>
                        <div class="d-flex align-items-center gap-1 text-dark">
                          <i class="bi bi-calendar text-muted"></i>
                          <span>{{ c.fecha }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="d-flex align-items-center gap-1 text-dark">
                          <i class="bi bi-clock text-muted"></i>
                          <span>{{ c.horaInicio }} - {{ c.horaFin }}</span>
                        </div>
                      </td>
                      <td>
                        <span class="admin-estado" [class]="estadoClase(c.estado)">{{ c.estado }}</span>
                      </td>
                      <td>
                        <div class="d-flex justify-content-center align-items-center gap-2">
                          @if (c.estado !== 'CANCELADA' && c.estado !== 'ATENDIDA') {
                            <button
                              type="button"
                              class="btn btn-outline-danger btn-sm py-1 px-2"
                              (click)="abrirModalCancelar(c)"
                            >
                              <i class="bi bi-x-circle me-1"></i> Cancelar
                            </button>
                          } @else {
                            <span class="text-muted small">Sin acciones</span>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-5">
                        <i class="bi bi-calendar-x fs-2 d-block mb-2 text-secondary"></i>
                        No hay citas registradas en el sistema.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </main>

    <footer class="admin-footer">
      <small>© 2026 Centro Médico Buenos Aires de Villa</small>
    </footer>

    @if (citaSeleccionada) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-x-circle-fill text-danger me-2"></i> Cancelar cita
              </h5>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="cerrarModalCancelar()"></button>
            </div>
            <div class="modal-body">
              ¿Estás seguro de cancelar la cita
              <strong>#{{ citaSeleccionada.idCita }}</strong> de
              <strong>{{ citaSeleccionada.nombrePaciente }}</strong>?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalCancelar()" [disabled]="cancelando">
                Cerrar
              </button>
              <button type="button" class="btn btn-danger" (click)="confirmarCancelar()" [disabled]="cancelando">
                <i class="bi bi-x-circle me-1"></i>
                {{ cancelando ? 'Cancelando…' : 'Sí, cancelar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminCitasComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  medicos: Medico[] = [];
  cargando = true;
  error: string | null = null;

  filtros: FiltrosCitas = { q: '', estado: '', fecha: '', idMedico: '' };

  citaSeleccionada: Cita | null = null;
  cancelando = false;

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarCitas();
  }

  cargarMedicos(): void {
    this.service.getMedicos().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  cargarCitas(): void {
    this.cargando = true;
    this.error = null;
    this.service.getCitas(this.filtros).subscribe({
      next: (citas) => {
        this.citas = citas;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrar(): void {
    this.cargarCitas();
  }

  limpiar(): void {
    this.filtros = { q: '', estado: '', fecha: '', idMedico: '' };
    this.cargarCitas();
  }

  estadoClase(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'admin-estado-confirmada';
      case 'PENDIENTE_PAGO':
        return 'admin-estado-pendiente';
      case 'CANCELADA':
        return 'admin-estado-cancelada';
      case 'ATENDIDA':
        return 'admin-estado-atendida';
      default:
        return 'admin-estado-otro';
    }
  }

  abrirModalCancelar(c: Cita): void {
    this.citaSeleccionada = c;
  }

  cerrarModalCancelar(): void {
    if (!this.cancelando) {
      this.citaSeleccionada = null;
    }
  }

  confirmarCancelar(): void {
    if (!this.citaSeleccionada) {
      return;
    }
    this.cancelando = true;
    this.service.cancelarCita(this.citaSeleccionada.idCita).subscribe({
      next: () => {
        this.cancelando = false;
        this.citaSeleccionada = null;
        this.cargarCitas();
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cancelando = false;
        this.citaSeleccionada = null;
        this.cdr.detectChanges();
      },
    });
  }
}
