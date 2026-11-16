import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { extraerMensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-login',
  styleUrl: './login.component.css',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-screen">
      <div class="auth-card">
        <h2>Iniciar Sesión</h2>

        @if (error) {
          <div class="auth-error" role="alert">{{ error }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="auth-field">
            <label for="login-correo">Correo Electrónico:</label>
            <input id="login-correo" autocomplete="username" type="email" formControlName="correo" required />
            @if ((form.controls.correo.touched || form.controls.correo.dirty) && form.controls.correo.errors?.['required']) {
              <small class="text-danger d-block">El correo es obligatorio.</small>
            }
            @if ((form.controls.correo.touched || form.controls.correo.dirty) && form.controls.correo.errors?.['email']) {
              <small class="text-danger d-block">Ingresa un correo válido (con &#64;).</small>
            }
          </div>

          <div class="auth-field">
            <label for="login-password">Contraseña:</label>
            <input id="login-password" autocomplete="current-password" type="password" formControlName="password" required />
            @if ((form.controls.password.touched || form.controls.password.dirty) && form.controls.password.errors?.['required']) {
              <small class="text-danger d-block">La contraseña es obligatoria.</small>
            }
          </div>

          <button type="submit" class="btn-login" [disabled]="form.invalid || cargando">
            {{ cargando ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>

        <button type="button" class="google-btn" (click)="google()">
          Iniciar sesión con Google
        </button>

        <div class="auth-links">
          ¿No tienes una cuenta? <a routerLink="/auth/registro">Regístrate aquí</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  error: string | null = null;
  cargando = false;

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.cargando = true;
    this.error = null;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        const destino =
          res.rol === 'ADMIN'
            ? '/admin/dashboard'
            : res.rol === 'MEDICO'
              ? '/medico/dashboard'
              : '/paciente/dashboard';
        this.router.navigate([destino]);
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  google(): void {
    this.auth.redirectToGoogle();
  }
}
