import { NavItem } from '../../models/nav-item.model';

/** Menú lateral del rol Administración (Figma: Administrador / Mantenimiento). */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'home', route: '/administrador/dashboard', bottom: true },
  { label: 'Edificio', icon: 'apartment', route: '/administrador/edificio' },
  { label: 'Residentes', icon: 'group', route: '/administrador/residentes', bottom: true },
  { label: 'Finanzas', icon: 'account_balance_wallet', route: '/administrador/finanzas' },
  { label: 'Incidencias', icon: 'build', route: '/administrador/incidencias', bottom: true },
  { label: 'Mantenimiento', icon: 'settings', route: '/administrador/mantenimiento', bottom: true },
  { label: 'Alertas', icon: 'warning', route: '/administrador/alertas' },
  { label: 'Emergencias', icon: 'gpp_maybe', route: '/administrador/emergencias', danger: true },
  { label: 'Seguridad', icon: 'visibility', route: '/administrador/seguridad' },
  { label: 'Áreas comunes', icon: 'event', route: '/administrador/areas-comunes' },
  { label: 'Comunicaciones', icon: 'campaign', route: '/administrador/comunicaciones' },
  { label: 'Reportes', icon: 'bar_chart', route: '/administrador/reportes' },
  { label: 'Configuración', icon: 'tune', route: '/administrador/configuracion' },
];

/** Opciones del módulo Mantenimiento (panel inferior del Figma). */
export const ADMIN_MANTENIMIENTO_ACTIONS: NavItem[] = [
  { label: 'Mantenimientos', icon: 'settings', route: '/administrador/mantenimiento/mantenimientos' },
  { label: 'Mantenimiento preventivo', icon: 'settings', route: '/administrador/mantenimiento/programar' },
  { label: 'Mantenimiento correctivo', icon: 'settings', route: '/administrador/mantenimiento/correctivo' },
  { label: 'Calendario', icon: 'calendar_month', route: '/administrador/mantenimiento/calendario' },
  { label: 'Activos/equipos', icon: 'desktop_windows', route: '/administrador/mantenimiento/activos' },
  { label: 'Historial de activos', icon: 'schedule', route: '/administrador/mantenimiento/historial' },
  { label: 'Proveedores', icon: 'assignment', route: '/administrador/mantenimiento/proveedores' },
  { label: 'Costos', icon: 'account_balance_wallet', route: '/administrador/mantenimiento/costos' },
];
