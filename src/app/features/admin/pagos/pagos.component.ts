import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Pago } from '../../../core/models/pago.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService, FiltrosPagos } from '../services/admin.service';

@Component({
  selector: 'app-admin-pagos',
  imports: [RouterLink, FormsModule],
  styles: [`:host { display: flex; flex: 1; flex-direction: column; min-width: 0; background: #f8fafc; font-family: Arial, sans-serif; color: #1e293b; }
main { flex: 1; }
.admin-page-header { margin-bottom: 25px; }
.admin-filter-bar { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; padding: 18px; margin-bottom: 22px; background: white; border: 1px solid #dce5f2; border-radius: 12px; }
.admin-filter-bar .flex-grow-1 { min-width: 220px; }
.admin-filter-bar .form-control, .admin-filter-bar .form-select { padding: 10px 12px; font-size: 13px; background: #f8fafc; border-color: #dce5f2; border-radius: 6px; }
.date-label { display: block; color: #64748b; font-size: 11px; margin-bottom: 6px; }
.btn-primary { background: #1767b2; border-color: #1767b2; font-size: 13px; font-weight: 600; }
.btn-primary:hover { background: #123b70; border-color: #123b70; }
.card { border-radius: 12px; overflow: hidden; }
.admin-table-light thead th { padding: 16px 14px; background: #f8fafc; color: #475569; border-bottom: 2px solid #dce5f2; font-size: 12px; text-transform: uppercase; white-space: nowrap; }
.admin-table-light td { padding: 20px 14px; border-color: #e2e8f0; font-size: 13px; }
.admin-table-light small { display: block; margin-top: 5px; font-size: 12px; }
.admin-monto { color: #123b70; font-weight: 700; white-space: nowrap; }
.badge { padding: 6px 9px; border-radius: 5px; font-size: 11px; font-weight: 500; }
.admin-badge-pagado, .admin-badge-pendiente, .admin-badge-cancelado { display: inline-block; padding: 8px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.admin-badge-pagado { color: #166534; background: #dcfce7; }
.admin-badge-pendiente { color: #92400e; background: #fef3c7; }
.admin-badge-cancelado { color: #991b1b; background: #fee2e2; }
.admin-footer { margin-top: auto; padding: 22px; background: white; border-top: 1px solid #dce5f2; color: #8296b5; text-align: center; font-size: 12px; }
.form-control:focus, .form-select:focus { border-color: #1767b2; box-shadow: 0 0 0 3px #1767b21a; }
@media(max-width:767px) { .admin-filter-bar > div { width: 100% !important; } .admin-filter-bar .flex-grow-1 { min-width: 0; } }`],
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

      <form class="admin-filter-bar" (ngSubmit)="filtrar()">
        <div class="flex-grow-1">
          <input
            type="search"
            name="q"
            class="form-control"
            placeholder="ID de pago/cita, paciente o DNI..."
            [(ngModel)]="filtros.q"

          />
        </div>
        <div style="width: 210px;">
          <select aria-label="Método de pago" name="metodo" class="form-select" [(ngModel)]="filtros.metodo">
            <option value="">Todos los métodos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="SIS (Seguro Integral)">SIS</option>
            <option value="PRESENCIAL">Presencial</option>
          </select>
        </div>
        <div style="width: 210px;">
          <select aria-label="Estado del pago" name="estado" class="form-select" [(ngModel)]="filtros.estado">
            <option value="">Todos los estados</option>
            <option value="PAGADO">Pagado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        <div style="width: 155px;">
          <label class="date-label" for="pagos-desde">Desde</label><input id="pagos-desde" type="date" name="desde" class="form-control" [(ngModel)]="filtros.desde" aria-label="Desde" />
        </div>
        <div style="width: 155px;">
          <label class="date-label" for="pagos-hasta">Hasta</label><input id="pagos-hasta" type="date" name="hasta" class="form-control" [(ngModel)]="filtros.hasta" aria-label="Hasta" />
        </div>
        <div>
          <button type="submit" class="btn btn-primary btn-sm px-3 py-2">Filtrar</button>
          <button type="button" class="btn btn-outline-secondary btn-sm px-3 py-2" (click)="limpiar()">Limpiar</button>
        </div>
      </form>

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
                        {{ error ? 'No se pudieron cargar los pagos. Intenta filtrar nuevamente.' : 'No hay pagos que coincidan con los filtros.' }}
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
    if (this.filtros.desde && this.filtros.hasta && this.filtros.desde > this.filtros.hasta) {
      this.error = 'La fecha Desde no puede ser posterior a Hasta.';
      return;
    }
    this.cargando = true;
    this.error = null;
    this.service.getPagos(this.filtros).subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.pagos = [];
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
