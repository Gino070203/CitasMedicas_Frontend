export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  dni: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  password?: string;
  rol: string;
}

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  dni: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
  rolNombre: string;
}
