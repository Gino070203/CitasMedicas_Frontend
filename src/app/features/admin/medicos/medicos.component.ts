import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { Medico } from '../../../core/models/medico.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { FiltrosMedicos, MedicosService } from './medicos.service';

@Component({
  selector: 'app-admin-medicos',
  imports: [FormsModule, RouterLink],
  template: `
<main class="medicos-page">
  <div class="page-actions">
    <a routerLink="/admin/medicos/nuevo" class="medical-btn primary"><i class="bi bi-plus-lg" aria-hidden="true"></i> Nuevo Médico</a>
  </div>
  @if (error()) { <div class="notice error" role="alert">{{ error() }}</div> }
  @if (mensaje()) { <div class="notice success" role="status">{{ mensaje() }}</div> }
  <form class="filter-bar" (ngSubmit)="filtrar()">
    <div class="search-field"><i class="bi bi-search" aria-hidden="true"></i><input type="search" name="q" aria-label="Buscar médico, CMP, correo o DNI" placeholder="Buscar médico, CMP, correo o DNI..." [(ngModel)]="filtros.q" /></div>
    <select name="especialidad" aria-label="Especialidad" [(ngModel)]="filtros.idEspecialidad">
      <option value="">Todas las especialidades</option>
      @for (e of especialidades(); track e.idEspecialidad) { <option [value]="e.idEspecialidad">{{ e.nombre }}</option> }
    </select>
    <select name="estado" aria-label="Estado" [(ngModel)]="filtros.estado">
      <option value="">Todos los estados</option><option value="true">Activo</option><option value="false">Inactivo</option>
    </select>
    <div class="filter-actions"><button type="submit" class="medical-btn primary">Filtrar</button><button type="button" class="medical-btn secondary" (click)="limpiar()">Limpiar</button></div>
  </form>
  <section class="list-card" aria-labelledby="listado-title" [attr.aria-busy]="cargando()">
    <header class="list-heading"><h2 id="listado-title"><i class="bi bi-list-ul" aria-hidden="true"></i> Listado de médicos</h2><span class="count">{{ medicos().length }} registros</span></header>
    <div class="table-scroll">
      <table>
        <thead><tr><th scope="col">ID</th><th scope="col">Médico / Especialista</th><th scope="col">N° Colegiatura (CMP)</th><th scope="col">Especialidad Principal</th><th scope="col">Estado</th><th scope="col" class="actions-column">Acciones</th></tr></thead>
        <tbody>
          @if (cargando()) { <tr><td colspan="6" class="empty" role="status">Cargando médicos…</td></tr> }
          @else {
            @for (m of medicos(); track m.idMedico) {
              <tr>
                <td>{{ m.idMedico }}</td>
                <td><div class="doctor"><span class="doctor-avatar" aria-hidden="true">{{ iniciales(m) }}</span><strong>Dr. {{ m.nombre }} {{ m.apellido }}</strong></div></td>
                <td><span class="credential">CMP - {{ m.cmp }}</span></td>
                <td><span class="specialty">{{ m.especialidadNombre }}</span></td>
                <td><span class="state" [class.inactive]="!m.estado"><span aria-hidden="true">•</span>{{ m.estado ? 'Activo' : 'Inactivo' }}</span></td>
                <td><div class="row-actions"><a class="edit-btn" [routerLink]="['/admin/medicos/editar', m.idMedico]" [attr.aria-label]="'Editar a ' + m.nombre + ' ' + m.apellido" title="Editar médico"><i class="bi bi-pencil" aria-hidden="true"></i></a><button type="button" class="state-btn" (click)="cambiarEstado(m)" [disabled]="cambiando() !== null" [attr.aria-label]="(m.estado ? 'Desactivar a ' : 'Activar a ') + m.nombre + ' ' + m.apellido"><i class="bi bi-arrow-repeat" aria-hidden="true"></i> {{ cambiando() === m.idMedico ? 'Procesando…' : 'Estado' }}</button></div></td>
              </tr>
            } @empty { <tr><td colspan="6" class="empty"><i class="bi bi-person-x" aria-hidden="true"></i>{{ error() ? 'No se pudo cargar el listado. Intenta filtrar nuevamente.' : 'No hay médicos que coincidan con los filtros.' }}</td></tr> }
          }
        </tbody>
      </table>
    </div>
  </section>
</main>
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
  `],
})
export class AdminMedicosComponent implements OnInit {
  private readonly service = inject(MedicosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultas = new Subject<FiltrosMedicos>();
  medicos = signal<Medico[]>([]);
  especialidades = signal<Especialidad[]>([]);
  cargando = signal(true);
  error = signal('');
  mensaje = signal('');
  cambiando = signal<number | null>(null);
  filtros: FiltrosMedicos = { q: '', idEspecialidad: '', estado: '' };
  ngOnInit(): void {
    this.consultas.pipe(
      tap(() => { this.cargando.set(true); this.error.set(''); }),
      switchMap(filtros => this.service.listar(filtros).pipe(catchError(err => {
        this.error.set(extraerMensajeError(err));
        return of([] as Medico[]);
      }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(medicos => { this.medicos.set(medicos); this.cargando.set(false); });
    this.service.especialidades().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: datos => this.especialidades.set(datos),
      error: err => this.error.set(extraerMensajeError(err)),
    });
    this.filtrar();
  }
  filtrar(): void { this.consultas.next({ ...this.filtros }); }
  limpiar(): void { this.filtros = { q: '', idEspecialidad: '', estado: '' }; this.filtrar(); }
  iniciales(m: Medico): string { return ((m.nombre?.trim()[0] ?? '') + (m.apellido?.trim()[0] ?? '')).toUpperCase(); }
  cambiarEstado(m: Medico): void {
    if (this.cambiando() !== null) return;
    this.cambiando.set(m.idMedico);
    this.error.set(''); this.mensaje.set('');
    this.service.cambiarEstado(m.idMedico).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: actualizado => {
        this.cambiando.set(null);
        this.mensaje.set(`Estado de ${actualizado.nombre} ${actualizado.apellido} actualizado correctamente.`);
        this.filtrar();
      },
      error: err => { this.error.set(extraerMensajeError(err)); this.cambiando.set(null); },
    });
  }
}