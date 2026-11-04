import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { extraerMensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-screen">
      <div class="auth-card">
        <h2>Iniciar Sesión</h2>

        @if (error) {
          <div class="auth-error">{{ error }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="auth-field">
            <label>Correo Electrónico:</label>
            <input type="email" formControlName="correo" required />
          </div>

          <div class="auth-field">
            <label>Contraseña:</label>
            <input type="password" formControlName="password" required />
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
