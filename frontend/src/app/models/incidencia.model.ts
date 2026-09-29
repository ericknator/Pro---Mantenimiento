export type EstadoIncidencia = 'Reportada' | 'En atención' | 'Solucionada' | 'Cerrada' | 'Reabierta';

export interface NuevaIncidencia {
  categoria: string;
  torre: string;
  piso: string;
  detalle: string;
  descripcion: string;
  evidencias: string[];
}

export interface Incidencia extends NuevaIncidencia {
  id: string;
  estado: EstadoIncidencia;
  fecha: Date;
}