export interface EspecialidadRequest {
  nombre: string;
  descripcion?: string;
}

export interface Especialidad {
  idEspecialidad: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}
