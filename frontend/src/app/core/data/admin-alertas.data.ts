import { NavItem } from '../../models/nav-item.model';

export const ADMIN_ALERTAS_ACTIONS: NavItem[] = [
  { label: 'Alertas activas', icon: 'warning', route: '/administrador/alertas/activas' },
  { label: 'Alertas críticas', icon: 'error', route: '/administrador/alertas/criticas', danger: true },
  { label: 'Alertas atendidas', icon: 'check_circle', route: '/administrador/alertas/atendidas' },
  { label: 'Historial', icon: 'schedule', route: '/administrador/alertas/historial' },
  { label: 'Seguimiento de atención', icon: 'vital_signs', route: '/administrador/alertas/seguimiento' },
];