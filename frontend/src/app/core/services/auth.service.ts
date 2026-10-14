
import { Injectable, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router'; 
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';

import { auth } from './firebase.config';
import { Usuario, RolUsuario } from '../../models/usuario.model';
import { PerfilApiService } from './perfil-api.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly perfilApi = inject(PerfilApiService);
  private readonly router = inject(Router); 
  private readonly _usuario = signal<Usuario | null>(null);

  private resolverInicializacion!: () => void;

  readonly inicializacion = new Promise<void>((resolve) => {
    this.resolverInicializacion = resolve;
  });

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly primerNombre = computed(
    () => this._usuario()?.nombre.split(' ')[0] ?? ''
  );

  constructor() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          this._usuario.set(null);
          return;
        }

        const token = await firebaseUser.getIdToken();
        const perfil = await firstValueFrom(
          this.perfilApi.obtenerPerfil(token)
        );

        this.establecerUsuario(perfil);
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
        this._usuario.set(null);

        if (auth.currentUser) {
          await signOut(auth).catch(() => {});
        }
      } finally {
        this.resolverInicializacion();
      }
    });
  }

  async ingresar(correo: string, clave: string): Promise<boolean> {
    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        clave
      );

      const token = await credencial.user.getIdToken();
      const perfil = await firstValueFrom(
        this.perfilApi.obtenerPerfil(token)
      );

      this.establecerUsuario(perfil);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      await signOut(auth).catch(() => {});
      this._usuario.set(null);
      return false;
    }
  }
  
async salir(): Promise<void> {
  await signOut(auth);
  this._usuario.set(null);
  await this.router.navigate(['/login']);
}

  private establecerUsuario(perfil: {
    id: number;
    uid: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: string;
  }): void {
    this._usuario.set({
      id: String(perfil.id),
      nombre: `${perfil.nombres} ${perfil.apellidos}`.trim(),
      unidad: '',
      correo: perfil.correo,
      rol: this.convertirRol(perfil.rol),
    });
  }

  private convertirRol(rol: string): RolUsuario {
    switch (rol) {
      case 'RESIDENTE':
        return 'residente';
      case 'MANTENIMIENTO':
        return 'mantenimiento';
      case 'ADMINISTRADOR':
        return 'administrador';
      case 'PORTERIA_SEGURIDAD':
        return 'seguridad';
      default:
        throw new Error(`Rol no reconocido: ${rol}`);
    }
  }




}
