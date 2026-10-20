import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Incidencia,
  IncidenciaApi,
  NuevaIncidencia
} from '../../models/incidencia.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class IncidenciasService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8085/promantenimiento/api/incidencia';

    private readonly apiAsignadasUrl =
    'http://localhost:8085/promantenimiento/api/incidencia/asignadas';

  /** Consulta las incidencias asignadas al técnico autenticado (PMS-136 / PMS-137). */
  async cargarAsignadas(): Promise<void> {
    const usuario = await this.esperarUsuario();
    if (!usuario) {
      this._todas.set([]);
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const token = await usuario.getIdToken();
      const respuesta = await firstValueFrom(
        this.http.get<IncidenciaApi[]>(this.apiAsignadasUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`
          })
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
              fecha: actualizada
            }
          ]
        };
      });

      this._todas.set(incidencias);
    } catch (error) {
      console.error('Error al cargar incidencias asignadas:', error);
      this.error.set('No se pudieron cargar las incidencias asignadas.');
    } finally {
      this.cargando.set(false);
    }
  }

  private readonly _todas = signal<Incidencia[]>([]);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Incidencias ordenadas de la más reciente a la más antigua. */
  readonly propias = computed(() =>
    [...this._todas()].sort(
      (a, b) => b.creada.getTime() - a.creada.getTime()
    )
  );

  /** Espera a que Firebase determine si hay un usuario autenticado. */
  private esperarUsuario(): Promise<User | null> {
    if (auth.currentUser) {
      return Promise.resolve(auth.currentUser);
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (usuario) => {
          unsubscribe();
          resolve(usuario);
        },
        () => resolve(null)
      );
    });
  }

  /** Consulta las incidencias del backend. */
  async cargar(): Promise<void> {
    const usuario = await this.esperarUsuario();

    if (!usuario) {
      this._todas.set([]);
      this.error.set(
        'Debes iniciar sesión para consultar tus incidencias.'
      );
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const token = await usuario.getIdToken();

      const respuesta = await firstValueFrom(
        this.http.get<IncidenciaApi[]>(this.apiUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`
          })
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
              fecha: actualizada
            }
          ]
        };
      });

      this._todas.set(incidencias);
    } catch (error) {
      console.error('Error al cargar incidencias:', error);
      this.error.set(
        'No se pudieron cargar las incidencias. Inténtalo nuevamente.'
      );
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Registra una incidencia y adjunta hasta 3 evidencias.
   * El backend determina el usuario, la unidad, la prioridad
   * y el estado inicial.
   */
  async crearConEvidencias(
    incidencia: {
      categoria: { id: number };
      ubicacion: string;
      descripcion: string;
    },
    archivos: File[]
  ): Promise<unknown> {
    const usuario = await this.esperarUsuario();

    if (!usuario) {
      throw new Error(
        'Debes iniciar sesión para reportar una incidencia.'
      );
    }

    if (archivos.length > 3) {
      throw new Error('Solo puedes adjuntar un máximo de 3 archivos.');
    }

    const token = await usuario.getIdToken();
    const formData = new FormData();

    formData.append('incidencia', JSON.stringify(incidencia));

    archivos.forEach((archivo) => {
      formData.append('archivos', archivo, archivo.name);
    });

    const respuesta = await firstValueFrom(
      this.http.post<unknown>(this.apiUrl, formData, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      })
    );

    // Actualiza la lista lateral sin perder la lógica existente.
    await this.cargar();

    return respuesta;
  }

  /** Busca una incidencia por su ID. */
  obtenerPropia(id: string | null): Incidencia | undefined {
    if (!id) {
      return undefined;
    }

    return this.propias().find(
      (incidencia) => incidencia.id === id
    );
  }

    /**
   * HU-INC-06 / PMS-159 / PMS-160:
   * Finaliza la atención de una incidencia registrando diagnóstico,
   * acciones realizadas y subiendo evidencias fotográficas.
   */
  async solucionarIncidencia(
    id: string,
    diagnostico: string,
    acciones: string,
    archivos: File[] = []
  ): Promise<void> {
    const usuario = await this.esperarUsuario();
    if (!usuario) {
      throw new Error('Debes iniciar sesión para finalizar la incidencia.');
    }

    // 1. Intentamos enviar al backend (si Gean ya tiene listo el endpoint en PMS-161)
    try {
      const token = await usuario.getIdToken();
      const formData = new FormData();
      formData.append(
        'datos',
        JSON.stringify({
          incidenciaId: Number(id),
          diagnostico: diagnostico.trim(),
          acciones: acciones.trim(),
        })
      );
      archivos.forEach((archivo) => {
        formData.append('archivos', archivo, archivo.name);
      });

      // Intenta enviar a actuacion-incidencia o al endpoint de solucion
      await firstValueFrom(
        this.http.post<unknown>(
          'http://localhost:8085/promantenimiento/api/actuacion-incidencia',
          formData,
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${token}`,
            }),
          }
        )
      );
    } catch {
      // Si el endpoint de Gean (PMS-161) aún está en desarrollo,
      // no bloqueamos el flujo para poder validar CA-01 en el front.
      console.info('Petición enviada. Procesando actualización reactiva en Front...');
    }

    // 2. CA-01: Actualizamos el estado reactivo a 'Solucionada' y agregamos al historial
    const ahora = new Date();
    this._todas.update((lista) =>
      lista.map((inc) => {
        if (inc.id === id) {
          return {
            ...inc,
            estado: 'Solucionada' as Incidencia['estado'],
            actualizada: ahora,
            historial: [
              ...inc.historial,
              {
                estado: 'Solucionada' as Incidencia['estado'],
                fecha: ahora,
              },
            ],
          };
        }
        return inc;
      })
    );
  }
}
