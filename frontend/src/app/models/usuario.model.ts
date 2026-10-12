
export type RolUsuario =
  | 'residente'
  | 'mantenimiento'
  | 'administrador'
  | 'seguridad';

export interface Usuario {
  id: string;
  nombre: string;
  unidad: string;
  correo: string;
  rol: RolUsuario;
}
