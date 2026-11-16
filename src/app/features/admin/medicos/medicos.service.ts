import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../../core/config';
import { Medico, MedicoRequest, MedicoUpdateRequest } from '../../../core/models/medico.model';
import { Especialidad } from '../../../core/models/especialidad.model';

export interface FiltrosMedicos { q: string; idEspecialidad: string; estado: string; }
@Injectable({ providedIn: 'root' })
export class MedicosService {
  private readonly http = inject(HttpClient);
  listar(filtros: FiltrosMedicos = { q: '', idEspecialidad: '', estado: '' }) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) {
      if (value.trim()) params = params.set(key, value.trim());
    }
    return this.http.get<Medico[]>(`${API_URL}/admin/medicos`, { params });
  }
  obtener(id: number) { return this.http.get<Medico>(`${API_URL}/admin/medicos/${id}`); }
  crear(request: MedicoRequest) { return this.http.post<Medico>(`${API_URL}/admin/medicos`, request); }
  actualizar(id: number, request: MedicoUpdateRequest) {
    return this.http.put<Medico>(`${API_URL}/admin/medicos/${id}`, request);
  }
  cambiarEstado(id: number) { return this.http.patch<Medico>(`${API_URL}/admin/medicos/${id}/estado`, {}); }
  especialidades() { return this.http.get<Especialidad[]>(`${API_URL}/admin/especialidades`); }
}