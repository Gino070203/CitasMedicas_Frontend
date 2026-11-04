export interface PacienteRegistroRequest {
  idUsuario: number;
  numeroHistoria: string;
  sis?: string;
  fechaNacimiento: string;
  genero: string;
  direccion?: string;
}

export interface PacienteActualizacionRequest {
  numeroHistoria: string;
  sis?: string;
  fechaNacimiento: string;
  genero: string;
  direccion?: string;
  numeroHistoriaVerificado: boolean;
  sisVerificado: boolean;
}

export interface Paciente {
  idPaciente: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  dni: string;
  correo: string;
  numeroHistoria: string;
  sis?: string;
  numeroHistoriaVerificado: boolean;
  sisVerificado: boolean;
  fechaNacimiento: string;
  genero: string;
  direccion?: string;
  estado: boolean;
}

export interface PerfilPacienteForm {
  nombre: string;
  apellido: string;
  dni: string;
  numeroHistoria?: string;
  sis?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento: string;
  genero: string;
}

export interface PerfilPacienteVista {
  formulario: PerfilPacienteForm;
  correo: string;
  numeroHistoria: string;
  sis: string;
  numeroHistoriaVerificado: boolean;
  sisVerificado: boolean;
}

export interface ReservaRequest {
  idHorario: number;
  fecha: string;
  horaInicio: string;
}
