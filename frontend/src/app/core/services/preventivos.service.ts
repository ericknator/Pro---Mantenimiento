import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import {
  IntervencionPreventivaApi,
  TareaPreventiva,
  TareaPreventivaApi,
} from '../../models/tarea-preventiva.model';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { API_BASE_URL } from '../config/api.config';

export interface IntervencionPreventivaDto {
  tareaPreventivaId: number;
  accionesRealizadas: string;
  observaciones?: string;
  /** LocalDateTime selected by the technician, without timezone conversion. */
  fechaEjecucion: string;
}

const ARCHIVOS_EVIDENCIA_PERMITIDOS = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
]);
const TAMANO_MAXIMO_EVIDENCIA = 20 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class PreventivosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = `${API_BASE_URL}/tarea-preventiva`;
  private readonly apiIntervencionUrl = `${API_BASE_URL}/intervencion-preventiva`;

  private readonly _tareas = signal<TareaPreventiva[]>([]);
  readonly tareas = this._tareas.asReadonly();
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  // Tareas asignadas al técnico autenticado (HU-MAN-04-CA-01)
  readonly asignadas = computed(() => {
    const perfilId = this.authService.usuario()?.id;
    if (!perfilId) return [];
    return this._tareas().filter((t) => t.responsableId === perfilId);
  });

  constructor() {
    onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        void this.cargarTareas();
      } else {
        this._tareas.set([]);
      }
    });
  }

  private async esperarUsuario(): Promise<User | null> {
    if (auth.currentUser) return auth.currentUser;
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (usuario) => {
        unsubscribe();
        resolve(usuario);
      });
    });
  }

  private mapearTarea(t: TareaPreventivaApi): TareaPreventiva {
    return {
      id: String(t.id),
      titulo: t.titulo,
      descripcion: t.descripcion ?? '',
      fechaProgramada: new Date(t.programadaPara),
      activoId: String(t.activo?.id ?? ''),
      activoCodigo: t.activo?.codigo ?? '',
      activoNombre: t.activo?.nombre ?? 'Activo no especificado',
      ubicacion: t.activo?.ubicacion ?? 'Ubicación central',
      responsableId: t.responsable ? String(t.responsable.id) : undefined,
      responsableNombre: t.responsable
        ? `${t.responsable.nombres} ${t.responsable.apellidos}`.trim()
        : 'Sin asignar',
      frecuenciaCodigo: t.planMantenimiento?.frecuencia?.codigo ?? undefined,
      frecuenciaNombre: t.planMantenimiento?.frecuencia?.nombre ?? undefined,
      estado: (t.estado?.nombre as TareaPreventiva['estado']) ?? 'Programada',
      estadoCodigo: t.estado?.codigo ?? 'PROGRAMADA',
    };
  }

  private actualizarTarea(tarea: TareaPreventiva): void {
    this._tareas.update((lista) => {
      const existe = lista.some((item) => item.id === tarea.id);
      return existe
        ? lista.map((item) => (item.id === tarea.id ? tarea : item))
        : [...lista, tarea];
    });
  }

  async cargarTareas(): Promise<void> {
    this.error.set(null);
    const usuario = await this.esperarUsuario();
    if (!usuario) {
      this._tareas.set([]);
      this.error.set('Debes iniciar sesión para consultar tus tareas preventivas.');
      return;
    }

    this.cargando.set(true);
    try {
      const token = await usuario.getIdToken();
      const respuesta = await firstValueFrom(
        this.http.get<TareaPreventivaApi[]>(this.apiUrl, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
      );

      this._tareas.set((respuesta ?? []).map((t) => this.mapearTarea(t)));
    } catch (error) {
      console.error('Error al cargar tareas preventivas:', error);
      this._tareas.set([]);
      this.error.set(this.mensajeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  obtenerPorId(id: string): TareaPreventiva | undefined {
    return this._tareas().find((t) => t.id === id);
  }

  async consultarDetalleBackend(id: string): Promise<TareaPreventiva | null> {
    const usuario = await this.esperarUsuario();
    if (!usuario) return null;

    try {
      const token = await usuario.getIdToken();
      const t = await firstValueFrom(
        this.http.get<TareaPreventivaApi>(`${this.apiUrl}/${encodeURIComponent(id)}`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
      );
      if (!t) return null;

      const tarea = this.mapearTarea(t);
      this.actualizarTarea(tarea);
      return tarea;
    } catch (error) {
      this.error.set(this.mensajeError(error));
      return null;
    }
  }

  /**
   * Consulta las intervenciones que el contrato actual expone.
   * El componente filtra por la tarea solicitada; no se inventan registros.
   */
  async obtenerHistorialIntervenciones(): Promise<IntervencionPreventivaApi[]> {
    const usuario = await this.esperarUsuario();
    if (!usuario) return [];

    try {
      const token = await usuario.getIdToken();
      const respuesta = await firstValueFrom(
        this.http.get<IntervencionPreventivaApi[]>(this.apiIntervencionUrl, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
      );
      return respuesta ?? [];
    } catch (error) {
      console.error('Error al cargar las intervenciones preventivas:', error);
      throw error;
    }
  }

  /**
   * Inicia la atención en el backend. El servidor valida el rol, la asignación
   * y la transición PROGRAMADA -> EN_EJECUCION.
   */
  async iniciarAtencion(id: string): Promise<TareaPreventiva> {
    const usuario = await this.esperarUsuario();
    if (!usuario) throw new Error('No hay sesión activa.');

    const token = await usuario.getIdToken();
    const respuesta = await firstValueFrom(
      this.http.patch<TareaPreventivaApi>(
        `${this.apiUrl}/${encodeURIComponent(id)}/iniciar-atencion`,
        null,
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      )
    );

    const tarea = this.mapearTarea(respuesta);
    this.actualizarTarea(tarea);
    return tarea;
  }

  /**
   * Registra la intervención con el contrato multipart del backend.
   * No se define Content-Type manualmente: el navegador agrega el boundary.
   */
  async registrarIntervencion(
    datos: IntervencionPreventivaDto,
    archivos: File[] = []
  ): Promise<IntervencionPreventivaApi> {
    const usuario = await this.esperarUsuario();
    if (!usuario) throw new Error('No hay sesión activa.');

    if (archivos.length > 3) {
      throw new Error('Solo puedes adjuntar un máximo de 3 archivos de evidencia.');
    }

    const archivoNoPermitido = archivos.find(
      (archivo) =>
        !ARCHIVOS_EVIDENCIA_PERMITIDOS.has(archivo.type) ||
        archivo.size > TAMANO_MAXIMO_EVIDENCIA
    );
    if (archivoNoPermitido) {
      throw new Error(
        'Solo se permiten archivos JPG, PNG, WEBP, MP4 o WEBM de hasta 20 MB para las evidencias.'
      );
    }

    const token = await usuario.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const formulario = new FormData();
    formulario.append('fechaEjecucion', datos.fechaEjecucion);
    formulario.append('accionesRealizadas', datos.accionesRealizadas.trim());

    const observaciones = datos.observaciones?.trim();
    if (observaciones) formulario.append('observaciones', observaciones);

    archivos.forEach((archivo) => {
      formulario.append('archivos', archivo, archivo.name);
    });

    return firstValueFrom(
      this.http.post<IntervencionPreventivaApi>(
        `${this.apiUrl}/${encodeURIComponent(datos.tareaPreventivaId)}/registrar-intervencion`,
        formulario,
        {
          headers,
        }
      )
    );
  }

  mensajeError(
    error: unknown,
    fallback = 'No se pudo completar la operación.'
  ): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (typeof body === 'string' && body.trim()) return body.trim();
      if (body && typeof body === 'object' && typeof body.message === 'string') {
        return body.message;
      }

      if (error.status === 0) return 'No se pudo conectar con el servidor.';
      if (error.status === 401) return 'Tu sesión no es válida o ha expirado.';
      if (error.status === 403) return 'No tienes permiso para realizar esta operación.';
      if (error.status === 409) return 'La tarea cambió de estado. Actualiza la ficha e inténtalo nuevamente.';
      if (error.status === 413) return 'El archivo o la solicitud supera el tamaño permitido por el servidor.';
      if (error.status === 415) return 'El servidor rechazó el formato de la evidencia.';
    }

    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
  }

}
