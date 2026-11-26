import { Injectable, inject, signal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from './firebase.config';
import {
  Activo,
  ActivoApi,
  NuevoActivoDto,
  NuevoActivoPayload,
  TipoActivo
} from '../../models/activo.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ActivoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/activo`;
  private readonly tiposActivoUrl = `${API_BASE_URL}/tipo-activo`;

  readonly activos = signal<Activo[]>([]);
  readonly tiposActivo = signal<TipoActivo[]>([]);
  readonly cargando = signal(false);
  readonly cargandoTiposActivo = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorTiposActivo = signal<string | null>(null);

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
      throw new Error('Debes iniciar sesión para consultar los activos.');
    }

    return usuario;
  }

  private async obtenerHeaders(): Promise<HttpHeaders> {
    const usuario = await this.esperarUsuario();
    const token = await usuario.getIdToken();

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  /** GET: carga el catálogo real de tipos de activo. */
  async cargarTiposActivo(): Promise<void> {
    this.cargandoTiposActivo.set(true);
    this.errorTiposActivo.set(null);

    try {
      const headers = await this.obtenerHeaders();
      const respuesta = await firstValueFrom(
        this.http.get<TipoActivo[]>(this.tiposActivoUrl, { headers })
      );

      this.tiposActivo.set(
        respuesta.filter((tipo) => tipo.activo === true)
      );
    } catch (error: unknown) {
      console.error('Error al cargar tipos de activo:', error);
      this.tiposActivo.set([]);
      this.errorTiposActivo.set(
        this.obtenerMensajeError(
          error,
          'No se pudieron cargar los tipos de activo.'
        )
      );
    } finally {
      this.cargandoTiposActivo.set(false);
    }
  }

  /** GET: lista los activos reales guardados en MySQL. */
  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const headers = await this.obtenerHeaders();
      const respuesta = await firstValueFrom(
        this.http.get<ActivoApi[]>(this.apiUrl, { headers })
      );

      this.activos.set(respuesta.map((item) => this.mapearActivo(item)));
    } catch (error: unknown) {
      console.error('Error al cargar activos:', error);
      this.error.set(
        this.obtenerMensajeError(error, 'No se pudieron cargar los activos.')
      );
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * POST: envía únicamente los campos permitidos por ActivoEntity.
   * El backend genera código, estado, activo y fechas de auditoría.
   */
  async registrar(datos: NuevoActivoDto): Promise<Activo> {
    if (!Number.isInteger(datos.tipoActivoId) || datos.tipoActivoId <= 0) {
      throw new Error('Selecciona un tipo de activo válido.');
    }

    const headers = await this.obtenerHeaders();
    const payload: NuevoActivoPayload = {
      nombre: datos.nombre.trim(),
      ubicacion: datos.ubicacion.trim(),
      tipoActivo: { id: datos.tipoActivoId },
      esCritico: datos.esCritico
    };

    this.agregarTextoOpcional(payload, 'descripcion', datos.descripcion);
    this.agregarTextoOpcional(payload, 'marca', datos.marca);
    this.agregarTextoOpcional(payload, 'modelo', datos.modelo);
    this.agregarTextoOpcional(payload, 'numeroSerie', datos.numeroSerie);

    if (datos.fechaInstalacion) {
      payload.fechaInstalacion = datos.fechaInstalacion;
    }

    const respuesta = await firstValueFrom(
      this.http.post<ActivoApi>(this.apiUrl, payload, { headers })
    );

    await this.cargar();
    return this.mapearActivo(respuesta);
  }

  private agregarTextoOpcional(
    payload: NuevoActivoPayload,
    campo: 'descripcion' | 'marca' | 'modelo' | 'numeroSerie',
    valor?: string
  ): void {
    const valorLimpio = valor?.trim();

    if (valorLimpio) {
      payload[campo] = valorLimpio;
    }
  }

  private mapearActivo(item: ActivoApi): Activo {
    return {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      tipo: item.tipoActivo?.nombre || 'Sin tipo',
      tipoActivoId: item.tipoActivo?.id,
      ubicacion: item.ubicacion,
      descripcion: item.descripcion ?? undefined,
      marca: item.marca ?? undefined,
      modelo: item.modelo ?? undefined,
      numeroSerie: item.numeroSerie ?? undefined,
      fechaInstalacion: item.fechaInstalacion ?? undefined,
      esCritico: item.esCritico ?? undefined,
      estado: item.estadoActivo?.codigo || item.estadoActivo?.nombre || 'OPERATIVO',
      activo: item.activo ?? undefined,
      creadoEn: item.creadoEn ?? undefined,
      actualizadoEn: item.actualizadoEn ?? undefined
    };
  }

  private obtenerMensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'Tu sesión ha vencido o no tienes permiso para consultar esta información.';
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifica que el backend esté disponible.';
      }

      const cuerpo = error.error as
        | { message?: unknown; error?: unknown; detail?: unknown }
        | string
        | null
        | undefined;
      const detalle = typeof cuerpo === 'string'
        ? cuerpo
        : [cuerpo?.message, cuerpo?.error, cuerpo?.detail]
            .filter((valor): valor is string => typeof valor === 'string')
            .join(' ');

      return detalle.trim() || fallback;
    }

    return error instanceof Error && error.message
      ? error.message
      : fallback;
  }
}
