import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../../../core/config';
import { Horario, HorarioRequest } from '../../../core/models/horario.model';
export const DIAS = [
  { valor: 'MONDAY', nombre: 'Lunes' }, { valor: 'TUESDAY', nombre: 'Martes' },
  { valor: 'WEDNESDAY', nombre: 'Miércoles' }, { valor: 'THURSDAY', nombre: 'Jueves' },
  { valor: 'FRIDAY', nombre: 'Viernes' }, { valor: 'SATURDAY', nombre: 'Sábado' }, { valor: 'SUNDAY', nombre: 'Domingo' },
];
export interface FiltrosHorarios { q: string; diaSemana: string; estado: string; }
@Injectable({ providedIn: 'root' })
export class HorariosService {
  private readonly http = inject(HttpClient);
  listar(filtros: FiltrosHorarios) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) if (value.trim()) params = params.set(key, value.trim());
    return this.http.get<Horario[]>(`${API_URL}/admin/horarios`, { params });
  }
  crear(request: HorarioRequest) { return this.http.post<Horario>(`${API_URL}/admin/horarios`, request); }
  cambiarEstado(id: number) { return this.http.patch<Horario>(`${API_URL}/admin/horarios/${id}/estado`, {}); }
}