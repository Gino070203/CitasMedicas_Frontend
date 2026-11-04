import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PerfilPacienteForm, PerfilPacienteVista } from '../../../core/models/paciente.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { PacienteService } from '../services/paciente.service';

@Component({
  selector: 'app-paciente-perfil',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="patient-main">
      <header class="mb-4">
        <p class="patient-hero-eyebrow mb-2">Tu cuenta</p>
        <h1 class="patient-page-title">Mi perfil</h1>
        <p class="patient-page-intro">Mantén actualizados tus datos personales y de contacto.</p>
      </header>

      @if (exito) {
        <div class="patient-alert patient-alert-success mb-3" role="status">{{ exito }}</div>
      }
      @if (error) {
        <div class="patient-alert patient-alert-danger mb-3" role="alert">{{ error }}</div>
      }

      <section class="patient-panel mb-4" aria-labelledby="datosCuentaTitulo">
        <h2 class="patient-panel-heading" id="datosCuentaTitulo">Datos de la cuenta</h2>
        <dl class="patient-profile-readonly mb-0">
          <dt>Correo de acceso</dt>
          <dd>{{ vista?.correo ?? 'No registrado' }}</dd>
        </dl>
        <p class="form-text mt-2 mb-0">
          El correo se utiliza para iniciar sesión. Para cambiarlo, primero se debe verificar la nueva dirección.
        </p>
      </section>

      @if (cargando) {
        <p class="patient-page-intro">Cargando…</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <section class="patient-panel mb-4" aria-labelledby="datosPersonalesTitulo">
            <h2 class="patient-panel-heading" id="datosPersonalesTitulo">Datos personales</h2>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilNombre">Nombre</label>
                <input
                  id="perfilNombre"
                  type="text"
                  autocomplete="given-name"
                  class="form-control patient-form-control"
                  formControlName="nombre"
                  maxlength="60"
                  required
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilApellido">Apellido</label>
                <input
                  id="perfilApellido"
                  type="text"
                  autocomplete="family-name"
                  class="form-control patient-form-control"
                  formControlName="apellido"
                  maxlength="60"
                  required
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilDni">DNI</label>
                <input
                  id="perfilDni"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  class="form-control patient-form-control"
                  formControlName="dni"
                  maxlength="8"
                  required
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilTelefono">Teléfono</label>
                <input
                  id="perfilTelefono"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  class="form-control patient-form-control"
                  formControlName="telefono"
                  maxlength="20"
                  placeholder="Ej. +51 987 654 321"
                />
              </div>

              <div class="col-12">
                <label class="patient-form-label" for="perfilDireccion">Dirección</label>
                <input
                  id="perfilDireccion"
                  type="text"
                  autocomplete="street-address"
                  class="form-control patient-form-control"
                  formControlName="direccion"
                  maxlength="100"
                />
              </div>
            </div>
          </section>

          <section class="patient-panel mb-4" aria-labelledby="datosPacienteTitulo">
            <h2 class="patient-panel-heading" id="datosPacienteTitulo">Datos de paciente</h2>
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilNacimiento">Fecha de nacimiento</label>
                <input
                  id="perfilNacimiento"
                  type="date"
                  class="form-control patient-form-control"
                  formControlName="fechaNacimiento"
                  [max]="fechaMaximaNacimiento"
                  required
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilGenero">Género</label>
                <select
                  id="perfilGenero"
                  class="form-select patient-form-select"
                  formControlName="genero"
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
            </div>
          </section>

          <section class="patient-panel mb-4" aria-labelledby="datosMedicosTitulo">
            <h2 class="patient-panel-heading" id="datosMedicosTitulo">Identificación médica</h2>
            <p class="patient-page-intro mb-3">
              Puedes ingresar o corregir estos datos. Los cambios quedan pendientes de revisión por el centro médico.
              Un SIS pendiente de validación no activa cobertura automáticamente.
            </p>
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilHistoria">Número de historia clínica</label>
                <input
                  id="perfilHistoria"
                  type="text"
                  autocomplete="off"
                  class="form-control patient-form-control"
                  formControlName="numeroHistoria"
                  maxlength="20"
                  placeholder="Ej. HC-2026-001"
                />
                @if (!tieneHistoria) {
                  <span class="form-text">Aún no registrado.</span>
                } @else if (historiaVerificada) {
                  <span class="patient-badge status-confirmada mt-2">Verificado por el centro</span>
                } @else {
                  <span class="patient-badge status-pendiente mt-2">Pendiente de revisión</span>
                }
              </div>

              <div class="col-12 col-md-6">
                <label class="patient-form-label" for="perfilSis">Número SIS</label>
                <input
                  id="perfilSis"
                  type="text"
                  autocomplete="off"
                  class="form-control patient-form-control"
                  formControlName="sis"
                  maxlength="20"
                  placeholder="Ingresa tu número SIS si cuentas con él"
                />
                @if (!tieneSis) {
                  <span class="form-text">Opcional. Déjalo vacío si no cuentas con SIS.</span>
                } @else if (sisVerificado) {
                  <span class="patient-badge status-confirmada mt-2">Verificado por el centro</span>
                } @else {
                  <span class="patient-badge status-pendiente mt-2">Pendiente de revisión</span>
                }
              </div>
            </div>
          </section>

          <div class="d-flex flex-wrap gap-2 justify-content-end">
            <a class="btn patient-btn-outline" routerLink="/paciente/dashboard">Cancelar</a>
            <button class="btn patient-btn-primary" type="submit" [disabled]="form.invalid || guardando">
              <i class="bi bi-check2-circle me-2" aria-hidden="true"></i>
              {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      }
    </main>

    <footer class="patient-footer">Centro Médico · Portal del paciente</footer>
  `,
})
export class PacientePerfilComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PacienteService);
  private readonly cdr = inject(ChangeDetectorRef);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    telefono: [''],
    direccion: [''],
    fechaNacimiento: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    numeroHistoria: [''],
    sis: [''],
  });

  vista: PerfilPacienteVista | null = null;
  fechaMaximaNacimiento = new Date().toISOString().slice(0, 10);
  cargando = true;
  guardando = false;
  error: string | null = null;
  exito: string | null = null;

  get tieneHistoria(): boolean {
    return !!this.vista?.numeroHistoria;
  }

  get historiaVerificada(): boolean {
    return this.vista?.numeroHistoriaVerificado ?? false;
  }

  get tieneSis(): boolean {
    return !!this.vista?.sis;
  }

  get sisVerificado(): boolean {
    return this.vista?.sisVerificado ?? false;
  }

  ngOnInit(): void {
    this.service.getPerfil().subscribe({
      next: (vista) => {
        this.vista = vista;
        this.cargarFormulario(vista.formulario);
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

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.guardando = true;
    this.error = null;
    this.exito = null;

    const value = this.form.getRawValue();
    const request: PerfilPacienteForm = {
      nombre: value.nombre.trim(),
      apellido: value.apellido.trim(),
      dni: value.dni,
      telefono: value.telefono.trim() || undefined,
      direccion: value.direccion.trim() || undefined,
      fechaNacimiento: value.fechaNacimiento,
      genero: value.genero,
      numeroHistoria: value.numeroHistoria.trim() || undefined,
      sis: value.sis.trim() || undefined,
    };

    this.service.actualizarPerfil(request).subscribe({
      next: (vista) => {
        this.vista = vista;
        this.exito = 'Tus datos se actualizaron correctamente.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private cargarFormulario(f: PerfilPacienteForm): void {
    this.form.setValue({
      nombre: f.nombre ?? '',
      apellido: f.apellido ?? '',
      dni: f.dni ?? '',
      telefono: f.telefono ?? '',
      direccion: f.direccion ?? '',
      fechaNacimiento: f.fechaNacimiento ?? '',
      genero: f.genero ?? '',
      numeroHistoria: f.numeroHistoria ?? '',
      sis: f.sis ?? '',
    });
  }
}
