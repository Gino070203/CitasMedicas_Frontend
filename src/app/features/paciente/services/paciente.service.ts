import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config';
import { Cita, Turno } from '../../../core/models/cita.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Horario } from '../../../core/models/horario.model';
import {
  PerfilPacienteForm,
  PerfilPacienteVista,
  ReservaRequest,
} from '../../../core/models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);

  getPerfil(): Observable<PerfilPacienteVista> {
    return this.http.get<PerfilPacienteVista>(`${API_URL}/paciente/perfil`);
  }

  actualizarPerfil(form: PerfilPacienteForm): Observable<PerfilPacienteVista> {
    return this.http.put<PerfilPacienteVista>(`${API_URL}/paciente/perfil`, form);
  }

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${API_URL}/paciente/especialidades`);
  }

  getHorarios(idEspecialidad: number): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${API_URL}/paciente/horarios`, {
      params: { idEspecialidad },
    });
  }

  getTurnos(idHorario: number, fecha: string): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${API_URL}/paciente/turnos`, {
      params: { idHorario, fecha },
    });
  }

  reservar(request: ReservaRequest): Observable<Cita> {
    return this.http.post<Cita>(`${API_URL}/paciente/reservar`, request);
  }

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API_URL}/paciente/citas`);
  }
}
