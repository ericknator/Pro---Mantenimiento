export interface Activo {
  id?: number;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  descripcion?: string;
  estado: string; // 'OPERATIVO', 'EN_MANTENIMIENTO', etc.
}

export interface NuevoActivoDto {
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  descripcion?: string;
  estado?: string;
}