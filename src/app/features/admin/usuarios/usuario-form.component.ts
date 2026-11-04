import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UsuarioRequest } from '../../../core/models/usuario.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-usuario-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="container-fluid px-4 py-5">
      <div class="row justify-content-center">
        <div class="col-lg-9">
          <div class="card admin-form-card shadow-sm">
            <div class="admin-form-header">
              <h3 class="mb-2">
                <i class="bi bi-person-gear me-2"></i>
                {{ id === null ? 'Registrar nuevo usuario' : 'Editar usuario' }}
              </h3>
              <p class="mb-0">Completa los datos personales y asigna un rol dentro del sistema.</p>
            </div>

            <div class="card-body p-4 p-md-5">
              @if (error) {
                <div class="alert alert-danger" role="alert">{{ error }}</div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <h5 class="fw-bold text-primary mb-3">
                  <i class="bi bi-person-vcard me-2"></i> Información personal
                </h5>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" placeholder="Ingrese el nombre" formControlName="nombre" maxlength="100" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Apellido</label>
                    <input type="text" class="form-control" placeholder="Ingrese el apellido" formControlName="apellido" maxlength="100" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">DNI</label>
                    <input type="text" class="form-control" placeholder="8 dígitos" formControlName="dni" inputmode="numeric" minlength="8" maxlength="8" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Teléfono</label>
                    <input type="tel" class="form-control" placeholder="Número telefónico" formControlName="telefono" maxlength="20" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Dirección</label>
                    <input type="text" class="form-control" placeholder="Ingrese la dirección" formControlName="direccion" maxlength="200" />
                  </div>
                </div>

                <hr class="my-4" />

                <h5 class="fw-bold text-primary mb-3">
                  <i class="bi bi-shield-lock me-2"></i> Datos de acceso
                </h5>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Correo electrónico</label>
                    <input type="email" class="form-control" placeholder="ejemplo@correo.com" formControlName="correo" maxlength="100" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Rol del usuario</label>
                    <select class="form-select" formControlName="rol">
                      <option value="" disabled>Selecciona un rol</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="MEDICO">Médico</option>
                      <option value="PACIENTE">Paciente</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Contraseña</label>
                    <div class="input-group">
                      <input
                        [type]="mostrarPassword ? 'text' : 'password'"
                        class="form-control"
                        placeholder="Ingrese la contraseña"
                        formControlName="password"
                        minlength="8"
                        autocomplete="new-password"
                      />
                      <button class="btn btn-outline-secondary" type="button" (click)="mostrarPassword = !mostrarPassword" aria-label="Mostrar u ocultar contraseña">
                        <i class="bi" [class.bi-eye]="!mostrarPassword" [class.bi-eye-slash]="mostrarPassword"></i>
                      </button>
                    </div>
                    <small class="text-muted">
                      {{ id === null ? 'Mínimo 8 caracteres.' : 'Deja este campo vacío si no deseas modificar la contraseña actual.' }}
                    </small>
                  </div>
                </div>

                <div class="d-flex flex-wrap gap-2 mt-4">
                  <button type="submit" class="btn btn-success px-4" [disabled]="form.invalid || guardando">
                    <i class="bi bi-floppy me-1"></i>
                    {{ guardando ? 'Guardando…' : (id === null ? 'Registrar usuario' : 'Guardar cambios') }}
                  </button>
                  <a routerLink="/admin/usuarios" class="btn btn-outline-secondary px-4">
                    <i class="bi bi-x-circle me-1"></i> Cancelar
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class AdminUsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  id: number | null = null;
  guardando = false;
  error: string | null = null;
  mostrarPassword = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    telefono: [''],
    direccion: [''],
    correo: ['', [Validators.required, Validators.email]],
    rol: ['', [Validators.required]],
    password: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.service.getUsuario(this.id).subscribe({
        next: (u) => {
          this.form.patchValue({
            nombre: u.nombre,
            apellido: u.apellido,
            dni: u.dni,
            telefono: u.telefono ?? '',
            direccion: u.direccion ?? '',
            correo: u.correo,
            rol: u.rolNombre,
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = extraerMensajeError(err);
          this.cdr.detectChanges();
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();

    if (this.id === null && !value.password.trim()) {
      this.error = 'La contraseña es obligatoria.';
      this.cdr.detectChanges();
      return;
    }

    const request: UsuarioRequest = {
      nombre: value.nombre.trim(),
      apellido: value.apellido.trim(),
      dni: value.dni,
      correo: value.correo.trim(),
      telefono: value.telefono.trim() || undefined,
      direccion: value.direccion.trim() || undefined,
      rol: value.rol,
      password: value.password || undefined,
    };

    this.guardando = true;
    this.error = null;

    const operacion =
      this.id === null
        ? this.service.crearUsuario(request)
        : this.service.actualizarUsuario(this.id, request);

    operacion.subscribe({
      next: () => this.router.navigate(['/admin/usuarios']),
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
