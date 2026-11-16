import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/config';
import { Cita } from '../../core/models/cita.model';
import { DiagnosticoRequest, MedicoDashboard } from '../../core/models/medico.model';

@Injectable({ providedIn: 'root' })
export class MedicoPanelService {
  private readonly http = inject(HttpClient);

  dashboard() {
    return this.http.get<MedicoDashboard>(`${API_URL}/medico/dashboard`);
  }

  obtenerCita(id: number) {
    return this.http.get<Cita>(`${API_URL}/medico/citas/${id}`);
  }

  guardarDiagnostico(id: number, request: DiagnosticoRequest) {
    return this.http.put<Cita>(`${API_URL}/medico/citas/${id}/diagnostico`, request);
  }
}
