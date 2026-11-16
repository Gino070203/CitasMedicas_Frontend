import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Medico } from '../../../core/models/medico.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService } from '../services/admin.service';
import { DIAS, HorariosService } from './horarios.service';
function validarHoras(c: AbstractControl) {
  const inicio = c.get('horaInicio')?.value;
  const fin = c.get('horaFin')?.value;
  return inicio && fin && inicio >= fin ? { ordenHoras: true } : null;
}
@Component({
  selector: 'app-admin-horario-form', imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="form-page"><section class="form-card"><header class="form-header"><span><i class="bi bi-calendar-week" aria-hidden="true"></i> Módulo de Agenda Médica</span><h1>Registrar bloque de atención médica</h1><p>Define la franja semanal en que el médico atiende.</p></header><div class="form-body">
      @if (error()) { <div class="notice error" role="alert">{{ error() }}</div> }
      @if (cargando()) { <p role="status">Cargando médicos…</p> } @else if (falloCarga()) { <button type="button" class="medical-btn secondary" (click)="cargar()">Reintentar</button> } @else {
        <form [formGroup]="form" (ngSubmit)="guardar()"><div class="field user-field"><label for="horario-medico">Médico <span>*</span></label><select id="horario-medico" formControlName="idMedico" required><option [ngValue]="0" disabled>Seleccione un médico</option>@for (m of medicos(); track m.idMedico) { <option [ngValue]="m.idMedico">{{ m.nombre }} {{ m.apellido }} - {{ m.especialidadNombre }}</option> }</select>@if (!medicos().length) { <small>No hay médicos activos disponibles. <a routerLink="/admin/medicos">Ir a Médicos</a>.</small> } @if (form.controls.idMedico.touched && form.controls.idMedico.invalid) { <small class="validation">Selecciona un médico.</small> }</div>
          <div class="field user-field"><label for="horario-dia">Día de atención <span>*</span></label><select id="horario-dia" formControlName="diaSemana" required><option value="" disabled>Seleccione un día</option>@for (d of dias; track d.valor) { <option [value]="d.valor">{{ d.nombre }}</option> }</select>@if (form.controls.diaSemana.touched && form.controls.diaSemana.invalid) { <small class="validation">Selecciona un día.</small> }</div>
          <div class="fields-grid"><div class="field"><label for="horario-inicio">Inicio del bloque <span>*</span></label><input type="time" id="horario-inicio" formControlName="horaInicio" step="60" required />@if (form.controls.horaInicio.touched && form.controls.horaInicio.invalid) { <small class="validation">Ingresa una hora válida.</small> }</div><div class="field"><label for="horario-fin">Fin del bloque <span>*</span></label><input type="time" id="horario-fin" formControlName="horaFin" step="60" required />@if (form.controls.horaFin.touched && form.controls.horaFin.invalid) { <small class="validation">Ingresa una hora válida.</small> }</div></div>
          @if (form.hasError('ordenHoras')) { <div class="notice error" role="alert">La hora de fin debe ser posterior a la hora de inicio.</div> }
          <div class="info-banner"><i class="bi bi-info-circle" aria-hidden="true"></i><span>Este bloque es una disponibilidad semanal. El centro calcula los turnos según su duración de consulta y valida que el bloque admita al menos uno y no se superponga con otro horario.</span></div>
          <div class="form-actions"><a routerLink="/admin/horarios" class="medical-btn secondary">Cancelar</a><button type="submit" class="medical-btn save-btn" [disabled]="form.invalid || guardando()"><i class="bi bi-check-circle" aria-hidden="true"></i>{{ guardando() ? 'Guardando…' : 'Guardar bloque' }}</button></div>
        </form>
      }
      @if (cargando() || falloCarga()) { <a routerLink="/admin/horarios" class="medical-btn secondary">Volver al listado</a> }
    </div></section></main><footer class="medical-footer">© 2026 Centro Médico Buenos Aires de Villa</footer>
  `, styles: [`
:host { display: flex; flex-direction: column; flex: 1; min-width: 0; background: #f8fafc; color: #1e293b; font-family: Arial, sans-serif; }
* { box-sizing: border-box; }
.medicos-page { flex: 1; padding: 24px; min-width: 0; }
.page-actions { display: flex; margin-bottom: 25px; }
.medical-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 9px 14px; border: 1px solid transparent; border-radius: 4px; font: 600 13px Arial, sans-serif; text-decoration: none; cursor: pointer; }
.primary { background: #1767b2; border-color: #1767b2; color: white; }
.primary:hover { background: #123b70; }
.secondary { background: white; border-color: #64748b; color: #64748b; font-weight: 400; }
.secondary:hover { background: #f1f5f9; }
.filter-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px; margin-bottom: 20px; background: white; border: 1px solid #dce5f2; border-radius: 12px; }
input, select { min-height: 38px; padding: 9px 12px; background: #f8fafc; border: 1px solid #dce5f2; border-radius: 6px; font: 13px Arial, sans-serif; color: #1e293b; }
.search-field { flex: 1 1 260px; position: relative; }
.search-field input { width: 100%; padding-left: 35px; }
.search-field i { position: absolute; left: 12px; top: 12px; color: #648fbb; font-size: 13px; }
select[name=especialidad] { flex: 0 1 240px; }
select[name=estado] { flex: 0 1 170px; }
.filter-actions { display: flex; gap: 5px; }
.list-card { background: white; border-radius: 10px 10px 0 0; box-shadow: 0 2px 5px #0b1f3614; overflow: hidden; }
.list-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 17px; border-bottom: 1px solid #dce3ed; }
h2 { display: flex; align-items: center; gap: 9px; margin: 0; color: #172333; font-size: 16px; font-weight: 700; }
h2 i { color: #1767ff; }
.count, .credential, .specialty { display: inline-block; border: 1px solid #dce1e9; border-radius: 5px; background: #f8fafc; padding: 3px 8px; font-size: 12px; line-height: 1.2; white-space: nowrap; }
.count { font-size: 11px; color: #64748b; }
.specialty { border-color: #b9d3fe; color: #1767ff; }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 16px 14px; color: #475569; background: #f8fafc; font-size: 12px; text-transform: uppercase; white-space: nowrap; border-bottom: 2px solid #dce5f2; }
td { padding: 14px; font-size: 13px; border-bottom: 1px solid #dce3ed; vertical-align: middle; }
tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #f8fbff; }
.doctor { display: flex; align-items: center; gap: 16px; white-space: nowrap; color: #101c2c; }
.doctor-avatar { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 50%; background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 700; }
.state { display: inline-flex; align-items: center; gap: 10px; border-radius: 20px; padding: 8px 16px; color: #166534; background: #dcfce7; font-size: 11px; font-weight: 700; }
.state.inactive { color: #475569; background: #f1f5f9; }
.actions-column { text-align: center; }
.row-actions { display: flex; justify-content: center; align-items: center; gap: 8px; }
.edit-btn, .state-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 9px; color: #64748b; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; text-decoration: none; cursor: pointer; }
.state-btn { font: 11px Arial, sans-serif; background: white; border-color: #64748b; white-space: nowrap; }
.edit-btn:hover, .state-btn:hover { background: #eaf2fc; color: #123b70; }
button:disabled { opacity: .6; cursor: wait; }
.empty { padding: 40px 20px; text-align: center; color: #64748b; }
.empty i { display: block; font-size: 28px; margin-bottom: 10px; }
.notice { padding: 13px 16px; margin-bottom: 16px; border: 1px solid; border-radius: 8px; font-size: 13px; }
.error { color: #991b1b; background: #fef2f2; border-color: #fecaca; }
.success { color: #166534; background: #f0fdf4; border-color: #bbf7d0; }
.medical-footer { padding: 22px; text-align: center; color: #8296b5; font-size: 12px; background: white; border-top: 1px solid #dce5f2; }
input:focus, select:focus { outline: 3px solid #1767b220; border-color: #1767b2; }
a:focus-visible, button:focus-visible { outline: 3px solid #1767b2; outline-offset: 3px; }
@media (max-width: 767px) { .medicos-page { padding: 16px; } .filter-bar { align-items: stretch; } .search-field, select[name=especialidad], select[name=estado] { flex: 1 1 100%; width: 100%; } .filter-actions { width: 100%; } .filter-actions button { flex: 1; } }
.form-page { flex: 1; width: 100%; max-width: 850px; margin: 0 auto; padding: 48px 20px; }
.form-card { border: 1px solid #e2e8f0; border-radius: 14px; background: white; box-shadow: 0 4px 20px #00000008; overflow: hidden; }
.form-header { padding: 25px 35px; border-bottom: 1px solid #e2e8f0; }
.form-header > span { color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: .5px; font-weight: 600; }
h1 { margin: 8px 0 0; font-size: 22px; color: #172333; font-weight: 700; }
.form-body { padding: 35px; }
.fields-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-bottom: 25px; }
.field { min-width: 0; }
.user-field { margin-bottom: 25px; }
label { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 7px; }
label span, .validation { color: #b91c1c; }
input, select { width: 100%; border-color: #cbd5e1; padding: 10px 14px; min-height: 40px; }
small { display: block; font-size: 11px; color: #64748b; margin-top: 6px; line-height: 1.6; }
small a { color: #1767b2; }
.label-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.label-row small { margin-top: 0; }
.info-banner { display: flex; align-items: center; gap: 12px; padding: 15px 20px; margin-bottom: 25px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; color: #0369a1; font-size: 12px; line-height: 1.7; }
.info-banner > i { font-size: 24px; flex-shrink: 0; }
.form-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
.form-actions .medical-btn { padding: 10px 20px; border-radius: 8px; }
.save-btn { background: #0b1f36; color: white; }
.save-btn:hover { background: #123b70; }
@media (max-width: 600px) { .form-page { padding: 24px 16px; } .form-header, .form-body { padding: 24px 20px; } .fields-grid { grid-template-columns: 1fr; } .label-row { flex-wrap: wrap; gap: 0; margin-bottom: 6px; } }
  `],
})
export class AdminHorarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder); private readonly service = inject(HorariosService); private readonly admin = inject(AdminService); private readonly router = inject(Router); private readonly destroyRef = inject(DestroyRef);
  readonly dias = DIAS; medicos = signal<Medico[]>([]); cargando = signal(true); falloCarga = signal(false); guardando = signal(false); error = signal('');
  form = this.fb.nonNullable.group({ idMedico: [0, [Validators.required, Validators.min(1)]], diaSemana: ['', [Validators.required, Validators.pattern(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)$/)]], horaInicio: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]], horaFin: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]] }, { validators: validarHoras });
  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.cargando.set(true); this.falloCarga.set(false); this.error.set(''); this.admin.getMedicos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: datos => { this.medicos.set(datos); this.cargando.set(false); }, error: err => { this.error.set(extraerMensajeError(err)); this.cargando.set(false); this.falloCarga.set(true); } }); }
  guardar(): void {
    if (this.form.invalid || this.guardando() || this.cargando() || this.falloCarga()) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true); this.error.set(''); this.service.crear(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { this.router.navigate(['/admin/horarios']); }, error: err => { this.error.set(extraerMensajeError(err)); this.guardando.set(false); } });
  }
}