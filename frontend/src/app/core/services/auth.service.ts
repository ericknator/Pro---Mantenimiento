import { Injectable, computed, signal } from '@angular/core';
import { Usuario } from '../../models/usuario.model';

const CLAVE_SESION = 'pm_sesion_demo';

// DEMO: usuario ficticio. Se reemplaza por Firebase Authentication
// (el backend de Spring Boot valida el token y aplica permisos por rol).
const USUARIO_DEMO: Usuario = {
  id: 'u-1',
  nombre: 'María Torres',
  unidad: 'Dpto. 402',
  correo: 'maria.torres@correo.com',
  rol: 'residente',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _usuario = signal<Usuario | null>(this.recuperar());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly primerNombre = computed(() => this._usuario()?.nombre.split(' ')[0] ?? '');

  /** DEMO: acepta un correo con formato válido y una contraseña de 6 o más caracteres. */
  ingresar(correo: string, clave: string): boolean {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
    if (!correoValido || clave.length < 6) return false;
    this._usuario.set({ ...USUARIO_DEMO, correo: correo.trim() });
    try {
      sessionStorage.setItem(CLAVE_SESION, '1');
    } catch {
      /* sin almacenamiento disponible */
    }
    return true;
  }

  salir(): void {
    this._usuario.set(null);
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      /* sin almacenamiento disponible */
    }
  }

  private recuperar(): Usuario | null {
    try {
      return sessionStorage.getItem(CLAVE_SESION) ? USUARIO_DEMO : null;
    } catch {
      return null;
    }
  }
}
