import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CitaRequest, Turno } from '../../../core/models/cita.model';
import { Horario } from '../../../core/models/horario.model';
import { Medico } from '../../../core/models/medico.model';
import { Paciente } from '../../../core/models/paciente.model';
import { extraerMensajeError } from '../../../core/utils/http-error';
import { AdminService } from '../services/admin.service';

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
  selector: 'app-admin-cita-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="container-fluid px-4 py-5">
      <div class="row justify-content-center">
        <div class="col-lg-9">
          <div class="card admin-form-card shadow-sm">
            <div class="admin-form-header">
              <h3 class="mb-2"><i class="bi bi-calendar-plus me-2"></i> Registrar nueva cita médica</h3>
              <p class="mb-0">Completa la información del paciente, médico y horario de atención.</p>
            </div>

            <div class="card-body p-4 p-md-5">
              @if (error) {
                <div class="alert alert-danger" role="alert">{{ error }}</div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <h5 class="seccion mb-3"><i class="bi bi-person me-2"></i> Datos del paciente</h5>
                <div class="mb-4">
                  <label class="form-label">Paciente</label>
                  <select class="form-select" formControlName="idPaciente">
                    <option value="">Seleccione un paciente</option>
                    @for (p of pacientesDisponibles; track p.idPaciente) {
                      <option [value]="p.idPaciente">{{ p.nombre }} {{ p.apellido }} - DNI: {{ p.dni }}</option>
                    }
                  </select>
                  <small class="text-muted">
                    Solo se muestran pacientes con datos completos (nombre, DNI, fecha de nacimiento y género).
                  </small>
                </div>

                <hr class="my-4" />

                <h5 class="seccion mb-3"><i class="bi bi-person-badge me-2"></i> Datos del médico</h5>
                <div class="mb-4">
                  <label class="form-label">Médico</label>
                  <select class="form-select" formControlName="idMedico" (change)="onMedicoChange()">
                    <option value="">Seleccione un médico</option>
                    @for (m of medicos; track m.idMedico) {
                      <option [value]="m.idMedico">{{ m.nombre }} {{ m.apellido }} - {{ m.especialidadNombre }}</option>
                    }
                  </select>
                </div>

                <div class="mb-4">
                  <label class="form-label">Bloque semanal de atención</label>
                  <select class="form-select" formControlName="idHorario" (change)="onHorarioChange()">
                    <option value="">Seleccione primero un médico</option>
                    @for (h of horariosFiltrados; track h.idHorario) {
                      <option [value]="h.idHorario">{{ horarioTexto(h) }}</option>
                    }
                  </select>
                  <small class="text-muted">
                    El bloque indica la franja recurrente; después elige una fecha y un turno libre de {{ duracionConsultaMinutos }} minutos.
                  </small>
                </div>

                <hr class="my-4" />

                <h5 class="seccion mb-3"><i class="bi bi-clock-history me-2"></i> Fecha y turno de la cita</h5>
                <div class="row g-3 align-items-end">
                  <div class="col-md-4">
                    <label class="form-label">Fecha de atención</label>
                    <input type="date" class="form-control" formControlName="fecha" [min]="fechaMinima" [max]="fechaMaxima" (change)="onFechaChange()" />
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Turno libre</label>
                    <select class="form-select" formControlName="horaInicio" (change)="onTurnoChange()" [disabled]="cargandoTurnos">
                      <option value="">Selecciona primero un bloque y una fecha</option>
                      @for (t of turnos; track t.horaInicio) {
                        <option [value]="t.horaInicio">{{ t.horaInicio }} – {{ t.horaFin }}</option>
                      }
                    </select>
                    @if (cargandoTurnos) {
                      <small class="text-muted">Consultando turnos libres…</small>
                    } @else if (turnos.length === 0 && form.controls.idHorario.value && form.controls.fecha.value) {
                      <small class="text-muted">No hay turnos libres para esta fecha.</small>
                    }
                  </div>
                </div>

                <div class="admin-info-box mt-4">
                  <i class="bi bi-info-circle-fill text-primary me-2"></i>
                  <strong>Importante:</strong> Solo se pueden elegir turnos generados dentro del bloque semanal.
                  El sistema confirma nuevamente la disponibilidad al guardar.
                </div>

                <div class="d-flex flex-wrap gap-2 mt-4">
                  <button type="submit" class="btn btn-success px-4" [disabled]="form.invalid || guardando">
                    <i class="bi bi-check-circle me-1"></i>
                    {{ guardando ? 'Guardando…' : 'Registrar cita' }}
                  </button>
                  <a routerLink="/admin/citas" class="btn btn-outline-secondary px-4">
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
export class AdminCitaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdminService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  horarios: Horario[] = [];
  horariosFiltrados: Horario[] = [];
  turnos: Turno[] = [];

  fechaMinima = '';
  fechaMaxima = '';
  duracionConsultaMinutos = 30;

  cargandoTurnos = false;
  guardando = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    idPaciente: ['', [Validators.required]],
    idMedico: ['', [Validators.required]],
    idHorario: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const hoy = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 90);
    this.fechaMinima = toISODate(hoy);
    this.fechaMaxima = toISODate(max);

    this.service.getPacientes().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.service.getMedicos().subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    this.service.getHorarios().subscribe({
      next: (horarios) => {
        this.horarios = horarios;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  onMedicoChange(): void {
    const idMedico = Number(this.form.controls.idMedico.value);
    this.horariosFiltrados = idMedico
      ? this.horarios.filter((h) => h.idMedico === idMedico)
      : [];
    this.form.controls.idHorario.setValue('');
    this.form.controls.fecha.setValue('');
    this.form.controls.horaInicio.setValue('');
    this.turnos = [];
  }

  onHorarioChange(): void {
    this.form.controls.fecha.setValue('');
    this.form.controls.horaInicio.setValue('');
    this.turnos = [];
  }

  onFechaChange(): void {
    this.form.controls.horaInicio.setValue('');
    this.cargarTurnos();
  }

  onTurnoChange(): void {
    this.cdr.detectChanges();
  }

  cargarTurnos(): void {
    const idHorario = Number(this.form.controls.idHorario.value);
    const fecha = this.form.controls.fecha.value;
    if (!idHorario || !fecha) {
      this.turnos = [];
      return;
    }

    this.cargandoTurnos = true;
    this.service.getTurnos(idHorario, fecha).subscribe({
      next: (turnos) => {
        this.turnos = turnos;
        this.cargandoTurnos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.turnos = [];
        this.cargandoTurnos = false;
        this.error = extraerMensajeError(err);
        this.cdr.detectChanges();
      },
    });
  }

  horarioTexto(h: Horario): string {
    const dia = DIAS[h.diaSemana] ?? h.diaSemana;
    return `${dia} · Bloque de ${h.horaInicio} a ${h.horaFin}`;
  }

  get pacientesDisponibles(): Paciente[] {
    return this.pacientes.filter((p) => this.datosBasicosCompletos(p));
  }

  private datosBasicosCompletos(p: Paciente): boolean {
    const genero = p.genero?.trim().toUpperCase();
    return (
      !!p.nombre?.trim() &&
      !!p.apellido?.trim() &&
      /^\d{8}$/.test(p.dni ?? '') &&
      !!p.fechaNacimiento &&
      (genero === 'MASCULINO' || genero === 'FEMENINO' || genero === 'OTRO')
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const request: CitaRequest = {
      idPaciente: Number(value.idPaciente),
      idMedico: Number(value.idMedico),
      idHorario: Number(value.idHorario),
      fecha: value.fecha,
      horaInicio: value.horaInicio,
    };

    this.guardando = true;
    this.error = null;

    this.service.crearCita(request).subscribe({
      next: () => this.router.navigate(['/admin/citas']),
      error: (err) => {
        this.error = extraerMensajeError(err);
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
