import { Cita } from './cita.model';

export interface MedicoRequest {
  idUsuario: number;
  idEspecialidad: number;
  cmp: string;
}

export interface MedicoUpdateRequest {
  idEspecialidad: number;
  cmp: string;
}

export interface Medico {
  idMedico: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  cmp: string;
  idEspecialidad: number;
  especialidadNombre: string;
  estado: boolean;
}

export interface MedicoDashboard {
  idMedico: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  agendaDeHoy: Cita[];
  porAtender: Cita[];
  historial: Cita[];
}

export interface DiagnosticoRequest {
  diagnostico: string;
}
