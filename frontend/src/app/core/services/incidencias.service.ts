import { Injectable, signal } from '@angular/core';
import { Incidencia, NuevaIncidencia } from '../../models/incidencia.model';

// DEMO: datos en memoria. Reemplazar por HttpClient cuando la API de Spring Boot esté disponible.
@Injectable({ providedIn: 'root' })
export class IncidenciasService {
  private readonly _lista = signal<Incidencia[]>([]);
  readonly lista = this._lista.asReadonly();

  crear(datos: NuevaIncidencia): Incidencia {
    const nueva: Incidencia = {
      ...datos,
      id: `INC-${String(this._lista().length + 1).padStart(4, '0')}`,
      estado: 'Reportada',
      fecha: new Date(),
    };
    this._lista.update((l) => [nueva, ...l]);
    return nueva;
  }
}