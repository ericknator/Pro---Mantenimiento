import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../../models/usuario.model';


export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.inicializacion;

  return auth.autenticado()
    ? true
    : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.inicializacion;

  return auth.autenticado()
    ? router.createUrlTree(['/inicio'])
    : true;
};

export const roleGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.inicializacion;

  if (!auth.autenticado()) {
    return router.createUrlTree(['/login']);
  }

  const usuario = auth.usuario();

  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos = route.data['roles'] as RolUsuario[] | undefined;

  if (rolesPermitidos?.includes(usuario.rol)) {
    return true;
  }

  const rutasPorRol: Record<RolUsuario, string> = {
    residente: '/inicio',
    administrador: '/administrador/inicio',
    mantenimiento: '/mantenimiento/inicio',
    seguridad: '/seguridad/inicio',
  };

  return router.createUrlTree([
    rutasPorRol[usuario.rol],
  ]);
};

