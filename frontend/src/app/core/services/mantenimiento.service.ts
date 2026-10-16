import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { AuthService } from './auth.service';
import { MantenimientoPreventivo } from '../../models/mantenimiento.model';
import { Activo } from '../../models/activo.model';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  // 🎯 El endpoint real que vimos en TareaPreventivaRestController.java
  private readonly apiUrl = 'http://localhost:8085/promantenimiento/api/tarea-preventiva';
  private readonly activosUrl = 'http://localhost:8085/promantenimiento/api/activo';

  readonly mantenimientos = signal<MantenimientoPreventivo[]>([]);
  readonly activos = signal<Activo[]>([]);
  readonly cargando = signal(false);

  private async obtenerHeaders(): Promise<HttpHeaders> {
    const token = await auth.currentUser?.getIdToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  /** GET: Carga los activos reales desde MySQL para el selector */
  async cargarActivos(): Promise<void> {
    try {
      const headers = await this.obtenerHeaders();
      const data = await firstValueFrom(
        this.http.get<any[]>(this.activosUrl, { headers })
      );
      if (Array.isArray(data)) {
        this.activos.set(data.map(item => ({
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          tipo: item.tipoActivo?.nombre || 'General',
          ubicacion: item.ubicacion,
          estado: item.estadoActivo?.nombre || 'OPERATIVO'
        })));
      }
    } catch (err) {
      console.warn('Error al cargar activos para el selector:', err);
    }
  }

  /** GET: Lista las tareas preventivas guardadas en MySQL */
  async cargarMantenimientos(): Promise<void> {
    this.cargando.set(true);
    try {
      const headers = await this.obtenerHeaders();
      const data = await firstValueFrom(
        this.http.get<any[]>(this.apiUrl, { headers })
      );
      if (Array.isArray(data)) {
        this.mantenimientos.set(data.map(item => ({
          id: item.id,
          activoId: item.activo?.id,
          nombreActivo: item.activo ? `${item.activo.codigo} - ${item.activo.nombre}` : `Activo #${item.activo?.id}`,
          tipoMantenimiento: item.titulo,
          fechaProgramada: String(item.programadaPara || '').slice(0, 10),
          estado: item.estado?.nombre || 'PROGRAMADO'
        })));
      }
    } catch (err) {
      console.warn('Error al cargar tareas preventivas de MySQL:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  /** POST: Guarda la programación en MySQL cumpliendo TareaPreventivaEntity */
  async programarMantenimiento(datos: { activoId: number | string; tipoMantenimiento: string; fechaProgramada: string }): Promise<any> {
    const headers = await this.obtenerHeaders();

    const ahoraIso = new Date().toISOString().slice(0, 19);
    // Convertimos la fecha YYYY-MM-DD a LocalDateTime: "2026-11-15T09:00:00"
    const fechaHoraProgramada = datos.fechaProgramada.includes('T') 
      ? datos.fechaProgramada 
      : `${datos.fechaProgramada}T09:00:00`;

    const usuarioId = Number(this.authService.usuario()?.id || 1);

    // 🎯 PAYLOAD EXACTO que pide TareaPreventivaEntity.java
    const payload = {
      activo: {
        id: Number(datos.activoId)
      },
      titulo: datos.tipoMantenimiento,
      descripcion: `Programación preventiva de ${datos.tipoMantenimiento}`,
      programadaPara: fechaHoraProgramada,
      estado: {
        id: 1 // 1 = Programada / Pendiente
      },
      creadoPor: {
        id: usuarioId
      },
      creadoEn: ahoraIso,
      actualizadoEn: ahoraIso
    };

    const res = await firstValueFrom(
      this.http.post<any>(this.apiUrl, payload, { headers })
    );

    // Refrescamos la lista directamente desde la base de datos
    await this.cargarMantenimientos();
    return res;
  }
}