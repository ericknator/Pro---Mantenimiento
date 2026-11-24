import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { CategoriaIncidencia } from '../../models/categoria-incidencia.model';

@Injectable({ providedIn: 'root' })
export class CategoriaIncidenciaService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8086/promantenimiento/api/categoria-incidencia';

  readonly categorias = signal<CategoriaIncidencia[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  private async esperarUsuario(): Promise<User | null> {
    if (auth.currentUser) {
      return auth.currentUser;
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (usuario) => {
        unsubscribe();
        resolve(usuario);
      });
    });
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const usuario = await this.esperarUsuario();

      if (!usuario) {
        throw new Error('Debes iniciar sesión para consultar las categorías.');
      }

      const token = await usuario.getIdToken();

      const respuesta = await firstValueFrom(
        this.http.get<CategoriaIncidencia[]>(this.apiUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        })
      );

      this.categorias.set(
        respuesta.filter((categoria) => categoria.activo)
      );
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      this.error.set('No se pudieron cargar las categorías.');
    } finally {
      this.cargando.set(false);
    }
  }
}
