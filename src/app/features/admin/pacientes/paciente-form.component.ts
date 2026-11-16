import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Paciente } from '../../../core/models/paciente.model';
import { Usuario } from '../../../core/models/usuario.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService } from '../services/admin.service';
import { PacientesService } from './pacientes.service';

function hoyLima(): string {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(tipo => partes.find(p => p.type === tipo)?.value).join('-');
}
function fechaValida(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '');
  if (!valor) return null;
  const fecha = new Date(valor + 'T00:00:00Z');
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor && valor <= hoyLima() ? null : { fecha: true };
}
@Component({
  selector: 'app-admin-paciente-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="form-page"><section class="form-card">
      <header class="form-header"><span><i class="bi bi-people" aria-hidden="true"></i> Módulo de Admisión y Registro</span><h1>{{ id === null ? 'Registrar Nuevo Paciente' : 'Editar Paciente' }}</h1></header>
      <div class="form-body">
        @if (error()) { <div class="notice error" role="alert">{{ error() }}</div> }
        @if (cargando()) { <p role="status">Cargando datos del paciente…</p> }
        @if (falloCarga()) { <button class="medical-btn secondary" type="button" (click)="cargar()">Reintentar</button> }
        @if (!cargando() && !falloCarga()) {
          @if (paciente(); as p) { <div class="info-banner"><i class="bi bi-person-badge" aria-hidden="true"></i><span>Editando datos del paciente: <strong>{{ p.nombre }} {{ p.apellido }}</strong></span></div> }
          <form [formGroup]="form" (ngSubmit)="guardar()">
            @if (id === null) {
              <div class="field user-field"><label for="paciente-usuario">Usuario paciente <span>*</span></label><select id="paciente-usuario" formControlName="idUsuario" required><option [ngValue]="0" disabled>Seleccione un usuario registrado</option>@for (u of usuarios(); track u.idUsuario) { <option [ngValue]="u.idUsuario">{{ u.nombre }} {{ u.apellido }} - DNI: {{ u.dni }}</option> }</select>
                <small>Selecciona una cuenta con rol Paciente que aún no tenga historia clínica.</small>
                @if (!usuarios().length) { <small>No hay cuentas disponibles. <a routerLink="/admin/usuarios/nuevo">Registrar un usuario paciente</a>.</small> }
                @if (form.controls.idUsuario.touched && form.controls.idUsuario.invalid) { <small class="validation">Selecciona un usuario paciente.</small> }
              </div>
            }
            <div class="fields-grid">
              <div class="field"><label for="paciente-historia">Número de historia clínica <span>*</span></label><input id="paciente-historia" formControlName="numeroHistoria" maxlength="20" placeholder="Ej. HC-2026-001" required />
                @if (form.controls.numeroHistoria.touched && form.controls.numeroHistoria.invalid) { <small class="validation">Ingresa una historia clínica de hasta 20 caracteres.</small> }
                @if (id !== null) { <label class="check-label" for="historia-verificada"><input type="checkbox" id="historia-verificada" formControlName="numeroHistoriaVerificado" /> Historia clínica revisada y verificada por el centro</label> }
              </div>
              <div class="field"><label for="paciente-sis">SIS (Seguro Integral de Salud)</label><input id="paciente-sis" formControlName="sis" maxlength="8" inputmode="numeric" placeholder="Ej. 12345678" />
                @if ((form.controls.sis.touched || form.controls.sis.dirty) && form.controls.sis.errors?.['pattern']) { <small class="validation">El SIS debe tener 8 dígitos.</small> }
                @if (id !== null) { <label class="check-label" for="sis-verificado"><input type="checkbox" id="sis-verificado" formControlName="sisVerificado" /> Afiliación SIS revisada y verificada por el centro</label> }
              </div>
              <div class="field"><label for="paciente-nacimiento">Fecha de nacimiento <span>*</span></label><input id="paciente-nacimiento" type="date" formControlName="fechaNacimiento" [max]="hoy" required />
                @if (form.controls.fechaNacimiento.touched && form.controls.fechaNacimiento.invalid) { <small class="validation">Ingresa una fecha válida que no sea futura.</small> }
              </div>
              <div class="field"><label for="paciente-genero">Género <span>*</span></label><select id="paciente-genero" formControlName="genero" required><option value="" disabled>Seleccione género</option><option value="MASCULINO">Masculino</option><option value="FEMENINO">Femenino</option><option value="OTRO">Otro</option></select>
                @if (form.controls.genero.touched && form.controls.genero.invalid) { <small class="validation">Selecciona un género.</small> }
              </div>
            </div>
            <div class="field user-field"><label for="paciente-direccion">Dirección</label><input id="paciente-direccion" formControlName="direccion" maxlength="100" placeholder="Ej. Av. Principal 123, Urb. Los Pinos" autocomplete="street-address" />
              @if (form.controls.direccion.touched && form.controls.direccion.invalid) { <small class="validation">La dirección admite hasta 100 caracteres.</small> }
            </div>
            <div class="form-actions"><a routerLink="/admin/pacientes" class="medical-btn secondary"><i class="bi bi-x" aria-hidden="true"></i> Cancelar</a><button class="medical-btn save-btn" type="submit" [disabled]="form.invalid || guardando()"><i class="bi bi-check-circle" aria-hidden="true"></i>{{ guardando() ? 'Guardando…' : (id === null ? 'Guardar Paciente' : 'Actualizar Paciente') }}</button></div>
          </form>
        }
        @if (cargando() || falloCarga()) { <a routerLink="/admin/pacientes" class="medical-btn secondary">Volver al listado</a> }
      </div>
    </section></main>
    <footer class="medical-footer">© 2026 Centro Médico Buenos Aires de Villa</footer>
  `,
  styles: [`
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
  
    .check-label { display: flex; align-items: flex-start; gap: 8px; margin-top: 12px; font-size: 12px; font-weight: 400; line-height: 1.5; color: #64748b; }
    .check-label input { width: 16px; height: 16px; min-height: 0; padding: 0; flex-shrink: 0; margin-top: 2px; accent-color: #1767b2; }
  `],
})
export class AdminPacienteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PacientesService);
  private readonly admin = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
  readonly hoy = hoyLima();
  paciente = signal<Paciente | null>(null);
  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  falloCarga = signal(false);
  guardando = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    idUsuario: [0, [Validators.required, Validators.min(1)]],
    numeroHistoria: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/\S/)]],
    sis: ['', Validators.pattern(/^(?:$|\d{8})$/)],
    fechaNacimiento: ['', [Validators.required, fechaValida]],
    genero: ['', [Validators.required, Validators.pattern(/^(MASCULINO|FEMENINO|OTRO)$/)]],
    direccion: ['', Validators.maxLength(100)],
    numeroHistoriaVerificado: [false], sisVerificado: [false],
  });
  ngOnInit(): void {
    if (this.id !== null) this.form.controls.idUsuario.disable();
    this.cargar();
  }
  cargar(): void {
    this.error.set(''); this.falloCarga.set(false); this.cargando.set(true);
    if (this.id !== null) {
      if (!Number.isSafeInteger(this.id) || this.id < 1) { this.error.set('Identificador de paciente inválido.'); this.cargando.set(false); this.falloCarga.set(true); return; }
      this.service.obtener(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: p => {
          this.paciente.set(p);
          this.form.patchValue({ numeroHistoria: p.numeroHistoria ?? '', sis: p.sis ?? '', fechaNacimiento: p.fechaNacimiento ?? '', genero: p.genero ?? '', direccion: p.direccion ?? '', numeroHistoriaVerificado: !!p.numeroHistoria && p.numeroHistoriaVerificado !== false, sisVerificado: !!p.sis && p.sisVerificado !== false });
          this.cargando.set(false);
        }, error: err => this.errorCarga(err),
      });
    } else {
      forkJoin({ usuarios: this.admin.getUsuarios({ q: '', rol: 'PACIENTE', estado: 'true' }), pacientes: this.service.listar() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: ({ usuarios, pacientes }) => {
          const completos = new Set(pacientes.filter(p => p.numeroHistoria?.trim()).map(p => p.idUsuario));
          this.usuarios.set(usuarios.filter(u => !completos.has(u.idUsuario)));
          this.cargando.set(false);
        }, error: err => this.errorCarga(err),
      });
    }
  }
  private errorCarga(err: unknown): void { this.error.set(extraerMensajeError(err)); this.cargando.set(false); this.falloCarga.set(true); }
  guardar(): void {
    if (this.form.invalid || this.guardando() || this.cargando() || this.falloCarga()) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const request = { numeroHistoria: v.numeroHistoria.trim(), sis: v.sis.trim(), fechaNacimiento: v.fechaNacimiento, genero: v.genero, direccion: v.direccion.trim() };
    this.guardando.set(true); this.error.set('');
    const operacion = this.id === null
      ? this.service.crear({ ...request, idUsuario: v.idUsuario })
      : this.service.actualizar(this.id, { ...request, numeroHistoriaVerificado: v.numeroHistoriaVerificado, sisVerificado: !!request.sis && v.sisVerificado });
    operacion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.router.navigate(['/admin/pacientes']); },
      error: err => { this.error.set(extraerMensajeError(err)); this.guardando.set(false); },
    });
  }
}