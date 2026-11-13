import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';

const DIAS_JS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * Inicializa flatpickr (CDN) sobre un input, habilitando únicamente los días
 * de la semana que corresponden al bloque de atención seleccionado (diaSemana)
 * y pintando de verde los permitidos y de rojo los no permitidos.
 */
@Directive({
  selector: '[appFlatpickrDiaSemana]',
  standalone: true,
})
export class FlatpickrDiaSemanaDirective implements OnChanges, OnDestroy {
  @Input() diaSemana = '';
  @Input() fechaMinima = '';
  @Input() fechaMaxima = '';
  @Output() fechaSeleccionada = new EventEmitter<string>();

  private instance: any;

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  ngOnChanges(): void {
    this.init();
  }

  ngOnDestroy(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }

  private init(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }

    const fp = (window as any).flatpickr;
    if (typeof fp !== 'function' || !this.diaSemana) {
      return;
    }

    const formatoIso = (fecha: Date): string => {
      const y = fecha.getFullYear();
      const m = String(fecha.getMonth() + 1).padStart(2, '0');
      const d = String(fecha.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
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
      enable: [(fecha: Date) => DIAS_JS[fecha.getDay()] === this.diaSemana],
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
        } else if (DIAS_JS[fecha.dateObj.getDay()] === this.diaSemana) {
          diaCelda.classList.add('availability-free');
        } else {
          diaCelda.classList.add('availability-unavailable');
        }
      },
    });
  }
}
