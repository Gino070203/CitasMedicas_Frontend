export interface PagoRequest {
  idCita: number;
  monto: number;
  metodoPago: string;
}

export interface Pago {
  idPago: number;
  idCita: number;
  nombrePaciente: string;
  nombreMedico: string;
  monto: number;
  fechaPago?: string;
  metodoPago: string;
  estado: string;
}
