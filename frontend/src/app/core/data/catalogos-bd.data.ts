export interface OpcionCatalogo {
  id: number;
  codigo: string;
  nombre: string;
}

// Catálogos alineados con el script 02 de la BD (los ids siguen el orden de inserción).
// Pendiente: cargarlos desde la API cuando exista el endpoint de catálogos.
export const CATEGORIAS_BD: OpcionCatalogo[] = [
  { id: 1, codigo: 'ELECTRICIDAD', nombre: 'Electricidad' },
  { id: 2, codigo: 'SANITARIO', nombre: 'Sanitario' },
  { id: 3, codigo: 'LIMPIEZA', nombre: 'Limpieza' },
  { id: 4, codigo: 'SEGURIDAD', nombre: 'Seguridad' },
  { id: 5, codigo: 'ASCENSOR', nombre: 'Ascensor' },
  { id: 6, codigo: 'BOMBAS', nombre: 'Bombas / cisternas' },
  { id: 7, codigo: 'AREAS_COMUNES', nombre: 'Áreas comunes' },
  { id: 8, codigo: 'OTRO', nombre: 'Otro' },
];

export const PRIORIDADES_BD: OpcionCatalogo[] = [
  { id: 1, codigo: 'BAJA', nombre: 'Baja' },
  { id: 2, codigo: 'MEDIA', nombre: 'Media' },
  { id: 3, codigo: 'ALTA', nombre: 'Alta' },
  { id: 4, codigo: 'CRITICA', nombre: 'Crítica' },
];
