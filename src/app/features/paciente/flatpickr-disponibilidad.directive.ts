import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    flatpickr: any;
  }
}

/**
 * Inicializa flatpickr (cargado vía CDN) sobre un input, marcando en el
 * calendario únicamente las fechas disponibles y emitiendo la fecha elegida.
 */
@Directive({
  selector: '[appFlatpickrDisponibilidad]',
  standalone: true,
})
export class FlatpickrDisponibilidadDirective implements OnInit, OnDestroy {
  @Input() fechasDisponibles = '';
  @Input() fechaMinima = '';
  @Input() fechaMaxima = '';
  @Output() fechaSeleccionada = new EventEmitter<string>();

  private instance: any;

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    const fp = window.flatpickr;
    if (typeof fp !== 'function') {
      return;
    }

    const fechas = new Set(
      this.fechasDisponibles.split(',').map((f) => f.trim()).filter(Boolean),
    );

    const formatoIso = (fecha: Date): string => {
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${anio}-${mes}-${dia}`;
    };

    this.instance = fp(this.el.nativeElement, {
      locale: fp.l10ns?.es ?? 'es',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      minDate: this.fechaMinima,
      maxDate: this.fechaMaxima,
      disableMobile: true,
      allowInput: false,
      enable: [
        (fecha: Date) => fechas.has(formatoIso(fecha)),
      ],
      onChange: (seleccion: Date[]) => {
        if (seleccion.length > 0) {
          this.fechaSeleccionada.emit(formatoIso(seleccion[0]));
        }
      },
      onDayCreate: (_dObj: Date, _dStr: string, instancia: any, diaCelda: HTMLElement) => {
        const fecha = diaCelda as any;
        const fechaTexto = instancia.formatDate(fecha.dateObj, 'Y-m-d');

        if (fechaTexto < this.fechaMinima) {
          diaCelda.classList.add('availability-past');
        } else if (fechaTexto > this.fechaMaxima) {
          diaCelda.classList.add('availability-out-of-range');
        } else if (fechas.has(fechaTexto)) {
          diaCelda.classList.add('availability-free');
        } else {
          diaCelda.classList.add('availability-unavailable');
        }
      },
    });
  }

  ngOnDestroy(): void {
    if (this.instance) {
      this.instance.destroy();
    }
  }
}
