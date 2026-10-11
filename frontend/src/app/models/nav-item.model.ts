export interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** Icono en rojo (Emergencia) */
  danger?: boolean;
  /** Aparece en la barra inferior móvil */
  bottom?: boolean;
  /** Aparece en la cuadrícula de módulos del inicio móvil */
  grid?: boolean;
}
