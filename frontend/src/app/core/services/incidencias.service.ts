import { Injectable, computed, inject, signal } from '@angular/core';
import { Incidencia, IncidenciaApi, NuevaIncidencia } from '../../models/incidencia.model';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class IncidenciasService {
  private esperarUsuario(): Promise<User | null> {
    if (auth.currentUser) {
      return Promise.resolve(auth.currentUser);
    }

    return new Promise((resolve) => {
      let unsubscribe: () => void = () => {};

      unsubscribe = onAuthStateChanged(auth, (usuario) => {
        unsubscribe();
        resolve(usuario);
      });
    });
  }

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8085/promantenimiento/api/incidencia';

  private readonly _todas = signal<Incidencia[]>([]);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Incidencias devueltas por el backend, de la más reciente a la más antigua. */
  readonly propias = computed(() =>
    [...this._todas()].sort(
      (a, b) => b.creada.getTime() - a.creada.getTime()
    )
  );

  /** Consulta las incidencias del usuario autenticado. */
  async cargar(): Promise<void> {
    console.log('[IncidenciasService] Se llamó a cargar()');

    const usuario = auth.currentUser;

    console.log('[IncidenciasService] Usuario Firebase:', usuario);

    // const usuario = await this.esperarUsuario();

    if (!usuario) {
      this._todas.set([]);
      this.error.set('Debes iniciar sesión para consultar tus incidencias.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const token = await usuario.getIdToken();

      const respuesta = await firstValueFrom(
        this.http.get<IncidenciaApi[]>(this.apiUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        })
      );

      const incidencias: Incidencia[] = respuesta.map((item) => {
        const fecha = new Date(item.fechaReporte);
        const actualizada = new Date(item.actualizadoEn);

        return {
          id: String(item.id),
          autorId: String(item.solicitante.id),
          autor: `${item.solicitante.nombres} ${item.solicitante.apellidos}`,
          categoria: item.categoria.nombre,
          ubicacion: item.ubicacion,
          descripcion: item.descripcion,
          evidencias: [],
          estado: item.estado.nombre as Incidencia['estado'],
          creada: fecha,
          actualizada,
          historial: [
            {
              estado: item.estado.nombre as Incidencia['estado'],
              fecha: actualizada,
            },
          ],
        };
      });

      this._todas.set(incidencias);
    } catch (error) {
      console.error('Error al cargar incidencias:', error);
      this.error.set('No se pudieron cargar las incidencias. Inténtalo nuevamente.');
    } finally {
      this.cargando.set(false);
    }
  }

  obtenerPropia(id: string | null): Incidencia | undefined {
    if (!id) {
      return undefined;
    }

    return this.propias().find((incidencia) => incidencia.id === id);
  }


}
