import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Cita } from '../../../core/models/cita.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { PacienteService } from '../services/paciente.service';

const DIAS: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

@Component({
  selector: 'app-paciente-citas',
  imports: [NgClass, RouterLink],
  template: `
    <main class="patient-main">
      <header class="mb-4">
        <h1 class="patient-page-title">Mis citas e historial</h1>
      </header>

      @if (error) {
        <div class="patient-alert patient-alert-danger mb-3" role="alert">{{ error }}</div>
      }

      @if (cargando) {
        <p class="patient-page-intro">Cargando tus citas…</p>
      } @else if (citas.length > 0) {
        <section class="patient-cards-grid" aria-label="Citas registradas">
          @for (c of citas; track c.idCita) {
            <article class="appointment-card">
              <div class="appointment-card-top">
                <div class="appointment-date">
                  <span class="appointment-date-icon" aria-hidden="true">
                    <i class="bi bi-calendar-event"></i>
                  </span>
                  <span>{{ formatoFecha(c.fecha) }}</span>
                </div>
                <span class="patient-badge" [ngClass]="badgeInfo(c).clase">
                  <i class="bi {{ badgeInfo(c).icono }}" aria-hidden="true"></i>{{ badgeInfo(c).texto }}
                </span>
              </div>

              <h2 class="appointment-card-title">Dr. {{ c.nombreMedico }}</h2>
              <p class="appointment-specialty">{{ c.especialidadNombre || 'Atención médica' }}</p>

              <div class="appointment-details">
                <div>
                  <span class="detail-label">Horario</span>
                  <span class="detail-value">{{ c.horaInicio }} – {{ c.horaFin }}</span>
                </div>
                <div>
                  <span class="detail-label">Día de atención</span>
                  <span class="detail-value">{{ diaEnEspanol(c.diaSemana) }}</span>
                </div>
              </div>

              <div>
                <span class="detail-label">Diagnóstico / observaciones</span>
                <p class="appointment-notes mb-0">
                  {{ c.diagnostico || 'Aún no hay observaciones registradas.' }}
                </p>
              </div>
            </article>
          }
        </section>
      } @else {
        <section class="patient-empty-state">
          <span class="patient-empty-icon" aria-hidden="true">
            <i class="bi bi-calendar2-x"></i>
          </span>
          <h2>Aún no tienes citas</h2>
          <p>Cuando reserves una consulta, encontrarás aquí la fecha, el horario y su estado.</p>
          <a class="btn patient-btn-primary" routerLink="/paciente/reservar">
            <i class="bi bi-calendar-plus me-2" aria-hidden="true"></i>Buscar un horario
          </a>
        </section>
      }
    </main>

    <footer class="patient-footer">Centro Médico · Portal del paciente</footer>
  `,
})
export class PacienteCitasComponent implements OnInit {
  private readonly service = inject(PacienteService);
  private readonly cdr = inject(ChangeDetectorRef);

  citas: Cita[] = [];
  cargando = true;
  error: string | null = null;

  ngOnInit(): void {
    this.service.getCitas().subscribe({
      next: (citas) => {
        this.citas = citas;
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

  formatoFecha(fecha: string): string {
    if (!fecha) {
      return 'Fecha pendiente';
    }
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  diaEnEspanol(dia: string): string {
    return DIAS[dia] ?? dia ?? 'No disponible';
  }

  badgeInfo(c: Cita): { clase: string; texto: string; icono: string } {
    switch (c.estado) {
      case 'CONFIRMADA':
        return { clase: 'status-confirmada', texto: 'Confirmada', icono: 'bi-check-circle' };
      case 'PENDIENTE_PAGO':
      case 'PENDIENTE':
        return { clase: 'status-pendiente', texto: 'Pendiente', icono: 'bi-hourglass-split' };
      case 'CANCELADA':
        return { clase: 'status-cancelada', texto: 'Cancelada', icono: 'bi-x-circle' };
      case 'ATENDIDA':
        return { clase: 'status-confirmada', texto: 'Atendida', icono: 'bi-check-circle' };
      default:
        return { clase: 'status-neutral', texto: c.estado || 'Estado pendiente', icono: 'bi-info-circle' };
    }
  }
}
