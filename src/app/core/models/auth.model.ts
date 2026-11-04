export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  dni: string;
  correo: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface VerificarRequest {
  correo: string;
  codigo: string;
}

export interface AuthResponse {
  token: string;
  correo: string;
  rol: string;
  nombre: string;
  apellido: string;
  idUsuario: number;
  expiraEnSegundos: number;
}

export interface UsuarioMe {
  idUsuario: number;
  correo: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export interface MensajeResponse {
  mensaje: string;
}

export type Rol = 'ADMIN' | 'MEDICO' | 'PACIENTE';
