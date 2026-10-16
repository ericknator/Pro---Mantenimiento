import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { Activo } from '../../models/activo.model';

@Injectable({ providedIn: 'root' })
export class ActivoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8085/promantenimiento/api/activo';

  readonly activos = signal<Activo[]>([]);
  readonly cargando = signal(false);

  private async obtenerHeaders(): Promise<HttpHeaders> {
    const token = await auth.currentUser?.getIdToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  /** Mapea el tipo de texto al ID foráneo de la tabla tipo_activo en MySQL */
  private mapearTipoActivoId(tipo: string): number {
    const mapa: Record<string, number> = {
      'Ascensor': 1,
      'Bomba de agua': 2,
      'Portón vehicular': 3,
      'Grupo electrógeno': 4,
      'Sistema contra incendios': 5,
      'Cerco eléctrico': 6,
      'Cámaras de seguridad': 7,
      'Extracción de monóxido': 8
    };
    return mapa[tipo] || 1;
  }

  /** GET: Lista los activos reales guardados en MySQL */
  async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const headers = await this.obtenerHeaders();
      const data = await firstValueFrom(
        this.http.get<any[]>(this.apiUrl, { headers })
      );
      if (Array.isArray(data)) {
        this.activos.set(data.map(item => ({
          id: item.id,
          codigo: item.codigo,
          nombre: item.nombre,
          tipo: item.tipoActivo?.nombre || 'General',
          ubicacion: item.ubicacion,
          descripcion: item.descripcion,
          estado: item.estadoActivo?.nombre || 'OPERATIVO'
        })));
      }
    } catch (err) {
      console.warn('Aún no hay registros o fallo en GET activo:', err);
    } finally {
      this.cargando.set(false);
    }
  }

  /** POST: Guarda directamente en MySQL a través de ActivoRestController */
  async registrar(datos: { codigo: string; nombre: string; tipo: string; ubicacion: string; descripcion?: string }): Promise<any> {
    const headers = await this.obtenerHeaders();

    const ahoraIso = new Date().toISOString().slice(0, 19);
    const hoyFecha = new Date().toISOString().slice(0, 10);

    // Payload que cumple estrictamente con ActivoEntity.java
    const payload = {
      codigo: datos.codigo.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      ubicacion: datos.ubicacion.trim(),
      descripcion: datos.descripcion?.trim() || '',
      tipoActivo: {
        id: this.mapearTipoActivoId(datos.tipo)
      },
      estadoActivo: {
        id: 1 // 1 = Operativo
      },
      esCritico: true,
      activo: true,
      fechaInstalacion: hoyFecha,
      creadoEn: ahoraIso,
      actualizadoEn: ahoraIso
    };

    const res = await firstValueFrom(
      this.http.post<any>(this.apiUrl, payload, { headers })
    );

    // Tras guardar en MySQL con éxito, refrescamos la lista
    await this.cargar();
    return res;
  }
}