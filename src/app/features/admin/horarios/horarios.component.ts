import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { Horario } from '../../../core/models/horario.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { DIAS, FiltrosHorarios, HorariosService } from './horarios.service';
@Component({
  selector: 'app-admin-horarios', imports: [FormsModule, RouterLink],
  template: `
    <main class="module-page">
      <div class="module-header"><div><h1><i class="bi bi-clock-history" aria-hidden="true"></i> Gestión de Horarios</h1><p>Administra los bloques semanales de atención médica.</p></div><a routerLink="/admin/horarios/nuevo" class="medical-btn primary"><i class="bi bi-plus-circle" aria-hidden="true"></i> Nuevo bloque</a></div>
      @if (error()) { <div class="notice error" role="alert">{{ error() }}</div> }
      @if (mensaje()) { <div class="notice success" role="status">{{ mensaje() }}</div> }
      <div class="summary-grid"><article><small>Bloques encontrados</small><strong>{{ cargando() ? '…' : horarios().length }}</strong><span>Según los filtros seleccionados</span></article><article><small>Disponibilidad semanal</small><strong><i class="bi bi-calendar-week" aria-hidden="true"></i> Atención médica</strong><span>Los turnos se calculan según la configuración del centro.</span></article></div>
      <form class="filter-bar" (ngSubmit)="filtrar()"><div class="search-field"><i class="bi bi-search" aria-hidden="true"></i><input name="q" type="search" aria-label="Buscar médico, CMP o especialidad" placeholder="Buscar médico, CMP o especialidad" [(ngModel)]="filtros.q" /></div><select name="diaSemana" aria-label="Día de atención" [(ngModel)]="filtros.diaSemana"><option value="">Todos los días</option>@for (d of dias; track d.valor) { <option [value]="d.valor">{{ d.nombre }}</option> }</select><select name="estado" aria-label="Estado" [(ngModel)]="filtros.estado"><option value="">Todos los estados</option><option value="true">Activo</option><option value="false">Inactivo</option></select><div class="filter-actions"><button class="medical-btn primary" type="submit">Filtrar</button><button class="medical-btn secondary" type="button" (click)="limpiar()">Limpiar</button></div></form>
      <section class="list-card" aria-label="Bloques semanales" [attr.aria-busy]="cargando()"><header class="list-heading"><h2><i class="bi bi-list-ul" aria-hidden="true"></i> Listado de bloques semanales</h2></header><div class="table-scroll"><table><thead><tr><th scope="col">ID</th><th scope="col">Médico</th><th scope="col">Día</th><th scope="col">Inicio</th><th scope="col">Fin</th><th scope="col">Turnos posibles</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead><tbody>
        @if (cargando()) { <tr><td colspan="8" class="empty" role="status">Cargando horarios…</td></tr> } @else {
          @for (h of horarios(); track h.idHorario) { <tr><td>#{{ h.idHorario }}</td><td><strong>{{ h.nombreMedico }}</strong><small class="detail">{{ h.especialidadNombre }}</small></td><td>{{ dia(h.diaSemana) }}</td><td><span class="credential">{{ h.horaInicio }}</span></td><td><span class="credential">{{ h.horaFin }}</span></td><td><span class="specialty">{{ h.turnosPosibles > 0 ? h.turnosPosibles : 'Sin turnos' }}</span></td><td><span class="state" [class.inactive]="!h.estado">• {{ h.estado ? 'Activo' : 'Inactivo' }}</span></td><td><button type="button" class="state-btn" (click)="cambiarEstado(h)" [disabled]="cambiando() !== null"><i class="bi bi-arrow-repeat" aria-hidden="true"></i>{{ cambiando() === h.idHorario ? 'Procesando…' : (h.estado ? 'Desactivar' : 'Activar') }}</button></td></tr> } @empty { <tr><td colspan="8" class="empty">{{ error() ? 'No se pudieron cargar los horarios. Intenta filtrar nuevamente.' : 'No hay horarios que coincidan con los filtros.' }}</td></tr> }
        }
      </tbody></table></div></section>
    </main><footer class="medical-footer">© 2026 Centro Médico Buenos Aires de Villa</footer>
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
   .module-page { flex: 1; padding: 26px; min-width: 0; } .module-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; } h1 { font-size: 24px; color: #123b70; font-weight: 700; margin: 0 0 8px; } .module-header p { color: #64748b; font-size: 13px; margin: 0; } .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 20px; margin-bottom: 24px; } .summary-grid article { padding: 22px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; } .summary-grid small, .summary-grid span, .detail { display: block; color: #64748b; font-size: 12px; } .summary-grid strong { display: block; color: #123b70; font-size: 24px; margin: 10px 0; } .detail { margin-top: 5px; } select[name=diaSemana] { flex: 0 1 180px; } .state.inactive { color: #991b1b; background: #fee2e2; } @media(max-width:767px) { .module-page { padding: 16px; } .summary-grid { grid-template-columns: 1fr; } select[name=diaSemana] { flex: 1 1 100%; } }`],
})
export class AdminHorariosComponent implements OnInit {
  private readonly service = inject(HorariosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultas = new Subject<FiltrosHorarios>();
  readonly dias = DIAS;
  horarios = signal<Horario[]>([]); cargando = signal(true); error = signal(''); mensaje = signal(''); cambiando = signal<number | null>(null);
  filtros: FiltrosHorarios = { q: '', diaSemana: '', estado: '' };
  ngOnInit(): void {
    this.consultas.pipe(tap(() => { this.cargando.set(true); this.error.set(''); }), switchMap(f => this.service.listar(f).pipe(catchError(err => { this.error.set(extraerMensajeError(err)); return of([] as Horario[]); }))), takeUntilDestroyed(this.destroyRef)).subscribe(datos => { this.horarios.set(datos); this.cargando.set(false); });
    this.filtrar();
  }
  filtrar(): void { this.consultas.next({ ...this.filtros }); }
  limpiar(): void { this.filtros = { q: '', diaSemana: '', estado: '' }; this.filtrar(); }
  dia(valor: string): string { return DIAS.find(d => d.valor === valor)?.nombre ?? valor; }
  cambiarEstado(h: Horario): void {
    if (this.cambiando() !== null || !window.confirm('¿Deseas cambiar el estado de este horario?')) return;
    this.cambiando.set(h.idHorario); this.error.set(''); this.mensaje.set('');
    this.service.cambiarEstado(h.idHorario).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => { this.cambiando.set(null); this.mensaje.set('Estado del horario actualizado correctamente.'); this.filtrar(); }, error: err => { this.error.set(extraerMensajeError(err)); this.cambiando.set(null); } });
  }
}