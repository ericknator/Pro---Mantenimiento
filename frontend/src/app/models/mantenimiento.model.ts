export interface MantenimientoPreventivo {
  id?: number;
  activoId: number;
  titulo: string;
  descripcion?: string;
  fechaProgramada: string; // Formato YYYY-MM-DDTHH:mm
  frecuenciaNombre?: string;
  responsableNombre?: string;
  estado?: string;
  nombreActivo?: string;
}

export interface FrecuenciaMantenimientoApi {
  id: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface RolApi {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface UsuarioResponsableApi {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  activo: boolean;
  rol?: RolApi | null;
}

export interface PlanMantenimientoPayload {
  activoId: number;
  frecuenciaId: number;
  responsableId: number;
  titulo: string;
  descripcion?: string;
  primeraTareaProgramadaPara: string;
}

export interface PlanMantenimientoApi {
  id?: number;
  activo?: { id: number };
  frecuencia?: FrecuenciaMantenimientoApi | null;
  responsable?: UsuarioResponsableApi | null;
  titulo?: string;
  descripcion?: string | null;
  primeraTareaProgramadaPara?: string | null;
}
