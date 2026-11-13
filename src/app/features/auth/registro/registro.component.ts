import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { RegistroRequest } from '../../../core/models/auth.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { NOMBRE_PATTERN, TELEFONO_PATTERN } from '../../../core/utils/validators';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-screen">
      <div class="auth-card wide">
        <h2>Registro de Paciente</h2>

        @if (error) {
          <div class="auth-error">{{ error }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="auth-field">
            <label>DNI:</label>
            <input type="text" formControlName="dni" maxlength="8" inputmode="numeric" required />
            @if ((form.controls.dni.touched || form.controls.dni.dirty) && form.controls.dni.errors?.['required']) {
              <small class="text-danger d-block">El DNI es obligatorio.</small>
            }
            @if ((form.controls.dni.touched || form.controls.dni.dirty) && form.controls.dni.errors?.['pattern']) {
              <small class="text-danger d-block">El DNI debe tener 8 dígitos.</small>
            }
          </div>

          <div class="auth-row">
            <div class="auth-field">
              <label>Nombre:</label>
              <input type="text" formControlName="nombre" required />
              @if ((form.controls.nombre.touched || form.controls.nombre.dirty) && form.controls.nombre.errors?.['pattern']) {
                <small class="text-danger">Solo se permiten letras.</small>
              }
            </div>
            <div class="auth-field">
              <label>Apellido:</label>
              <input type="text" formControlName="apellido" required />
              @if ((form.controls.apellido.touched || form.controls.apellido.dirty) && form.controls.apellido.errors?.['pattern']) {
                <small class="text-danger">Solo se permiten letras.</small>
              }
            </div>
          </div>

          <div class="auth-field">
            <label>Correo Electrónico:</label>
            <input type="email" formControlName="correo" required />
            @if ((form.controls.correo.touched || form.controls.correo.dirty) && form.controls.correo.errors?.['required']) {
              <small class="text-danger d-block">El correo es obligatorio.</small>
            }
            @if ((form.controls.correo.touched || form.controls.correo.dirty) && form.controls.correo.errors?.['email']) {
              <small class="text-danger d-block">Ingresa un correo válido (con &#64;).</small>
            }
          </div>

          <div class="auth-field">
            <label>Teléfono:</label>
            <input type="text" formControlName="telefono" maxlength="9" inputmode="numeric" />
            @if ((form.controls.telefono.touched || form.controls.telefono.dirty) && form.controls.telefono.errors?.['pattern']) {
              <small class="text-danger d-block">El teléfono debe tener 9 dígitos.</small>
            }
          </div>

          <div class="auth-field">
            <label>Dirección:</label>
            <input type="text" formControlName="direccion" />
          </div>

          <div class="auth-field">
            <label>Contraseña:</label>
            <input type="password" formControlName="password" required />
            @if ((form.controls.password.touched || form.controls.password.dirty) && form.controls.password.errors?.['required']) {
              <small class="text-danger d-block">La contraseña es obligatoria.</small>
            }
            @if ((form.controls.password.touched || form.controls.password.dirty) && form.controls.password.errors?.['minlength']) {
              <small class="text-danger d-block">Mínimo 8 caracteres.</small>
            }
          </div>

          <button type="submit" class="btn-login" [disabled]="form.invalid || cargando">
            {{ cargando ? 'Registrando…' : 'Registrarse y Enviar Código' }}
          </button>
        </form>

        <div class="auth-links">
          ¿Ya tienes una cuenta? <a routerLink="/auth/login">Inicia sesión</a>
        </div>
      </div>
    </div>
  `,
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombre: ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
    apellido: ['', [Validators.required, Validators.pattern(NOMBRE_PATTERN)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(TELEFONO_PATTERN)]],
    direccion: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  error: string | null = null;
  cargando = false;

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.cargando = true;
    this.error = null;

    const value = this.form.getRawValue();
    const request: RegistroRequest = {
      nombre: value.nombre.trim(),
      apellido: value.apellido.trim(),
      dni: value.dni,
      correo: value.correo.trim(),
      password: value.password,
      telefono: value.telefono.trim() || undefined,
      direccion: value.direccion.trim() || undefined,
    };

    this.auth.registro(request).subscribe({
      next: (res) => {
        this.router.navigate(['/auth/verificar'], {
          queryParams: { correo: res.correo },
        });
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
