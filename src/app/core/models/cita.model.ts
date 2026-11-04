export interface CitaRequest {
  idPaciente: number;
  idMedico: number;
  idHorario: number;
  fecha: string;
  horaInicio: string;
}

export interface Cita {
  idCita: number;
  idPaciente: number;
  nombrePaciente: string;
  idMedico: number;
  nombreMedico: string;
  especialidadNombre: string;
  idHorario: number;
  fecha: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  diagnostico?: string;
}

export interface Turno {
  horaInicio: string;
  horaFin: string;
}
