import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { RegistroRequest } from '../../../core/models/auth.model';
import { extraerMensajeError } from '../../../core/utils/http-error';

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
            <input type="text" formControlName="dni" maxlength="8" required />
          </div>

          <div class="auth-row">
            <div class="auth-field">
              <label>Nombre:</label>
              <input type="text" formControlName="nombre" required />
            </div>
            <div class="auth-field">
              <label>Apellido:</label>
              <input type="text" formControlName="apellido" required />
            </div>
          </div>

          <div class="auth-field">
            <label>Correo Electrónico:</label>
            <input type="email" formControlName="correo" required />
          </div>

          <div class="auth-field">
            <label>Teléfono:</label>
            <input type="text" formControlName="telefono" />
          </div>

          <div class="auth-field">
            <label>Dirección:</label>
            <input type="text" formControlName="direccion" />
          </div>

          <div class="auth-field">
            <label>Contraseña:</label>
            <input type="password" formControlName="password" required />
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
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
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
