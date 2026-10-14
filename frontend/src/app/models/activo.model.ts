export interface Activo {
  id?: number | string;
  codigo: string;          // Ej: ASC-01, BOM-01
  nombre: string;          // Ej: Ascensor Principal Torre 1
  tipo: string;            // Ej: Ascensor, Bomba de agua, Portón
  ubicacion: string;       // Ej: Torre 1 - Pasadizo central
  descripcion?: string;
  estado?: string;         // OPERATIVO, EN_MANTENIMIENTO, etc.
}

export type NuevoActivo = Omit<Activo, 'id' | 'estado'>;