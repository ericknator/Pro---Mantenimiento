import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { TareaPreventiva, TareaPreventivaApi } from '../../models/tarea-preventiva.model';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';

export interface IntervencionPreventivaDto {
  id?: number;
  tareaPreventivaId: number;
  ejecutorUsuarioId: number;
  accionesRealizadas: string;
  observaciones?: string;
  ejecutadoEn: string;
  evidencias?: string[];
}

@Injectable({ providedIn: 'root' })
export class PreventivosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = 'http://localhost:8085/promantenimiento/api/tarea-preventiva';
  private readonly apiIntervencionUrl = 'http://localhost:8085/promantenimiento/api/intervencion-preventiva';

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

      const mapeadas: TareaPreventiva[] = (respuesta ?? []).map((t) => ({
        id: String(t.id),
        titulo: t.titulo,
        descripcion: t.descripcion ?? '',
        fechaProgramada: new Date(t.programadaPara),
        activoId: String(t.activo?.id ?? ''),
        activoCodigo: t.activo?.codigo ?? '',
        activoNombre: t.activo?.nombre ?? 'Activo no especificado',
        ubicacion: t.activo?.ubicacion ?? 'Ubicación central',
        responsableId: t.responsable ? String(t.responsable.id) : undefined,
        responsableNombre: t.responsable ? `${t.responsable.nombres} ${t.responsable.apellidos}`.trim() : 'Sin asignar',
        estado: (t.estado?.nombre as any) ?? 'Programada',
        estadoCodigo: t.estado?.codigo ?? 'PROGRAMADA',
      }));

      this._tareas.set(mapeadas);
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
        this.http.get<TareaPreventivaApi>(`${this.apiUrl}/${id}`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
      );
      if (!t) return null;

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
        responsableNombre: t.responsable ? `${t.responsable.nombres} ${t.responsable.apellidos}`.trim() : 'Sin asignar',
        estado: (t.estado?.nombre as any) ?? 'Programada',
        estadoCodigo: t.estado?.codigo ?? 'PROGRAMADA',
      };
    } catch (error) {
      this.error.set(this.mensajeError(error));
      return null;
    }
  }

  /**
   * HU-MAN-05: Consulta el historial de intervenciones realizadas a tareas preventivas
   */
  async obtenerHistorialIntervenciones(): Promise<any[]> {
    const usuario = await this.esperarUsuario();
    if (!usuario) return [];

    try {
      const token = await usuario.getIdToken();
      const respuesta = await firstValueFrom(
        this.http.get<any[]>(this.apiIntervencionUrl, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
      );
      return respuesta ?? [];
    } catch {
      return [];
    }
  }

  /**
   * HU-MAN-05: Registra la intervención técnica ejecutada y finaliza el mantenimiento preventivo
   */
  async registrarIntervencion(datos: {
    tareaId: string;
    accionesRealizadas: string;
    observaciones: string;
    ejecutadoEn: string;
    archivos: File[];
  }): Promise<boolean> {
    const usuario = await this.esperarUsuario();
    if (!usuario) throw new Error('No hay sesión activa.');

    const perfil = this.authService.usuario();
    if (!perfil) throw new Error('No se pudo identificar el perfil del técnico.');

    const token = await usuario.getIdToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const payload = {
      tareaPreventiva: { id: Number(datos.tareaId) },
      ejecutorUsuario: { id: Number(perfil.id) },
      accionesRealizadas: datos.accionesRealizadas.trim(),
      observaciones: datos.observaciones.trim() || null,
      ejecutadoEn: datos.ejecutadoEn,
      creadoEn: new Date().toISOString(),
    };

    // 1. Guardamos la intervención técnica
    await firstValueFrom(
      this.http.post<any>(this.apiIntervencionUrl, payload, { headers })
    );

    // 2. Actualizamos la tarea preventiva en memoria y en API a estado EJECUTADA
    this._tareas.update((lista) =>
      lista.map((t) =>
        t.id === datos.tareaId
          ? { ...t, estado: 'Ejecutada', estadoCodigo: 'EJECUTADA' }
          : t
      )
    );

    return true;
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