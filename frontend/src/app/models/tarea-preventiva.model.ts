import { Activo } from './activo.model';
import { Usuario } from './usuario.model';

export type EstadoTarea = 'Programada' | 'En ejecución' | 'Ejecutada' | 'Vencida' | 'Cancelada';

export interface EstadoTareaApi {
  id: number;
  codigo: string;
  nombre: string;
  esEstadoFinal: boolean;
  activo: boolean;
}

export interface TareaPreventivaApi {
  id: number;
  titulo: string;
  descripcion: string;
  programadaPara: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  activo: {
    id: number;
    codigo: string;
    nombre: string;
    ubicacion?: string;
  };
  responsable?: {
    id: number;
    nombres: string;
    apellidos: string;
    correo?: string;
  } | null;
  planMantenimiento?: {
    frecuencia?: {
      id: number;
      codigo: string;
      nombre: string;
    } | null;
  } | null;
  estado: EstadoTareaApi;
}

export interface TareaPreventiva {
  id: string;
  titulo: string;
  descripcion: string;
  fechaProgramada: Date;
  activoId: string;
  activoCodigo: string;
  activoNombre: string;
  ubicacion: string;
  responsableId?: string;
  responsableNombre?: string;
  estado: EstadoTarea;
  estadoCodigo: string;
}
