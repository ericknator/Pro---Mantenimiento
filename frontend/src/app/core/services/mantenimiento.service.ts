import { Injectable, inject, signal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from './firebase.config';
import { Activo, ActivoApi } from '../../models/activo.model';
import {
  FrecuenciaMantenimientoApi,
  MantenimientoPreventivo,
  PlanMantenimientoApi,
  PlanMantenimientoPayload,
  RolApi,
  UsuarioResponsableApi,
} from '../../models/mantenimiento.model';
import { TareaPreventivaApi } from '../../models/tarea-preventiva.model';

interface PlanMantenimientoRequestBody {
  activo: { id: number };
  frecuencia: { id: number };
  responsable: { id: number };
  titulo: string;
  descripcion?: string;
  primeraTareaProgramadaPara: string;
}

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = 'http://localhost:8086/promantenimiento/api';
  private readonly activosUrl = `${this.apiBaseUrl}/activo`;
  private readonly frecuenciasUrl = `${this.apiBaseUrl}/frecuencia-mantenimiento`;
  private readonly rolesUrl = `${this.apiBaseUrl}/rol`;
  private readonly responsablesUrl = `${this.apiBaseUrl}/usuario-perfil/responsables/rol`;
  private readonly planesUrl = `${this.apiBaseUrl}/plan-mantenimiento`;
  private readonly tareasUrl = `${this.apiBaseUrl}/tarea-preventiva`;

  readonly mantenimientos = signal<MantenimientoPreventivo[]>([]);
  readonly activos = signal<Activo[]>([]);
  readonly frecuencias = signal<FrecuenciaMantenimientoApi[]>([]);
  readonly responsables = signal<UsuarioResponsableApi[]>([]);
  readonly cargando = signal(false);
  readonly cargandoCatalogos = signal(false);
  readonly error = signal<string | null>(null);
  readonly catalogosError = signal<string | null>(null);

  private async esperarUsuario(): Promise<User> {
    if (auth.currentUser) {
      return auth.currentUser;
    }

    const usuario = await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (usuarioActual) => {
        unsubscribe();
        resolve(usuarioActual);
      });
    });

    if (!usuario) {
      throw new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Debes iniciar sesión para gestionar mantenimientos.' },
      });
    }

    return usuario;
  }

  private async obtenerHeaders(): Promise<HttpHeaders> {
    const usuario = await this.esperarUsuario();
    const token = await usuario.getIdToken();

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /** Carga los catálogos que el contrato de POST /plan-mantenimiento requiere. */
  async cargarCatalogos(): Promise<void> {
    this.cargandoCatalogos.set(true);
    this.catalogosError.set(null);

    try {
      const headers = await this.obtenerHeaders();
      const [activos, frecuencias, roles] = await Promise.all([
        firstValueFrom(this.http.get<ActivoApi[]>(this.activosUrl, { headers })),
        firstValueFrom(
          this.http.get<FrecuenciaMantenimientoApi[]>(this.frecuenciasUrl, {
            headers,
          })
        ),
        firstValueFrom(this.http.get<RolApi[]>(this.rolesUrl, { headers })),
      ]);

      const rolMantenimiento = roles.find(
        (rol) => rol.codigo === 'MANTENIMIENTO' && rol.activo
      );

      if (!rolMantenimiento) {
        throw new Error('No se encontró un rol activo de mantenimiento.');
      }

      const responsables = await firstValueFrom(
        this.http.get<UsuarioResponsableApi[]>(
          `${this.responsablesUrl}/${rolMantenimiento.id}`,
          { headers }
        )
      );

      this.activos.set(
        activos
          .filter((activo) => activo.activo !== false)
          .map((activo) => this.mapearActivo(activo))
      );
      this.frecuencias.set(frecuencias.filter((frecuencia) => frecuencia.activo));
      this.responsables.set(
        responsables.filter((responsable) => responsable.activo !== false)
      );
    } catch (error: unknown) {
      console.error('Error al cargar catálogos de mantenimiento:', error);
      this.activos.set([]);
      this.frecuencias.set([]);
      this.responsables.set([]);
      this.catalogosError.set(
        this.obtenerMensajeError(
          error,
          'No se pudieron cargar activos, frecuencias y responsables.'
        )
      );
    } finally {
      this.cargandoCatalogos.set(false);
    }
  }

  /** GET: lista la primera tarea creada y las tareas preventivas disponibles. */
  async cargarMantenimientos(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const headers = await this.obtenerHeaders();
      const respuesta = await firstValueFrom(
        this.http.get<TareaPreventivaApi[]>(this.tareasUrl, { headers })
      );

      this.mantenimientos.set(
        (respuesta ?? []).map((tarea) => this.mapearMantenimiento(tarea))
      );
    } catch (error: unknown) {
      console.error('Error al cargar tareas preventivas:', error);
      this.mantenimientos.set([]);
      this.error.set(
        this.obtenerMensajeError(
          error,
          'No se pudieron cargar las tareas preventivas.'
        )
      );
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * POST real de un plan recurrente. El backend crea el plan y su primera
   * tarea dentro de la misma transacción; el frontend no crea una tarea aparte.
   */
  async programarMantenimiento(
    datos: PlanMantenimientoPayload
  ): Promise<PlanMantenimientoApi> {
    const titulo = datos.titulo.trim();
    const descripcion = datos.descripcion?.trim();

    if (datos.activoId <= 0 || datos.frecuenciaId <= 0 || datos.responsableId <= 0) {
      throw new Error('Selecciona un activo, una frecuencia y un responsable válidos.');
    }

    if (!titulo) {
      throw new Error('Ingresa el título del mantenimiento.');
    }

    if (!datos.primeraTareaProgramadaPara) {
      throw new Error('Indica la fecha y hora de la primera tarea.');
    }

    const payload: PlanMantenimientoRequestBody = {
      activo: { id: datos.activoId },
      frecuencia: { id: datos.frecuenciaId },
      responsable: { id: datos.responsableId },
      titulo,
      primeraTareaProgramadaPara: datos.primeraTareaProgramadaPara,
    };

    if (descripcion) {
      payload.descripcion = descripcion;
    }

    try {
      const headers = await this.obtenerHeaders();
      const respuesta = await firstValueFrom(
        this.http.post<PlanMantenimientoApi>(this.planesUrl, payload, {
          headers,
        })
      );

      await this.cargarMantenimientos();
      return respuesta;
    } catch (error: unknown) {
      this.error.set(
        this.obtenerMensajeError(
          error,
          'No se pudo programar el mantenimiento preventivo.'
        )
      );
      throw error;
    }
  }

  private mapearActivo(item: ActivoApi): Activo {
    return {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      tipo: item.tipoActivo?.nombre ?? 'Sin tipo',
      tipoActivoId: item.tipoActivo?.id,
      ubicacion: item.ubicacion,
      descripcion: item.descripcion ?? undefined,
      marca: item.marca ?? undefined,
      modelo: item.modelo ?? undefined,
      numeroSerie: item.numeroSerie ?? undefined,
      fechaInstalacion: item.fechaInstalacion ?? undefined,
      esCritico: item.esCritico ?? undefined,
      estado: item.estadoActivo?.codigo ?? item.estadoActivo?.nombre ?? 'OPERATIVO',
      activo: item.activo ?? undefined,
      creadoEn: item.creadoEn ?? undefined,
      actualizadoEn: item.actualizadoEn ?? undefined,
    };
  }

  private mapearMantenimiento(tarea: TareaPreventivaApi): MantenimientoPreventivo {
    const activoId = tarea.activo?.id ?? 0;
    const codigo = tarea.activo?.codigo ?? '';
    const nombre = tarea.activo?.nombre ?? `Activo #${activoId}`;
    const responsable = tarea.responsable;

    return {
      id: tarea.id,
      activoId,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion ?? undefined,
      nombreActivo: codigo ? `${codigo} - ${nombre}` : nombre,
      frecuenciaNombre: tarea.planMantenimiento?.frecuencia?.nombre ?? undefined,
      responsableNombre: responsable
        ? `${responsable.nombres} ${responsable.apellidos}`.trim()
        : undefined,
      fechaProgramada: tarea.programadaPara,
      estado: tarea.estado?.nombre ?? 'Programada',
    };
  }

  private obtenerMensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifica que el backend esté disponible.';
      }

      if (error.status === 401) {
        return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';
      }

      if (error.status === 403) {
        return 'No tienes permiso para gestionar mantenimientos preventivos.';
      }

      const mensaje = this.extraerMensaje(error.error);
      if (mensaje) {
        return mensaje;
      }
    }

    return error instanceof Error && error.message ? error.message : fallback;
  }

  private extraerMensaje(error: unknown): string | null {
    if (typeof error === 'string' && error.trim()) {
      return error.trim();
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
      const mensaje = (error as { message?: unknown }).message;
      return typeof mensaje === 'string' && mensaje.trim()
        ? mensaje.trim()
        : null;
    }

    return null;
  }
}
