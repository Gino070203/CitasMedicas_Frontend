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
  template: `
    <main class="container-fluid px-4 py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card admin-form-card shadow-sm">
            <div class="admin-form-header">
              <h3 class="mb-2"><i class="bi bi-cash-coin me-2"></i> Registrar pago de cita médica</h3>
              <p class="mb-0">Registra los pagos particulares de los pacientes que no cuentan con SIS.</p>
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
              } @else if (citas.length === 0) {
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
                    <small class="text-muted">Solo aparecen citas pendientes de pago de pacientes sin SIS.</small>
                  </div>

                  <hr class="my-4" />

                  <h5 class="seccion mb-3"><i class="bi bi-wallet2 me-2"></i> Información del pago</h5>

                  <div class="mb-4">
                    <label class="form-label">Monto a pagar (S/)</label>
                    <div class="input-group">
                      <span class="input-group-text">S/</span>
                      <input type="number" class="form-control" min="0.01" step="0.01" placeholder="Ejemplo: 30.00" formControlName="monto" />
                    </div>
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
                    <button type="submit" class="btn btn-success px-4" [disabled]="form.invalid">
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

    @if (modalConfirmacion) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="bi bi-cash-coin text-success me-2"></i> Confirmar pago</h5>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="cerrarModalConfirmacion()"></button>
            </div>
            <div class="modal-body">
              ¿Confirmas que recibiste el pago y deseas confirmar esta cita médica?
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

  form = this.fb.nonNullable.group({
    idCita: ['', [Validators.required]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodoPago: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.service.getCitasPendientes().subscribe({
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
    if (this.form.invalid) {
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
