import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Cita, Turno } from '../../../core/models/cita.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Horario } from '../../../core/models/horario.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { FlatpickrDisponibilidadDirective } from '../flatpickr-disponibilidad.directive';
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
  selector: 'app-paciente-reservar',
  imports: [FlatpickrDisponibilidadDirective, RouterLink],
  template: `
    <main class="patient-main">
      <header class="mb-4">
        <p class="patient-hero-eyebrow text-primary mb-2">Agenda tu atención</p>
        <h1 class="patient-page-title">Reserva una cita</h1>
      </header>

      @if (error) {
        <div class="patient-alert patient-alert-danger mb-3" role="alert">
          <i class="bi bi-exclamation-circle-fill me-2" aria-hidden="true"></i>
          <span>{{ error }}</span>
        </div>
      }

      @if (citaReservada) {
        @if (citaReservada.estado === 'CONFIRMADA') {
          <div class="patient-alert patient-alert-success mb-3" role="status">
            <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
            Tu cita fue reservada y confirmada correctamente.
          </div>
        } @else {
          <div class="patient-alert patient-alert-warning mb-3" role="status">
            <i class="bi bi-clock-history me-2" aria-hidden="true"></i>
            Tu cita está pendiente de confirmación. Revisa las indicaciones del centro médico.
          </div>
        }
        <a class="btn patient-btn-primary" routerLink="/paciente/citas">
          <i class="bi bi-clipboard2-heart me-2" aria-hidden="true"></i>Ver mis citas
        </a>
      } @else {
        <section class="patient-panel" aria-labelledby="seleccionEspecialidad">
          <div class="d-flex align-items-start gap-3 mb-3">
            <span class="patient-action-icon mb-0" aria-hidden="true">
              <i class="bi bi-heart-pulse"></i>
            </span>
            <div>
              <h2 class="patient-panel-heading mb-1" id="seleccionEspecialidad">1. Elige una especialidad</h2>
              <p class="patient-page-intro">
                Verás los bloques semanales del médico y los turnos concretos que siguen libres.
              </p>
            </div>
          </div>

          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-8">
              <label class="patient-form-label" for="idEspecialidad">Especialidad médica</label>
              <select class="form-select patient-form-select" id="idEspecialidad" #selEspecialidad>
                <option value="" disabled [selected]="!especialidadSeleccionada">
                  Selecciona una especialidad
                </option>
                @for (esp of especialidades; track esp.idEspecialidad) {
                  <option
                    [value]="esp.idEspecialidad"
                    [selected]="especialidadSeleccionada?.idEspecialidad === esp.idEspecialidad"
                  >
                    {{ esp.nombre }}
                  </option>
                }
              </select>
            </div>
            <div class="col-12 col-md-4">
              <button class="btn patient-btn-primary w-100" type="button" (click)="seleccionarEspecialidad(selEspecialidad.value)">
                <i class="bi bi-search me-2" aria-hidden="true"></i>Ver disponibilidad
              </button>
            </div>
          </div>
        </section>

        @if (especialidadSeleccionada) {
          @if (cargandoHorarios) {
            <p class="patient-page-intro mt-4">Cargando horarios…</p>
          } @else if (horarios.length > 0) {
            <section class="mt-4" aria-labelledby="horariosDisponibles">
              <div class="d-flex flex-wrap justify-content-between align-items-end gap-2">
                <div>
                  <h2 class="patient-section-heading mb-1" id="horariosDisponibles">2. Elige un bloque y una fecha</h2>
                  <p class="patient-page-intro">
                    Cada bloque se divide en turnos de <strong>{{ duracionConsultaMinutos }}</strong> minutos.
                    Se muestran los próximos 90 días.
                  </p>
                </div>
                <span class="patient-badge status-neutral">{{ horarios.length }} bloques de atención</span>
              </div>

              <div class="availability-legend" aria-label="Leyenda del calendario">
                <span><i class="availability-legend-dot availability-legend-free" aria-hidden="true"></i>Hay al menos un turno libre</span>
                <span><i class="availability-legend-dot availability-legend-busy" aria-hidden="true"></i>No atiende o todos los turnos están ocupados</span>
                <span><i class="availability-legend-dot availability-legend-past" aria-hidden="true"></i>Fecha pasada</span>
                <span><i class="availability-legend-dot availability-legend-past" aria-hidden="true"></i>Fuera de los próximos 90 días</span>
              </div>

              <div class="patient-cards-grid">
                @for (h of horarios; track h.idHorario) {
                  <article class="slot-card">
                    <div class="slot-card-top">
                      <span class="slot-icon" aria-hidden="true">
                        <i class="bi bi-person-badge"></i>
                      </span>
                      <div class="flex-grow-1">
                        <h3>{{ h.nombreMedico }}</h3>
                        <p class="slot-specialty">{{ h.especialidadNombre || 'Especialidad médica' }}</p>
                      </div>
                      <span class="day-badge slot-day">{{ diaEnEspanol(h.diaSemana) }}</span>
                    </div>

                    <div class="slot-details">
                      <div>
                        <span class="detail-label">Inicio del bloque</span>
                        <span class="detail-value">{{ h.horaInicio }}</span>
                      </div>
                      <div>
                        <span class="detail-label">Fin del bloque</span>
                        <span class="detail-value">{{ h.horaFin }}</span>
                      </div>
                    </div>

                    <label class="patient-form-label" [for]="'fechaCita-' + h.idHorario">
                      3. Fecha de atención
                    </label>
                    <input
                      class="form-control patient-form-control mb-3"
                      type="text"
                      readonly
                      autocomplete="off"
                      placeholder="Selecciona una fecha disponible"
                      [id]="'fechaCita-' + h.idHorario"
                      appFlatpickrDisponibilidad
                      [fechasDisponibles]="h.fechasDisponibles"
                      [fechaMinima]="fechaMinima"
                      [fechaMaxima]="fechaMaxima"
                      (fechaSeleccionada)="onFecha(h, $event)"
                    />

                    @if (horarioActivoId === h.idHorario) {
                      @if (cargandoTurnos) {
                        <p class="form-text">Consultando turnos libres…</p>
                      } @else if (turnos.length === 0) {
                        <p class="form-text">No quedan turnos libres para esta fecha. Elige otra.</p>
                      } @else {
                        <fieldset class="patient-slot-picker mb-3">
                          <legend class="patient-form-label">4. Selecciona un turno</legend>
                          <div class="patient-slot-options" role="radiogroup" aria-label="Turnos disponibles">
                            @for (t of turnos; track t.horaInicio) {
                              <label
                                class="patient-slot-option"
                                [class.is-selected]="turnoSeleccionado?.horaInicio === t.horaInicio"
                              >
                                <input
                                  type="radio"
                                  name="horaInicio"
                                  [value]="t.horaInicio"
                                  (change)="seleccionarTurno(t)"
                                />
                                <span>{{ t.horaInicio }} – {{ t.horaFin }}</span>
                              </label>
                            }
                          </div>
                        </fieldset>
                      }
                    }

                    <button
                      class="btn patient-btn-primary"
                      type="button"
                      [disabled]="horarioActivoId !== h.idHorario || !turnoSeleccionado || reservando"
                      (click)="reservar(h)"
                    >
                      <i class="bi bi-calendar-check me-2" aria-hidden="true"></i>Reservar este turno
                    </button>
                  </article>
                }
              </div>
            </section>
          } @else {
            <section class="patient-empty-state mt-4">
              <span class="patient-empty-icon" aria-hidden="true">
                <i class="bi bi-calendar2-minus"></i>
              </span>
              <h2>No hay bloques de atención disponibles</h2>
              <p>
                Por ahora no encontramos turnos para esta especialidad. Puedes elegir otra o volver a consultar más tarde.
              </p>
            </section>
          }
        } @else {
          <section class="patient-empty-state mt-4">
            <span class="patient-empty-icon" aria-hidden="true">
              <i class="bi bi-calendar2-week"></i>
            </span>
            <h2>Encuentra el horario adecuado</h2>
            <p>Selecciona una especialidad para ver los médicos y sus días de atención.</p>
          </section>
        }
      }
    </main>

    <footer class="patient-footer">Centro Médico · Portal del paciente</footer>
  `,
})
export class PacienteReservarComponent implements OnInit {
  private readonly service = inject(PacienteService);
  private readonly cdr = inject(ChangeDetectorRef);

  especialidades: Especialidad[] = [];
  horarios: Horario[] = [];
  turnos: Turno[] = [];

  especialidadSeleccionada: Especialidad | null = null;
  horarioActivoId: number | null = null;
  fechaSeleccionada: string | null = null;
  turnoSeleccionado: Turno | null = null;

  fechaMinima = '';
  fechaMaxima = '';
  duracionConsultaMinutos = 30;

  cargandoHorarios = false;
  cargandoTurnos = false;
  reservando = false;
  error: string | null = null;
  citaReservada: Cita | null = null;

  ngOnInit(): void {
    const hoy = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 90);

    this.fechaMinima = toISODate(hoy);
    this.fechaMaxima = toISODate(max);

    this.service.getEspecialidades().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarEspecialidad(valor: string | number): void {
    const id = Number(valor);
    if (!id) {
      return;
    }
    this.especialidadSeleccionada =
      this.especialidades.find((e) => e.idEspecialidad === id) ?? null;
    this.horarios = [];
    this.turnos = [];
    this.horarioActivoId = null;
    this.turnoSeleccionado = null;
    this.error = null;

    this.cargandoHorarios = true;
    this.service.getHorarios(id).subscribe({
      next: (horarios) => {
        this.horarios = horarios;
        this.cargandoHorarios = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.cargandoHorarios = false;
        this.cdr.detectChanges();
      },
    });
  }

  onFecha(horario: Horario, fecha: string): void {
    this.horarioActivoId = horario.idHorario;
    this.fechaSeleccionada = fecha;
    this.turnoSeleccionado = null;
    this.turnos = [];
    this.error = null;

    this.cargandoTurnos = true;
    this.service.getTurnos(horario.idHorario, fecha).subscribe({
      next: (turnos) => {
        this.turnos = turnos;
        this.cargandoTurnos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.turnos = [];
        this.error = extraerMensajeError(err);
        this.cargandoTurnos = false;
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarTurno(t: Turno): void {
    this.turnoSeleccionado = t;
    this.error = null;
  }

  reservar(horario: Horario): void {
    if (!this.fechaSeleccionada || !this.turnoSeleccionado) {
      return;
    }
    this.reservando = true;
    this.error = null;

    this.service
      .reservar({
        idHorario: horario.idHorario,
        fecha: this.fechaSeleccionada,
        horaInicio: this.turnoSeleccionado.horaInicio,
      })
      .subscribe({
        next: (cita) => {
          this.citaReservada = cita;
          this.reservando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = extraerMensajeError(err);
          this.reservando = false;
          this.cdr.detectChanges();
        },
      });
  }

  diaEnEspanol(dia: string): string {
    return DIAS[dia] ?? dia;
  }
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
