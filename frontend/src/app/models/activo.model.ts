export interface TipoActivo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface EstadoActivo {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
}

/** Forma en la que el backend devuelve un activo. */
export interface ActivoApi {
  id?: number;
  codigo: string;
  tipoActivo?: TipoActivo | null;
  estadoActivo?: EstadoActivo | null;
  nombre: string;
  ubicacion: string;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  fechaInstalacion?: string | null;
  descripcion?: string | null;
  esCritico?: boolean | null;
  activo?: boolean | null;
  creadoEn?: string | null;
  actualizadoEn?: string | null;
}

export interface Activo {
  id?: number;
  codigo: string;
  nombre: string;
  tipo: string;
  tipoActivoId?: number;
  ubicacion: string;
  descripcion?: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  fechaInstalacion?: string;
  esCritico?: boolean;
  estado: string; // 'OPERATIVO', 'EN_MANTENIMIENTO', etc.
  activo?: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface NuevoActivoDto {
  nombre: string;
  tipoActivoId: number;
  ubicacion: string;
  esCritico: boolean;
  descripcion?: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  fechaInstalacion?: string;
}

/** Payload permitido por POST /api/activo. */
export interface NuevoActivoPayload {
  nombre: string;
  ubicacion: string;
  tipoActivo: { id: number };
  esCritico: boolean;
  descripcion?: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  fechaInstalacion?: string;
}
