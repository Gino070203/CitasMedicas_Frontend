import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Pago } from '../../../core/models/pago.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService, FiltrosPagos } from '../services/admin.service';

@Component({
  selector: 'app-admin-pagos',
  imports: [RouterLink, FormsModule],
  template: `
    <main class="container-fluid px-4 py-4">
      <div class="admin-page-header">
        <div class="d-flex gap-2">
          <a routerLink="/admin/pagos/nuevo" class="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <i class="bi bi-plus-circle"></i> Registrar Pago
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
            placeholder="ID de pago/cita, paciente o DNI..."
            [(ngModel)]="filtros.q"
            (keyup.enter)="filtrar()"
          />
        </div>
        <div style="width: 210px;">
          <select name="metodo" class="form-select" [(ngModel)]="filtros.metodo">
            <option value="">Todos los métodos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="SIS (Seguro Integral)">SIS</option>
            <option value="Presencial">Presencial</option>
          </select>
        </div>
        <div style="width: 210px;">
          <select name="estado" class="form-select" [(ngModel)]="filtros.estado">
            <option value="">Todos los estados</option>
            <option value="PAGADO">Pagado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        <div style="width: 155px;">
          <input type="date" name="desde" class="form-control" [(ngModel)]="filtros.desde" aria-label="Desde" />
        </div>
        <div style="width: 155px;">
          <input type="date" name="hasta" class="form-control" [(ngModel)]="filtros.hasta" aria-label="Hasta" />
        </div>
        <div>
          <button type="button" class="btn btn-primary btn-sm px-3 py-2" (click)="filtrar()">Filtrar</button>
          <button type="button" class="btn btn-outline-secondary btn-sm px-3 py-2" (click)="limpiar()">Limpiar</button>
        </div>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-body p-0">
          @if (cargando) {
            <p class="text-muted p-4 mb-0">Cargando pagos…</p>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 admin-table-light">
                <thead>
                  <tr>
                    <th>ID Pago</th>
                    <th>ID Cita</th>
                    <th>Paciente / Servicio</th>
                    <th>Monto</th>
                    <th>Fecha de pago</th>
                    <th>Método</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of pagos; track p.idPago) {
                    <tr>
                      <td class="fw-semibold text-muted">#{{ p.idPago }}</td>
                      <td>
                        <span class="badge bg-light text-primary border border-primary border-opacity-25 text-decoration-none px-2 py-1">
                          <i class="bi bi-calendar-event me-1"></i> Cita #{{ p.idCita }}
                        </span>
                      </td>
                      <td>
                        <div class="fw-bold text-dark">{{ p.nombrePaciente || 'Paciente no asignado' }}</div>
                        <small class="text-muted">Dr. {{ p.nombreMedico || 'Médico no asignado' }}</small>
                      </td>
                      <td class="admin-monto">S/ {{ formatoMonto(p.monto) }}</td>
                      <td class="text-muted">{{ p.fechaPago ?? '-' }}</td>
                      <td>
                        <span class="badge bg-light text-secondary border px-2 py-1">{{ p.metodoPago }}</span>
                      </td>
                      <td>
                        <span class="badge" [class]="estadoClase(p.estado)">{{ p.estado }}</span>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-5">
                        <i class="bi bi-receipt fs-2 d-block mb-2 text-secondary"></i>
                        No existen pagos registrados en el sistema.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="p-3 border-top d-flex justify-content-between align-items-center bg-white">
              <small class="text-muted"><strong class="text-dark">{{ pagos.length }}</strong> pagos encontrados</small>
            </div>
          }
        </div>
      </div>
    </main>

    <footer class="admin-footer">
      <small>© 2026 Centro Médico Buenos Aires de Villa</small>
    </footer>
  `,
})
export class AdminPagosComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  pagos: Pago[] = [];
  cargando = true;
  error: string | null = null;

  filtros: FiltrosPagos = { q: '', metodo: '', estado: '', desde: '', hasta: '' };

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.cargando = true;
    this.error = null;
    this.service.getPagos(this.filtros).subscribe({
      next: (pagos) => {
        this.pagos = pagos;
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
    this.cargarPagos();
  }

  limpiar(): void {
    this.filtros = { q: '', metodo: '', estado: '', desde: '', hasta: '' };
    this.cargarPagos();
  }

  estadoClase(estado: string): string {
    switch (estado) {
      case 'PAGADO':
        return 'admin-badge-pagado';
      case 'PENDIENTE':
        return 'admin-badge-pendiente';
      default:
        return 'admin-badge-cancelado';
    }
  }

  formatoMonto(monto: number): string {
    return (monto ?? 0).toFixed(2);
  }
}
