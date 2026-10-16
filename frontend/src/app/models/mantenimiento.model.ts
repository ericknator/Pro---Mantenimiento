export interface MantenimientoPreventivo {
  id?: number;
  activoId: number;
  tipoMantenimiento: string;
  fechaProgramada: string; // Formato YYYY-MM-DD
  estado?: string;         // 'PROGRAMADO', 'PENDIENTE'
  nombreActivo?: string;
}

export interface NuevoMantenimientoDto {
  activoId: number;
  activo?: { id: number }; // Por si Spring Boot mapea @ManyToOne con la entidad Activo
  tipoMantenimiento: string;
  fechaProgramada: string;
  estado?: string;
}