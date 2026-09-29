import { NavItem } from '../../models/nav-item.model';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', icon: 'home', route: '/inicio' },
  { label: 'Finanzas', icon: 'payments', route: '/modulo/finanzas', soon: true },
  { label: 'Incidencias', icon: 'build', route: '/incidencias' },
  { label: 'Alertas', icon: 'warning', route: '/modulo/alertas' },
  { label: 'Emergencias', icon: 'sos', route: '/modulo/emergencias', soon: true },
  { label: 'Reservas', icon: 'event', route: '/modulo/reservas', soon: true },
  { label: 'Visitas', icon: 'how_to_reg', route: '/modulo/visitas', soon: true },
  { label: 'Paquetes', icon: 'inventory_2', route: '/modulo/paquetes', soon: true },
  { label: 'Mi edificio', icon: 'apartment', route: '/modulo/mi-edificio', soon: true },
  { label: 'Comunicados', icon: 'campaign', route: '/modulo/comunicados' },
  { label: 'Mi perfil', icon: 'person', route: '/modulo/mi-perfil' },
];

export const INCIDENT_ACTIONS: NavItem[] = [
  { label: 'Reportar incidencia', icon: 'edit_note', route: '/incidencias/reportar' },
  { label: 'Mis incidencias', icon: 'list_alt', route: '/incidencias/mis-incidencias' },
  { label: 'Seguimiento de incidencias', icon: 'track_changes', route: '/incidencias/seguimiento' },
  { label: 'Historial de incidencias', icon: 'history', route: '/incidencias/historial' },
];

export const EXIT_ITEM: NavItem = { label: 'Salir', icon: 'logout', route: '/modulo/login' };