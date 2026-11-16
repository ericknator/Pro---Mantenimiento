import { NavItem } from '../../models/nav-item.model';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', icon: 'home', route: '/inicio', bottom: true },
  { label: 'Finanzas', icon: 'account_balance_wallet', route: '/modulo/finanzas', bottom: true, grid: true },
  { label: 'Incidencias', icon: 'build', route: '/incidencias', bottom: true, grid: true },
  { label: 'Mantenimientos', icon: 'engineering', route: '/mantenimiento', bottom: true, grid: true },
  { label: 'Alertas', icon: 'warning', route: '/modulo/alertas', grid: true },
  { label: 'Emergencia', icon: 'gpp_maybe', route: '/modulo/emergencia', danger: true },
  { label: 'Reservas', icon: 'calendar_month', route: '/modulo/reservas', bottom: true, grid: true },
  { label: 'Visitas', icon: 'group', route: '/modulo/visitas', grid: true },
  { label: 'Paquetes', icon: 'inventory_2', route: '/modulo/paquetes', grid: true },
  { label: 'Mi edificio', icon: 'apartment', route: '/modulo/mi-edificio', grid: true },
  { label: 'Comunicados', icon: 'campaign', route: '/modulo/comunicados', grid: true },
  { label: 'Mi perfil', icon: 'person', route: '/modulo/mi-perfil' },
];

export const NOTIFICACIONES_ITEM: NavItem = {
  label: 'Notificaciones',
  icon: 'notifications',
  route: '/modulo/notificaciones',
};

export const INCIDENT_ACTIONS: NavItem[] = [
  { label: 'Reportar incidencia', icon: 'edit_note', route: '/incidencias/reportar' },
  { label: 'Mis incidencias', icon: 'list_alt', route: '/incidencias/mis-incidencias' },
  { label: 'Seguimiento de incidencias', icon: 'track_changes', route: '/incidencias/seguimiento' },
  { label: 'Historial de incidencias', icon: 'history', route: '/incidencias/historial' },
  { label: 'Incidencias asignadas', icon: 'assignment_ind', route: '/incidencias/asignadas' },
];

/* 
export const MANTENIMIENTO_ACTIONS: NavItem[] = [
  { label: 'Tareas preventivas asignadas', icon: 'assignment_turned_in', route: '/mantenimiento/tareas-asignadas' },
  { label: 'Programar preventivo', icon: 'calendar_month', route: '/mantenimiento/programar' },
];
*/

export const CATEGORIAS_INCIDENCIA = [
  'Gasfitería',
  'Electricidad',
  'Ascensores',
  'Iluminación',
  'Puertas y portones',
  'Áreas comunes',
  'Seguridad',
  'Otro',
];

export const EDIFICIO_NOMBRE = 'Condominio Nuevo Alcázar';

export const MANTENIMIENTO_ACTIONS: NavItem[] = [
  { label: 'Tareas preventivas asignadas', icon: 'build_circle', route: '/mantenimiento/tareas-asignadas' },
  { label: 'Correctivos', icon: 'construction', route: '/mantenimiento/correctivos' },
  { label: 'Calendario', icon: 'calendar_month', route: '/mantenimiento/calendario' },
  { label: 'Historial', icon: 'history', route: '/mantenimiento/historial' },
];

/**
 * Resuelve las rutas de navegación según el rol autenticado.
 * No modifica el arreglo original de navegación.
 */
export function resolverNavegacionPorRol(
  items: NavItem[],
  rol?: string
): NavItem[] {
  return items.map((item) => {
    if (item.route === '/modulo/alertas') {
      if (rol === 'seguridad') {
        return { ...item, route: '/seguridad/alertas' };
      }

      if (rol === 'administrador') {
        return { ...item, route: '/administrador/alertas' };
      }
    }

    return item;
  });
}