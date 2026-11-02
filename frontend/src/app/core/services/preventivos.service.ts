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

export interface IntervencionPreventivaDto {
  tareaPreventivaId: number;
  ejecutorUsuarioId: number;
  accionesRealizadas: string;
  observaciones?: string;
  /** LocalDateTime selected by the technician, without timezone conversion. */
  ejecutadoEn: string;
}

@Injectable({ providedIn: 'root' })
export class PreventivosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl =
    'http://localhost:8085/promantenimiento/api/tarea-preventiva';
  private readonly apiIntervencionUrl =
    'http://localhost:8085/promantenimiento/api/intervencion-preventiva';

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
      this._tareas.update((lista) => {
        const existe = lista.some((item) => item.id === tarea.id);
        return existe
          ? lista.map((item) => (item.id === tarea.id ? tarea : item))
          : [...lista, tarea];
      });
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
      return [];
    }
  }

  /**
   * Registra solo los campos que acepta el POST actual del backend.
   * Los archivos seleccionados en la vista no se incluyen porque el endpoint
   * actual recibe JSON y no define una carga multipart ni persistencia asociada.
   */
  async registrarIntervencion(
    datos: IntervencionPreventivaDto
  ): Promise<IntervencionPreventivaApi> {
    const usuario = await this.esperarUsuario();
    if (!usuario) throw new Error('No hay sesión activa.');

    const perfil = this.authService.usuario();
    if (!perfil) throw new Error('No se pudo identificar el perfil del técnico.');

    const token = await usuario.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const payload = {
      tareaPreventiva: { id: datos.tareaPreventivaId },
      ejecutorUsuario: { id: Number(perfil.id) },
      accionesRealizadas: datos.accionesRealizadas.trim(),
      observaciones: datos.observaciones?.trim() || null,
      ejecutadoEn: datos.ejecutadoEn,
      // Campo de auditoría exigido por la entidad; no reemplaza ejecutadoEn.
      creadoEn: this.formatearFechaHoraLocal(new Date()),
    };

    return firstValueFrom(
      this.http.post<IntervencionPreventivaApi>(this.apiIntervencionUrl, payload, {
        headers,
      })
    );
  }

  private formatearFechaHoraLocal(fecha: Date): string {
    const pad = (valor: number) => String(valor).padStart(2, '0');
    return [
      `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`,
      `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`,
    ].join('T');
  }

  private mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor para consultar las tareas.';
      }
      if (error.status === 401) {
        return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';
      }
      if (error.status === 403) {
        return 'No tienes permiso para consultar las tareas preventivas.';
      }
    }
    return 'No se pudieron cargar las tareas preventivas.';
  }
}
