import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../../core/config';
import { Paciente, PacienteRegistroRequest, PacienteActualizacionRequest } from '../../../core/models/paciente.model';
export interface FiltrosPacientes { q: string; estado: string; conSis: string; }
@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly http = inject(HttpClient);
  listar(filtros: FiltrosPacientes = { q: '', estado: '', conSis: '' }) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) if (value.trim()) params = params.set(key, value.trim());
    return this.http.get<Paciente[]>(`${API_URL}/admin/pacientes`, { params });
  }
  obtener(id: number) { return this.http.get<Paciente>(`${API_URL}/admin/pacientes/${id}`); }
  crear(request: PacienteRegistroRequest) { return this.http.post<Paciente>(`${API_URL}/admin/pacientes`, request); }
  actualizar(id: number, request: PacienteActualizacionRequest) { return this.http.put<Paciente>(`${API_URL}/admin/pacientes/${id}`, request); }
  cambiarEstado(id: number) { return this.http.patch<Paciente>(`${API_URL}/admin/pacientes/${id}/estado`, {}); }
}