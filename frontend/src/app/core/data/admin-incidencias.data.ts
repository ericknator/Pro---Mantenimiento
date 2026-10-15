import { NavItem } from '../../models/nav-item.model';

/** Opciones del módulo Incidencias del administrador (panel inferior del Figma). */
export const ADMIN_INCIDENCIAS_ACTIONS: NavItem[] = [
  { label: 'Todas las incidencias', icon: 'format_list_bulleted', route: '/administrador/incidencias/todas' },
  { label: 'Pendientes', icon: 'format_list_bulleted', route: '/administrador/incidencias/pendientes' },
  { label: 'En atención', icon: 'ecg_heart', route: '/administrador/incidencias/en-atencion' },
  { label: 'Solucionadas', icon: 'format_list_bulleted', route: '/administrador/incidencias/solucionadas' },
  { label: 'Por prioridad', icon: 'warning', route: '/administrador/incidencias/por-prioridad' },
  { label: 'Por categoría', icon: 'tune', route: '/administrador/incidencias/por-categoria' },
  { label: 'Asignaciones', icon: 'assignment', route: '/administrador/incidencias/asignaciones' },
  { label: 'Historial', icon: 'schedule', route: '/administrador/incidencias/historial' },
];
