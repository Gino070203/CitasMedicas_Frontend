export function extraerMensajeError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      error?: { message?: string; fieldErrors?: Record<string, string> };
      message?: string;
    };

    if (err.error?.fieldErrors) {
      const detalles = Object.values(err.error.fieldErrors).filter(Boolean);
      if (detalles.length > 0) {
        return detalles.join('. ');
      }
    }
    if (err.error?.message) {
      return err.error.message;
    }
    if (err.message) {
      return err.message;
    }
  }
  return 'Ocurrió un error inesperado.';
}
