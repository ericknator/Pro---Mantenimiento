import { Injectable, computed, inject, signal } from '@angular/core';
import { CambioEstado, EstadoIncidencia, Incidencia, NuevaIncidencia } from '../../models/incidencia.model';
import { AuthService } from './auth.service';

const hace = (dias: number, horas = 0) => new Date(Date.now() - (dias * 24 + horas) * 3_600_000);

function caso(
  id: string,
  autorId: string,
  autor: string,
  categoria: string,
  ubicacion: string,
  descripcion: string,
  pasos: [EstadoIncidencia, Date][],
): Incidencia {
  const historial: CambioEstado[] = pasos.map(([estado, fecha]) => ({ estado, fecha }));
  const ultimo = historial[historial.length - 1];
  return {
    id, autorId, autor, categoria, ubicacion, descripcion, evidencias: [],
    estado: ultimo.estado,
    creada: historial[0].fecha,
    actualizada: ultimo.fecha,
    historial,
  };
}

// DEMO: datos ficticios en memoria. Se reemplazan por la API de Spring Boot (PMS-45).
function semilla(): Incidencia[] {
  return [
    caso('INC-0001', 'u-1', 'María Torres', 'Gasfitería', 'Dpto. 402 · Baño principal',
      'Fuga de agua en el lavatorio', [['Reportada', hace(0, 3)]]),
    caso('INC-0002', 'u-1', 'María Torres', 'Electricidad', 'Pasillo del piso 4',
      'Foco quemado en pasillo del piso 4', [['Reportada', hace(3)], ['En atención', hace(2, 20)]]),
    caso('INC-0003', 'u-1', 'María Torres', 'Ascensores', 'Torre 1 · Ascensor principal',
      'La puerta del ascensor no cierra bien',
      [['Reportada', hace(11)], ['En atención', hace(10, 6)], ['Solucionada', hace(9)]]),
    caso('INC-0004', 'u-1', 'María Torres', 'Iluminación', 'Escalera de emergencia',
      'Luz de emergencia sin batería',
      [['Reportada', hace(30)], ['En atención', hace(29)], ['Solucionada', hace(28)], ['Cerrada', hace(27)]]),
    // Caso de otro residente: sirve para probar el acceso no permitido (HU-INC-02-CA-02)
    caso('INC-0005', 'u-2', 'Carlos Mendoza', 'Seguridad', 'Dpto. 701',
      'Intercomunicador sin audio', [['Reportada', hace(2)], ['En atención', hace(1, 12)]]),
  ];
}

@Injectable({ providedIn: 'root' })
export class IncidenciasService {
  private readonly auth = inject(AuthService);
  private readonly _todas = signal<Incidencia[]>(semilla());

  /** Solo las incidencias del usuario autenticado, de la más reciente a la más antigua. */
  readonly propias = computed(() => {
    const usuario = this.auth.usuario();
    if (!usuario) return [];
    return this._todas()
      .filter((i) => i.autorId === usuario.id)
      .sort((a, b) => b.creada.getTime() - a.creada.getTime());
  });

  /** HU-INC-01: crea el caso con identificador único, estado Reportada y autor visible. */
  crear(datos: NuevaIncidencia): Incidencia | null {
    const usuario = this.auth.usuario();
    if (!usuario) return null;
    const ahora = new Date();
    const nueva: Incidencia = {
      ...datos,
      id: `INC-${String(this._todas().length + 1).padStart(4, '0')}`,
      autorId: usuario.id,
      autor: usuario.nombre,
      estado: 'Reportada',
      creada: ahora,
      actualizada: ahora,
      historial: [{ estado: 'Reportada', fecha: ahora }],
    };
    this._todas.update((lista) => [nueva, ...lista]);
    return nueva;
  }

  /** HU-INC-02: devuelve el caso solo si pertenece al usuario; si no, null (acceso no permitido). */
  obtenerPropia(id: string | null): Incidencia | null {
    if (!id) return null;
    return this.propias().find((i) => i.id === id) ?? null;
  }
}
