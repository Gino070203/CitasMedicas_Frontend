import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { extraerMensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-verificar',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-screen">
      <div class="auth-card">
        <h2>Verifica tu Correo</h2>
        <p>
          Hemos enviado un código de 6 dígitos a<br />
          <strong>{{ form.controls.correo.value || 'tu correo' }}</strong>
        </p>

        @if (error) {
          <div class="auth-error">{{ error }}</div>
        }

        @if (exito) {
          <div class="auth-success">{{ exito }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="auth-field">
            <label>Ingresa el código:</label>
            <input
              type="text"
              formControlName="codigo"
              maxlength="6"
              placeholder="123456"
              autocomplete="off"
              class="auth-code-input"
              required
            />
          </div>

          <button type="submit" class="btn-verify" [disabled]="form.invalid || cargando">
            {{ cargando ? 'Verificando…' : 'Verificar Cuenta' }}
          </button>
        </form>

        <div class="auth-links">
          <a routerLink="/auth/login">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  `,
})
export class VerificarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    codigo: ['', [Validators.required]],
  });

  error: string | null = null;
  exito: string | null = null;
  cargando = false;

  constructor() {
    const correo = this.route.snapshot.queryParamMap.get('correo');
    if (correo) {
      this.form.controls.correo.setValue(correo);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.cargando = true;
    this.error = null;
    this.exito = null;

    this.auth.verificar(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.exito = res.mensaje + ' Ya puedes iniciar sesión.';
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
