import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MedicoDashboard } from '../../../core/models/medico.model';
import { Cita } from '../../../core/models/cita.model';
import { MedicoPanelService } from '../medico-panel.service';
import { extraerMensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-medico-dashboard',
  imports: [RouterLink],
  template: `
    <main class="doctor-page">
      <section class="welcome">
        <div><span class="eyebrow"><i class="bi bi-heart-pulse" aria-hidden="true"></i> PANEL MÉDICO</span>
          <h1>Buen día, Dr(a). {{ datos()?.nombre || 'Médico' }} {{ datos()?.apellido }}</h1>
          <p>{{ datos()?.especialidad || 'Especialidad médica' }} <span class="dot">·</span> Agenda y seguimiento de pacientes</p>
        </div><div class="today"><i class="bi bi-calendar3" aria-hidden="true"></i>{{ fechaHoy }}</div>
      </section>
      @if (error()) { <div class="notice error" role="alert"><i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ error() }} <button type="button" (click)="cargar()">Reintentar</button></div> }
      @if (cargando()) { <div class="loading" role="status"><span class="spinner"></span> Cargando tu agenda…</div> }
      @if (!cargando() && datos(); as d) {
        <section class="stats" aria-label="Resumen de citas">
          <article class="stat-card"><div class="stat-icon blue"><i class="bi bi-calendar-event" aria-hidden="true"></i></div><span class="stat-label">Citas de hoy</span><strong>{{ d.agendaDeHoy.length }}</strong><small>Pacientes agendados para hoy</small></article>
          <article class="stat-card"><div class="stat-icon amber"><i class="bi bi-clock-history" aria-hidden="true"></i></div><span class="stat-label">Por atender</span><strong>{{ d.porAtender.length }}</strong><small>Citas pendientes desde hoy</small></article>
          <article class="stat-card"><div class="stat-icon green"><i class="bi bi-check2-circle" aria-hidden="true"></i></div><span class="stat-label">Atendidas</span><strong>{{ d.historial.length }}</strong><small>En tu historial clínico</small></article>
        </section>
        <section class="section"><div class="section-title"><div><span class="section-kicker">HOY</span><h2><i class="bi bi-calendar-check" aria-hidden="true"></i> Agenda de hoy</h2></div><span class="pill">{{ d.agendaDeHoy.length }} citas</span></div>
          <div class="table-card"><div class="table-scroll"><table><thead><tr><th>Hora</th><th>Paciente</th><th>Especialidad</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            @for (c of d.agendaDeHoy; track c.idCita) { <tr><td class="time">{{ c.horaInicio }} <span>–</span> {{ c.horaFin }}</td><td><div class="patient"><span class="avatar">{{ iniciales(c.nombrePaciente) }}</span><strong>{{ c.nombrePaciente }}</strong></div></td><td>{{ c.especialidadNombre || d.especialidad }}</td><td><span class="status" [class]="'status ' + claseEstado(c.estado)">{{ c.estado }}</span></td><td><a class="action" [routerLink]="['/medico/diagnostico',c.idCita]">Atender <i class="bi bi-arrow-right" aria-hidden="true"></i></a></td></tr> }
            @empty { <tr><td colspan="5" class="empty"><i class="bi bi-calendar2-check" aria-hidden="true"></i><strong>Tu agenda está libre por hoy</strong><span>No tienes citas programadas para esta fecha.</span></td></tr> }
          </tbody></table></div></div>
        </section>
        <section class="section"><div class="section-title"><div><span class="section-kicker">PRÓXIMAS CITAS</span><h2><i class="bi bi-people" aria-hidden="true"></i> Pacientes por atender</h2></div><span class="pill">{{ d.porAtender.length }} pendientes</span></div>
          <div class="table-card"><div class="table-scroll"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
            @for (c of d.porAtender; track c.idCita) { <tr><td>{{ formatearFecha(c.fecha) }}</td><td class="time">{{ c.horaInicio }}</td><td><div class="patient"><span class="avatar">{{ iniciales(c.nombrePaciente) }}</span><strong>{{ c.nombrePaciente }}</strong></div></td><td><span class="status" [class]="'status ' + claseEstado(c.estado)">{{ c.estado || 'PENDIENTE' }}</span></td><td><a class="action" [routerLink]="['/medico/diagnostico',c.idCita]">Atender <i class="bi bi-arrow-right" aria-hidden="true"></i></a></td></tr> }
            @empty { <tr><td colspan="5" class="empty"><i class="bi bi-check2-all" aria-hidden="true"></i><strong>No tienes pacientes pendientes</strong><span>Cuando tengas próximas citas, aparecerán aquí.</span></td></tr> }
          </tbody></table></div></div>
        </section>
      }
    </main>
  `,
  styles: [`
    :host { display:block; flex:1; } * { box-sizing:border-box; } .doctor-page { width:min(1200px,100%); margin:0 auto; padding:34px 24px 46px; }
    .welcome { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; margin-bottom:24px; } .eyebrow,.section-kicker { color:#1767b2; font-size:10px; font-weight:700; letter-spacing:1.2px; } h1 { margin:8px 0 5px; color:#0f172a; font-size:clamp(22px,3vw,29px); } .welcome p { margin:0; color:#64748b; font-size:14px; } .dot { padding:0 5px; color:#94a3b8; }
    .today { display:flex; align-items:center; gap:9px; padding:11px 14px; border:1px solid #dce5f2; border-radius:9px; color:#475569; background:#fff; font-size:12px; text-transform:capitalize; white-space:nowrap; }
    .stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-bottom:34px; } .stat-card { position:relative; display:flex; flex-direction:column; min-height:145px; padding:20px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 3px 12px #0f172a08; } .stat-icon { position:absolute; right:18px; top:18px; width:38px; height:38px; display:grid; place-items:center; border-radius:10px; font-size:17px; } .blue {color:#1767b2;background:#eaf3fc}.amber {color:#b7791f;background:#fff5dc}.green {color:#16804a;background:#e5f7ec} .stat-label {color:#64748b;font-size:12px;font-weight:600}.stat-card strong { margin:9px 0 3px; color:#0f172a; font-size:30px; line-height:1; } .stat-card small {color:#94a3b8;font-size:11px;}
    .section { margin-bottom:32px; } .section-title { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin-bottom:13px; } .section-title h2 { display:flex; align-items:center; gap:9px; margin:5px 0 0; color:#172333; font-size:17px; } .section-title h2 i {color:#1767b2} .pill {padding:6px 10px;border:1px solid #dbeafe;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:600;white-space:nowrap}
    .table-card { overflow:hidden; border:1px solid #e2e8f0; border-radius:12px; background:white; box-shadow:0 3px 12px #0f172a08; } .table-scroll {overflow-x:auto} table {width:100%;border-collapse:collapse;text-align:left;min-width:720px} th {padding:13px 17px;color:#64748b;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:10px;letter-spacing:.6px;text-transform:uppercase;white-space:nowrap} td {padding:14px 17px;color:#475569;border-bottom:1px solid #f1f5f9;font-size:12px;vertical-align:middle} tbody tr:last-child td {border-bottom:0} tbody tr:hover {background:#f8fbff}.time {font-weight:700;color:#1e293b;white-space:nowrap}.time span {color:#94a3b8}.patient {display:flex;align-items:center;gap:10px;white-space:nowrap}.patient strong {color:#1e293b;font-weight:600}.avatar {width:32px;height:32px;display:grid;place-items:center;flex:none;border-radius:50%;background:#e0f2fe;color:#0369a1;font-size:10px;font-weight:700}
    .status {display:inline-block;padding:5px 9px;border-radius:999px;background:#e2e8f0;color:#475569;font-size:10px;font-weight:700;white-space:nowrap}.status.confirmada,.status.atendida {background:#dcfce7;color:#166534}.status.pendiente {background:#fef3c7;color:#92400e}.action {display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:7px;background:#1767b2;color:white;text-decoration:none;font-size:11px;font-weight:700;white-space:nowrap}.action:hover {background:#123b70}.empty {padding:35px 18px;text-align:center;color:#94a3b8}.empty i,.empty strong,.empty span {display:block}.empty i {margin-bottom:9px;color:#1767b2;font-size:22px}.empty strong {margin-bottom:4px;color:#475569;font-size:13px}.empty span {font-size:11px}
    .notice {display:flex;align-items:center;gap:9px;padding:13px 15px;margin-bottom:18px;border:1px solid;border-radius:9px;font-size:13px}.notice.error {color:#991b1b;background:#fef2f2;border-color:#fecaca}.notice button {margin-left:auto;border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer}.loading {display:flex;align-items:center;gap:10px;padding:50px 0;justify-content:center;color:#64748b}.spinner {width:18px;height:18px;border:2px solid #cbd5e1;border-top-color:#1767b2;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin {to{transform:rotate(360deg)}}
    @media(max-width:700px) { .doctor-page {padding:24px 16px 34px}.welcome {align-items:flex-start;flex-direction:column}.stats {grid-template-columns:1fr;gap:10px}.stat-card {min-height:120px}.section-title h2 {font-size:15px} }
  `],
})
export class MedicoDashboardComponent implements OnInit {
  private readonly service = inject(MedicoPanelService);
  private readonly destroyRef = inject(DestroyRef);
  datos = signal<MedicoDashboard | null>(null);
  cargando = signal(true);
  error = signal('');
  readonly fechaHoy = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando.set(true); this.error.set('');
    this.service.dashboard().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: datos => { this.datos.set(datos); this.cargando.set(false); },
      error: err => { this.error.set(extraerMensajeError(err)); this.cargando.set(false); },
    });
  }
  iniciales(nombre: string): string { return nombre.split(/\s+/).filter(Boolean).slice(0,2).map(p => p[0]).join('').toUpperCase(); }
  formatearFecha(fecha: string): string { const [year, month, day] = fecha.split('-'); return `${day}/${month}/${year}`; }
  claseEstado(estado: string): string { return (estado || '').toLowerCase().replaceAll('_','-'); }
}
