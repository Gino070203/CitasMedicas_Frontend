import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Usuario } from '../../../core/models/usuario.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService, FiltrosUsuarios } from '../services/admin.service';

@Component({
  selector: 'app-admin-usuarios',
  imports: [RouterLink, FormsModule],
  template: `
    <main class="container-fluid px-4 py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 class="titulo mb-1"><i class="bi bi-people-fill me-2"></i> Gestión de Usuarios</h2>
          <p class="text-muted mb-0">Administra las cuentas y los roles del sistema.</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/admin/dashboard" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left"></i> Volver
          </a>
          <a routerLink="/admin/usuarios/nuevo" class="btn btn-primary">
            <i class="bi bi-person-plus-fill"></i> Nuevo usuario
          </a>
        </div>
      </div>

      @if (error) {
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
        </div>
      }

      <div class="row g-2 align-items-center mb-3">
        <div class="col-12 col-md">
          <input
            type="search"
            name="q"
            class="form-control"
            placeholder="Buscar nombre, apellido, DNI o correo"
            [(ngModel)]="filtros.q"
            (keyup.enter)="filtrar()"
          />
        </div>
        <div class="col-12 col-md-3">
          <select name="rol" class="form-select" [(ngModel)]="filtros.rol" (change)="filtrar()">
            <option value="">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="MEDICO">Médico</option>
            <option value="PACIENTE">Paciente</option>
          </select>
        </div>
        <div class="col-12 col-md-2">
          <select name="estado" class="form-select" [(ngModel)]="filtros.estado" (change)="filtrar()">
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-primary" (click)="filtrar()">Filtrar</button>
          <button type="button" class="btn btn-outline-secondary" (click)="limpiar()">Limpiar</button>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0"><i class="bi bi-list-ul me-2"></i> Usuarios registrados</h5>
            <span class="badge text-bg-primary">{{ usuarios.length }}</span>
          </div>

          @if (cargando) {
            <p class="text-muted">Cargando usuarios…</p>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover table-bordered align-middle admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre completo</th>
                    <th>DNI</th>
                    <th>Correo electrónico</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of usuarios; track u.idUsuario) {
                    <tr>
                      <td>{{ u.idUsuario }}</td>
                      <td>{{ u.nombre }} {{ u.apellido }}</td>
                      <td>{{ u.dni }}</td>
                      <td>{{ u.correo }}</td>
                      <td>{{ u.telefono ?? '-' }}</td>
                      <td>
                        <span class="badge admin-badge-rol">{{ u.rolNombre }}</span>
                      </td>
                      <td>
                        <span
                          class="badge"
                          [class.admin-badge-activo]="u.estado"
                          [class.admin-badge-inactivo]="!u.estado"
                        >
                          {{ u.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex flex-wrap gap-2">
                          <a class="btn btn-warning btn-sm" [routerLink]="['/admin/usuarios/editar', u.idUsuario]">
                            <i class="bi bi-pencil-square"></i> Editar
                          </a>
                          <button
                            type="button"
                            class="btn btn-sm"
                            [class.btn-danger]="u.estado"
                            [class.btn-success]="!u.estado"
                            (click)="abrirModalEstado(u)"
                          >
                            <i class="bi bi-arrow-repeat"></i>
                            {{ u.estado ? 'Desactivar' : 'Activar' }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i> No hay usuarios registrados.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </main>

    <footer class="admin-footer">
      <small>© 2026 Centro Médico Buenos Aires de Villa</small>
    </footer>

    @if (usuarioSeleccionado) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                Confirmar cambio de estado
              </h5>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="cerrarModalEstado()"></button>
            </div>
            <div class="modal-body">
              ¿Deseas
              <strong>{{ usuarioSeleccionado.estado ? 'desactivar' : 'activar' }}</strong>
              a
              <strong>{{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}</strong>?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalEstado()" [disabled]="cambiandoEstado">
                Cancelar
              </button>
              <button
                type="button"
                class="btn"
                [class.btn-danger]="usuarioSeleccionado.estado"
                [class.btn-success]="!usuarioSeleccionado.estado"
                (click)="confirmarCambioEstado()"
                [disabled]="cambiandoEstado"
              >
                <i class="bi bi-arrow-repeat me-1"></i>
                {{ cambiandoEstado ? 'Procesando…' : (usuarioSeleccionado.estado ? 'Desactivar' : 'Activar') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminUsuariosComponent implements OnInit {
  private readonly service = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  cargando = true;
  error: string | null = null;

  filtros: FiltrosUsuarios = { q: '', rol: '', estado: '' };

  usuarioSeleccionado: Usuario | null = null;
  cambiandoEstado = false;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;
    this.service.getUsuarios(this.filtros).subscribe({
      next: (usuarios) => {
        this.usuarios = [...usuarios].sort((a, b) => a.idUsuario - b.idUsuario);
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

  filtrar(): void {
    this.cargarUsuarios();
  }

  limpiar(): void {
    this.filtros = { q: '', rol: '', estado: '' };
    this.cargarUsuarios();
  }

  abrirModalEstado(u: Usuario): void {
    this.usuarioSeleccionado = u;
  }

  cerrarModalEstado(): void {
    if (!this.cambiandoEstado) {
      this.usuarioSeleccionado = null;
    }
  }

  confirmarCambioEstado(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }
    const usuario = this.usuarioSeleccionado;
    this.cambiandoEstado = true;
    this.error = null;

    this.service.cambiarEstadoUsuario(usuario.idUsuario).subscribe({
      next: () => {
        this.cambiandoEstado = false;
        this.usuarioSeleccionado = null;
        this.cargarUsuarios();
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cambiandoEstado = false;
        this.usuarioSeleccionado = null;
        this.cdr.detectChanges();
      },
    });
  }
}
