// Estados efectivos del catálogo de incidencias del backend.
export type EstadoIncidencia =
  | 'Reportada'
  | 'Clasificada'
  | 'Asignada'
  | 'En atención'
  | 'Solucionada'
  | 'Cerrada'
  | 'Reabierta';

export interface CambioEstado {
  estado: EstadoIncidencia;
  fecha: Date;
}

/** Datos que captura el residente (HU-INC-01): categoría, ubicación, descripción y evidencia */
export interface NuevaIncidencia {
  categoria: string;
  ubicacion: string;
  descripcion: string;
  evidencias: string[];
}

export interface Incidencia extends NuevaIncidencia {
  id: string;
  autorId: string;
  autor: string;
  estado: EstadoIncidencia;
  creada: Date;
  actualizada: Date;
  historial: CambioEstado[];
  /**
   * Evidencias persistidas que el endpoint de detalle haya podido devolver.
   * No se infiere una URL de archivo a partir de una ruta local del backend.
   */
  evidenciasSolucion: EvidenciaIncidencia[];
  evidenciasConsultaDisponible: boolean;
}

export interface EvidenciaIncidencia {
  id: string;
  nombreArchivo: string;
  urlRecurso: string | null;
  descripcion: string | null;
  tipoCodigo: string | null;
  tipoNombre: string | null;
  creadoEn: Date | null;
}

export interface EvidenciaIncidenciaApi {
  id: number;
  incidencia?: number | { id?: number; codigo?: string } | null;
  nombreArchivo?: string | null;
  urlRecurso?: string | null;
  descripcion?: string | null;
  tipoEvidencia?: {
    codigo?: string | null;
    nombre?: string | null;
  } | null;
  creadoEn?: string | null;
}

/** Estructura devuelta por Spring Boot */
export interface IncidenciaApi {
  id: number;
  codigo: string;
  solicitante: {
    id: number;
    nombres: string;
    apellidos: string;
    correo: string;
  };
  categoria: {
    nombre: string;
  };
  estado: {
    nombre: string;
    codigo: string;
  };
  ubicacion: string;
  descripcion: string;
  fechaReporte: string;
  fechaSolucion: string | null;
  fechaCierre: string | null;
  creadoEn: string;
  actualizadoEn: string;
  /** Disponible solo si el backend de detalle implementa la relación. */
  evidencias?: EvidenciaIncidenciaApi[] | null;
}

