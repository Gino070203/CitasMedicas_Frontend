import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config';
import { Cita, CitaRequest, Turno } from '../../../core/models/cita.model';
import { Dashboard } from '../../../core/models/dashboard.model';
import { Horario } from '../../../core/models/horario.model';
import { Medico } from '../../../core/models/medico.model';
import { Paciente } from '../../../core/models/paciente.model';
import { Pago, PagoRequest } from '../../../core/models/pago.model';
import { Usuario, UsuarioRequest } from '../../../core/models/usuario.model';

export interface FiltrosUsuarios {
  q: string;
  rol: string;
  estado: string;
}

export interface FiltrosCitas {
  q: string;
  estado: string;
  fecha: string;
  idMedico: string;
}

export interface FiltrosPagos {
  q: string;
  metodo: string;
  estado: string;
  desde: string;
  hasta: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  // ---- Dashboard ----
  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${API_URL}/admin/dashboard`);
  }

  // ---- Usuarios ----
  getUsuarios(filtros: FiltrosUsuarios): Observable<Usuario[]> {
    let params = new HttpParams();
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.rol) params = params.set('rol', filtros.rol);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<Usuario[]>(`${API_URL}/admin/usuarios`, { params });
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${API_URL}/admin/usuarios/${id}`);
  }

  crearUsuario(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${API_URL}/admin/usuarios`, request);
  }

  actualizarUsuario(id: number, request: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${API_URL}/admin/usuarios/${id}`, request);
  }

  cambiarEstadoUsuario(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${API_URL}/admin/usuarios/${id}/estado`, {});
  }

  // ---- Catálogos (para formularios de citas) ----
  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${API_URL}/admin/medicos`, {
      params: { estado: 'true' },
    });
  }

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${API_URL}/admin/pacientes`, {
      params: { estado: 'true' },
    });
  }

  getHorarios(): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${API_URL}/admin/horarios`, {
      params: { estado: 'true' },
    });
  }

  // ---- Citas ----
  getCitas(filtros: FiltrosCitas): Observable<Cita[]> {
    let params = new HttpParams();
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.fecha) params = params.set('fecha', filtros.fecha);
    if (filtros.idMedico) params = params.set('idMedico', filtros.idMedico);
    return this.http.get<Cita[]>(`${API_URL}/admin/citas`, { params });
  }

  getTurnos(idHorario: number, fecha: string): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${API_URL}/admin/citas/turnos`, {
      params: { idHorario, fecha },
    });
  }

  crearCita(request: CitaRequest): Observable<Cita> {
    return this.http.post<Cita>(`${API_URL}/admin/citas`, request);
  }

  cancelarCita(id: number): Observable<Cita> {
    return this.http.patch<Cita>(`${API_URL}/admin/citas/${id}/cancelar`, {});
  }

  // ---- Pagos ----
  getPagos(filtros: FiltrosPagos): Observable<Pago[]> {
    let params = new HttpParams();
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.metodo) params = params.set('metodo', filtros.metodo);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<Pago[]>(`${API_URL}/admin/pagos`, { params });
  }

  getTotalPagos(): Observable<number> {
    return this.http.get<number>(`${API_URL}/admin/pagos/total`);
  }

  getCitasPendientes(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API_URL}/admin/pagos/citas-pendientes`);
  }

  registrarPago(request: PagoRequest): Observable<Pago> {
    return this.http.post<Pago>(`${API_URL}/admin/pagos`, request);
  }
}
