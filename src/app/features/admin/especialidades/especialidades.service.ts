import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../../core/config';
import { Especialidad, EspecialidadRequest } from '../../../core/models/especialidad.model';
export interface FiltrosEspecialidades { q: string; estado: string; }
@Injectable({ providedIn: 'root' })
export class EspecialidadesService {
  private readonly http = inject(HttpClient);
  listar(filtros: FiltrosEspecialidades) {
    let params = new HttpParams();
    if (filtros.q.trim()) params = params.set('q', filtros.q.trim());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<Especialidad[]>(`${API_URL}/admin/especialidades`, { params });
  }
  obtener(id: number) { return this.http.get<Especialidad>(`${API_URL}/admin/especialidades/${id}`); }
  crear(request: EspecialidadRequest) { return this.http.post<Especialidad>(`${API_URL}/admin/especialidades`, request); }
  actualizar(id: number, request: EspecialidadRequest) { return this.http.put<Especialidad>(`${API_URL}/admin/especialidades/${id}`, request); }
  cambiarEstado(id: number) { return this.http.patch<Especialidad>(`${API_URL}/admin/especialidades/${id}/estado`, {}); }
}