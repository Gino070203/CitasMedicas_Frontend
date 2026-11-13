import { AbstractControl, ValidationErrors } from '@angular/forms';

// Solo letras (incluye tildes/ñ), espacios, apóstrofos y guiones.
export const NOMBRE_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

// DNI: exactamente 8 dígitos.
export const DNI_PATTERN = /^\d{8}$/;

// Teléfono opcional: vacío o exactamente 9 dígitos.
export const TELEFONO_PATTERN = /^(?:$|\d{9})$/;

// Identificadores opcionales (n.º historia, SIS): letras/números, espacios, punto, guion, barra.
export const IDENTIFICADOR_PATTERN = /^(?:$|[\p{L}\p{N}][\p{L}\p{N} ._/-]*)$/u;

export function soloLetrasValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor == null || valor === '') {
    return null; // lo obligatorio lo maneja Validators.required
  }
  return NOMBRE_PATTERN.test(valor) ? null : { soloLetras: true };
}
