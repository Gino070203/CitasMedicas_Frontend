import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Cita } from '../../../core/models/cita.model';
import { MedicoPanelService } from '../medico-panel.service';
import { extraerMensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-medico-diagnostico',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  template: `
    <main class="diagnosis-page">
      <a class="back-link" routerLink="/medico/dashboard"><i class="bi bi-arrow-left" aria-hidden="true"></i> Volver a mi agenda</a>
      <section class="card">
        <header><span class="eyebrow"><i class="bi bi-clipboard2-pulse" aria-hidden="true"></i> ATENCIÓN MÉDICA</span><h1>Registrar diagnóstico</h1><p>Anota el diagnóstico y las indicaciones clínicas para el paciente.</p></header>
        <div class="body">
          @if (error()) { <div class="notice" role="alert"><i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ error() }} @if (!cita()) { <button type="button" (click)="cargar()">Reintentar</button> }</div> }
          @if (cargando()) { <div class="loading" role="status">Cargando datos de la cita…</div> }
          @if (!cargando() && cita(); as c) {
            <div class="patient-summary">
              <div class="summary-item"><span>Paciente</span><strong><i class="bi bi-person-circle" aria-hidden="true"></i>{{ c.nombrePaciente }}</strong></div>
              <div class="summary-item"><span>Fecha y hora</span><strong><i class="bi bi-calendar3" aria-hidden="true"></i>{{ c.fecha | date:'dd/MM/yyyy' }} · {{ c.horaInicio }} – {{ c.horaFin }}</strong></div>
              <div class="summary-item"><span>Estado</span><strong><i class="bi bi-info-circle" aria-hidden="true"></i>{{ c.estado }}</strong></div>
            </div>
            <form [formGroup]="form" (ngSubmit)="guardar()">
              <label for="diagnostico">Diagnóstico e indicaciones <span>*</span></label>
              <p class="help">Describe las observaciones clínicas, medicamentos o indicaciones para el paciente.</p>
              <textarea id="diagnostico" formControlName="diagnostico" rows="7" maxlength="500" placeholder="Escribe aquí el diagnóstico y las indicaciones…" [readonly]="!editable()"></textarea>
              <div class="field-meta"><span [class.invalid]="form.controls.diagnostico.touched && form.controls.diagnostico.invalid">{{ form.controls.diagnostico.touched && form.controls.diagnostico.invalid ? 'El diagnóstico es obligatorio.' : 'Máximo 500 caracteres.' }}</span><span>{{ form.controls.diagnostico.value.length }}/500</span></div>
              @if (!editable()) { <div class="read-only"><i class="bi bi-lock" aria-hidden="true"></i> Esta cita ya está cerrada y no admite cambios.</div> }
              <div class="actions"><a class="button secondary" routerLink="/medico/dashboard"><i class="bi bi-x-lg" aria-hidden="true"></i> Cancelar</a><button class="button primary" type="submit" [disabled]="form.invalid || guardando() || !editable()"><i class="bi bi-check-circle" aria-hidden="true"></i>{{ guardando() ? 'Guardando…' : 'Guardar y marcar como atendida' }}</button></div>
            </form>
          }
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host {display:block;flex:1} * {box-sizing:border-box}.diagnosis-page {width:min(850px,100%);margin:0 auto;padding:34px 22px 48px}.back-link {display:inline-flex;align-items:center;gap:7px;margin-bottom:17px;color:#1767b2;text-decoration:none;font-size:12px;font-weight:600}.back-link:hover {text-decoration:underline}.card {overflow:hidden;border:1px solid #e2e8f0;border-radius:14px;background:#fff;box-shadow:0 5px 22px #0f172a0a}.card header {padding:24px 30px;border-bottom:1px solid #e2e8f0}.eyebrow {color:#1767b2;font-size:10px;font-weight:700;letter-spacing:1px}.card h1 {margin:8px 0 5px;color:#0f172a;font-size:23px}.card header p {margin:0;color:#64748b;font-size:13px}.body {padding:28px 30px}.patient-summary {display:grid;grid-template-columns:1fr 1.3fr .8fr;gap:13px;padding:17px;margin-bottom:25px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.summary-item {min-width:0;display:flex;flex-direction:column;gap:7px}.summary-item span {color:#64748b;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}.summary-item strong {display:flex;align-items:center;gap:7px;color:#1e293b;font-size:12px;line-height:1.4}.summary-item strong i {color:#1767b2}.card label {display:block;margin-bottom:5px;color:#334155;font-size:13px;font-weight:700}.card label span {color:#dc2626}.help {margin:0 0 10px;color:#64748b;font-size:11px}textarea {width:100%;min-height:165px;padding:12px 14px;resize:vertical;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#1e293b;font:13px/1.6 Arial,sans-serif}textarea:focus {outline:3px solid #1767b220;border-color:#1767b2}textarea[readonly] {background:#f8fafc;color:#64748b}.field-meta {display:flex;justify-content:space-between;margin-top:6px;color:#94a3b8;font-size:10px}.field-meta .invalid {color:#b91c1c}.read-only {margin-top:12px;padding:11px;border-radius:8px;background:#f1f5f9;color:#475569;font-size:12px}.actions {display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:23px;padding-top:19px;border-top:1px solid #e2e8f0}.button {display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border:1px solid transparent;border-radius:8px;text-decoration:none;cursor:pointer;font-size:12px;font-weight:700}.primary {background:#16804a;color:#fff}.primary:hover {background:#12683c}.primary:disabled {opacity:.55;cursor:not-allowed}.secondary {border-color:#cbd5e1;background:#fff;color:#475569}.secondary:hover {background:#f8fafc}.notice {display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:12px;border:1px solid #fecaca;border-radius:8px;background:#fef2f2;color:#991b1b;font-size:12px}.loading {padding:40px 0;text-align:center;color:#64748b;font-size:13px}
    @media(max-width:620px) {.diagnosis-page {padding:23px 15px 34px}.card header,.body {padding:22px 18px}.patient-summary {grid-template-columns:1fr}.actions {flex-direction:column-reverse}.actions .button {width:100%}}
  `],
})
export class MedicoDiagnosticoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MedicoPanelService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  cita = signal<Cita | null>(null);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({ diagnostico: ['', [Validators.required, Validators.maxLength(500)]] });

  ngOnInit(): void {
    if (!Number.isSafeInteger(this.id) || this.id < 1) {
      this.error.set('El identificador de la cita no es válido.');
      this.cargando.set(false);
      return;
    }
    this.cargar();
  }

  editable(): boolean {
    return !['CANCELADA', 'ATENDIDA', 'NO_ASISTIO'].includes((this.cita()?.estado ?? '').toUpperCase());
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.obtenerCita(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: cita => {
        this.cita.set(cita);
        this.form.controls.diagnostico.setValue(cita.diagnostico ?? '');
        this.cargando.set(false);
      },
      error: err => { this.error.set(extraerMensajeError(err)); this.cargando.set(false); },
    });
  }

  guardar(): void {
    if (this.form.invalid || this.guardando() || !this.editable()) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.service.guardarDiagnostico(this.id, { diagnostico: this.form.controls.diagnostico.value.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.router.navigate(['/medico/dashboard']),
        error: err => { this.error.set(extraerMensajeError(err)); this.guardando.set(false); },
      });
  }
}
