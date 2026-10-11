export type RolUsuario = 'residente';

export interface Usuario {
  id: string;
  nombre: string;
  unidad: string;
  correo: string;
  rol: RolUsuario;
}
