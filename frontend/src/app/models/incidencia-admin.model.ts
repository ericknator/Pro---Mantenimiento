/** Incidencia tal como la ve la administración (lista y clasificación). */
export interface IncidenciaAdmin {
  /** id numérico de la BD, como texto para usarlo en rutas */
  id: string;
  codigo: string;
  categoriaId: number | null;
  categoria: string;
  prioridadId: number | null;
  prioridad: string;
  /** código del catálogo estado_incidencia (REPORTADA, CLASIFICADA, ...) */
  estadoCodigo: string;
  estado: string;
  ubicacion: string;
  descripcion: string;
  solicitante: string;
  fecha: Date;
}
