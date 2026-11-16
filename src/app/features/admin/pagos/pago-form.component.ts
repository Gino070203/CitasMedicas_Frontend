import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Cita } from '../../../core/models/cita.model';
import { PagoRequest } from '../../../core/models/pago.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-pago-form',
  imports: [ReactiveFormsModule, RouterLink],
  styles: [`:host { display: flex; flex: 1; flex-direction: column; min-width: 0; font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; }
main { flex: 1; }
.admin-form-card { border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.admin-form-header { padding: 28px 34px; background: linear-gradient(110deg,#0b1f36,#1767b2); color: white; }
.admin-form-header h3 { color: white; font-size: 23px; font-weight: 700; }
.admin-form-header p { color: #dceaff; font-size: 13px; line-height: 1.7; }
.form-label { font-size: 13px; font-weight: 700; color: #334155; }
.form-control, .form-select, .input-group-text { padding: 11px 14px; font-size: 13px; background: #f8fafc; border-color: #cbd5e1; }
.form-control:focus, .form-select:focus { background: white; border-color: #1767b2; box-shadow: 0 0 0 3px #1767b21a; }
.seccion { color: #123b70; font-size: 16px; font-weight: 700; }
small { font-size: 12px; line-height: 1.6; }
.admin-info-box { padding: 16px 20px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; color: #0369a1; font-size: 13px; line-height: 1.7; }
.admin-resumen { padding: 22px; border-radius: 12px; background: #f8fafc; border: 1px solid #dce5f2; font-size: 13px; }
.admin-resumen h6 { color: #123b70; }
.admin-resumen .d-flex { gap: 20px; }
.admin-resumen strong { text-align: right; }
.admin-warning-box { padding: 16px 20px; border: 1px solid #fde68a; border-radius: 10px; background: #fffbeb; color: #92400e; font-size: 12px; line-height: 1.7; }
.btn-success { background: #123b70; border-color: #123b70; font-size: 13px; font-weight: 600; padding-top: 10px; padding-bottom: 10px; }
.btn-success:hover { background: #1767b2; border-color: #1767b2; }
.btn-outline-secondary { font-size: 13px; padding-top: 10px; padding-bottom: 10px; }
.modal-content { border: 0; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 60px #0b1f3633; }
.modal-header { background: #f0f7ff; border-bottom-color: #dce5f2; }
.modal-title { font-size: 18px; color: #123b70; font-weight: 700; }
.modal-body { font-size: 14px; line-height: 1.8; }
.admin-footer { margin-top: auto; padding: 22px; background: white; border-top: 1px solid #dce5f2; color: #8296b5; text-align: center; font-size: 12px; }
@media(max-width:575px) { .admin-form-header { padding: 24px; } .admin-resumen { padding: 16px; } .admin-resumen .d-flex { flex-wrap: wrap; gap: 6px; } }`],
  template: `
    <main class="container-fluid px-4 py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card admin-form-card shadow-sm">
            <div class="admin-form-header">
              <h3 class="mb-2"><i class="bi bi-cash-coin me-2"></i> Registrar pago de cita médica</h3>
              <p class="mb-0">Registra los pagos particulares de las citas pendientes sin cobertura SIS verificada.</p>
            </div>

            <div class="card-body p-4 p-md-5">
              @if (error) {
                <div class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
                </div>
              }

              <div class="admin-info-box mb-4">
                <i class="bi bi-shield-check text-primary me-2"></i>
                <strong>Atención con SIS:</strong> Los pacientes con SIS vigente y atención cubierta no requieren
                realizar un pago particular. Sus citas deben registrarse directamente como confirmadas.
              </div>

              @if (cargando) {
                <p class="text-muted">Cargando citas pendientes…</p>
              } @else if (falloCarga) { <button type="button" class="btn btn-outline-secondary" (click)="ngOnInit()">Reintentar cargar citas</button> } @else if (citas.length === 0) {
                <div class="text-center py-4">
                  <i class="bi bi-check-circle-fill text-success display-4"></i>
                  <h5 class="mt-3">No hay citas pendientes de pago</h5>
                  <p class="text-muted">Actualmente no existen citas particulares que necesiten registrar un pago.</p>
                  <a routerLink="/admin/pagos" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left me-1"></i> Volver al listado
                  </a>
                </div>
              } @else {
                <form [formGroup]="form" (ngSubmit)="abrirModalConfirmacion()">
                  <h5 class="seccion mb-3"><i class="bi bi-calendar-check me-2"></i> Datos de la cita</h5>
                  <div class="mb-4">
                    <label class="form-label">Seleccionar cita pendiente</label>
                    <select class="form-select" formControlName="idCita">
                      <option value="">Seleccione una cita</option>
                      @for (c of citas; track c.idCita) {
                        <option [value]="c.idCita">Cita N.º {{ c.idCita }} - {{ c.nombrePaciente }} - {{ c.fecha }}</option>
                      }
                    </select>
                    @if ((form.controls.idCita.touched || form.controls.idCita.dirty) && form.controls.idCita.errors?.['required']) {
                      <small class="text-danger d-block">Selecciona una cita.</small>
                    }
                    <small class="text-muted">Solo aparecen citas pendientes de pago sin cobertura SIS verificada.</small>
                  </div>

                  <hr class="my-4" />

                  <h5 class="seccion mb-3"><i class="bi bi-wallet2 me-2"></i> Información del pago</h5>

                  <div class="mb-4">
                    <label class="form-label">Monto a pagar (S/)</label>
                    <div class="input-group">
                      <span class="input-group-text">S/</span>
                      <input type="number" class="form-control" min="0.01" step="0.01" placeholder="Ejemplo: 30.00" formControlName="monto" />
                    </div>
                    @if ((form.controls.monto.touched || form.controls.monto.dirty) && form.controls.monto.errors?.['min']) {
                      <small class="text-danger d-block">El monto debe ser mayor que 0.</small>
                    }
                    <small class="text-muted">Ingresa el importe correspondiente a la atención médica.</small>
                  </div>

                  <div class="mb-4">
                    <label class="form-label">Método de pago</label>
                    <select class="form-select" formControlName="metodoPago">
                      <option value="">Seleccione un método</option>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="TRANSFERENCIA">Transferencia bancaria</option>
                    </select>
                    @if ((form.controls.metodoPago.touched || form.controls.metodoPago.dirty) && form.controls.metodoPago.errors?.['required']) {
                      <small class="text-danger d-block">Selecciona un método de pago.</small>
                    }
                  </div>

                  <div class="admin-resumen mb-4">
                    <h6 class="fw-bold mb-3"><i class="bi bi-receipt me-2"></i> Resumen del pago</h6>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Cita seleccionada:</span>
                      <strong>{{ resumenCita }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Método de pago:</span>
                      <strong>{{ resumenMetodo }}</strong>
                    </div>
                    <hr />
                    <div class="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <strong class="fs-4 text-success">{{ resumenMonto }}</strong>
                    </div>
                  </div>

                  <div class="admin-warning-box mb-4">
                    <i class="bi bi-exclamation-circle-fill text-warning me-2"></i>
                    <strong>Importante:</strong> Al registrar el pago, la cita médica cambiará automáticamente de
                    <strong>PENDIENTE_PAGO</strong> a <strong>CONFIRMADA</strong>.
                  </div>

                  <div class="d-flex flex-wrap gap-2">
                    <button type="submit" class="btn btn-success px-4" [disabled]="form.invalid || guardando">
                      <i class="bi bi-check-circle me-1"></i> Registrar pago
                    </button>
                    <a routerLink="/admin/pagos" class="btn btn-outline-secondary px-4">
                      <i class="bi bi-x-circle me-1"></i> Cancelar
                    </a>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="admin-footer">© 2026 Centro Médico Buenos Aires de Villa</footer>
    @if (modalConfirmacion) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="confirmar-pago-titulo" (keydown.escape)="cerrarModalConfirmacion()">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 id="confirmar-pago-titulo" class="modal-title"><i class="bi bi-cash-coin text-success me-2"></i> Confirmar pago</h5>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="cerrarModalConfirmacion()"></button>
            </div>
            <div class="modal-body">
              <p>{{ resumenCita }}</p><p>Método: <strong>{{ resumenMetodo }}</strong> · Total: <strong>{{ resumenMonto }}</strong></p>¿Confirmas que recibiste el pago y deseas confirmar esta cita médica?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalConfirmacion()" [disabled]="guardando">
                Cerrar
              </button>
              <button type="button" class="btn btn-success" (click)="confirmarPago()" [disabled]="guardando">
                <i class="bi bi-check-circle me-1"></i>
                {{ guardando ? 'Registrando…' : 'Sí, registrar pago' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminPagoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdminService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  cargando = true;
  guardando = false;
  error: string | null = null;
  modalConfirmacion = false;
  falloCarga = false;

  form = this.fb.nonNullable.group({
    idCita: ['', [Validators.required]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodoPago: ['', [Validators.required, Validators.pattern(/^(EFECTIVO|TARJETA|TRANSFERENCIA)$/)]],
  });

  ngOnInit(): void {
    this.cargando = true;
    this.falloCarga = false;
    this.error = null;
    this.service.getCitasPendientes().subscribe({
      next: (citas) => {
        this.citas = citas;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.falloCarga = true;
        this.error = extraerMensajeError(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get resumenCita(): string {
    const id = Number(this.form.controls.idCita.value);
    const c = this.citas.find((x) => x.idCita === id);
    return c ? `Cita N.º ${c.idCita} - ${c.nombrePaciente} - ${c.fecha}` : 'Ninguna';
  }

  get resumenMetodo(): string {
    return this.form.controls.metodoPago.value || 'No seleccionado';
  }

  get resumenMonto(): string {
    return `S/ ${Number(this.form.controls.monto.value || 0).toFixed(2)}`;
  }

  abrirModalConfirmacion(): void {
    if (this.form.invalid || this.guardando || this.cargando || this.falloCarga) {
      return;
    }
    this.modalConfirmacion = true;
  }

  cerrarModalConfirmacion(): void {
    if (!this.guardando) {
      this.modalConfirmacion = false;
    }
  }

  confirmarPago(): void {
    if (!this.modalConfirmacion || this.guardando || this.form.invalid || this.falloCarga) return;
    const value = this.form.getRawValue();
    const request: PagoRequest = {
      idCita: Number(value.idCita),
      monto: Number(value.monto),
      metodoPago: value.metodoPago,
    };

    this.guardando = true;
    this.error = null;

    this.service.registrarPago(request).subscribe({
      next: () => this.router.navigate(['/admin/pagos']),
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.guardando = false;
        this.modalConfirmacion = false;
        this.cdr.detectChanges();
      },
    });
  }
}
