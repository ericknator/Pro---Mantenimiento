export interface MantenimientoPreventivo {
  id?: number | string;
  activoId: number | string;
  tipoMantenimiento: string;
  fechaProgramada: string;
  // Campos opcionales para la visualización en la tabla/lista
  nombreActivo?: string;
  estado?: string;
}

export interface ActivoItem {
  id: number | string;
  codigo: string;
  nombre: string;
  ubicacion?: string;
}