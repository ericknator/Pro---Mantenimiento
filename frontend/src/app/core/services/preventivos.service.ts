import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { TareaPreventiva, TareaPreventivaApi } from '../../models/tarea-preventiva.model';
import { auth } from './firebase.config';
import { onAuthStateChanged, type User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class PreventivosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = 'http://localhost:8085/promantenimiento/api/tarea-preventiva';

  private readonly _tareas = signal<TareaPreventiva[]>([]);
  readonly tareas = this._tareas.asReadonly();
  readonly cargando = signal(false);

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
    const usuario = await this.esperarUsuario();
    if (!usuario) return;

    this.cargando.set(true);
    try {
      const token = await usuario.getIdToken();
      
      // Intentamos primero el endpoint específico de Gean (/asignadas),
      // y si aún no lo sube, consumimos el listado general (/api/tarea-preventiva).
      let respuesta: TareaPreventivaApi[];
      try {
        respuesta = await firstValueFrom(
          this.http.get<TareaPreventivaApi[]>(`${this.apiUrl}/asignadas`, {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
          })
        );
      } catch {
        respuesta = await firstValueFrom(
          this.http.get<TareaPreventivaApi[]>(this.apiUrl, {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
          })
        );
      }

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
    } catch {
      return null;
    }
  }
}