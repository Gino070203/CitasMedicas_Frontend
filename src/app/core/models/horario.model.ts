export interface HorarioRequest {
  idMedico: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface Horario {
  idHorario: number;
  idMedico: number;
  nombreMedico: string;
  especialidadNombre: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estado: boolean;
  turnosPosibles: number;
  fechasDisponibles: string;
}
