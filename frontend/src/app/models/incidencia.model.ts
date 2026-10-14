// Estados definidos en el PA1 / Avance 02
export type EstadoIncidencia = 'Reportada' | 'En atención' | 'Solucionada' | 'Cerrada' | 'Reabierta';

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
}

