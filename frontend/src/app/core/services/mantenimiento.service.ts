import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { auth } from './firebase.config';
import { MantenimientoPreventivo, ActivoItem } from '../../models/mantenimiento.model';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8085/promantenimiento/api/mantenimiento';
  private readonly apiUrlPlural = 'http://localhost:8085/promantenimiento/api/mantenimientos';
  private readonly activosUrl = 'http://localhost:8085/promantenimiento/api/activos';

  readonly mantenimientos = signal<MantenimientoPreventivo[]>([]);
  readonly activos = signal<ActivoItem[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /** Helper para obtener las cabeceras con el Bearer Token de Firebase */
  private async obtenerHeaders(): Promise<HttpHeaders> {
    const token = await auth.currentUser?.getIdToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  /** Carga la lista de mantenimientos programados */
  async cargarMantenimientos(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const headers = await this.obtenerHeaders();
      const data = await firstValueFrom(
        this.http.get<MantenimientoPreventivo[]>(this.apiUrl, { headers })
      );
      this.mantenimientos.set(data ?? []);
    } catch (err: unknown) {
      console.warn('No se pudo cargar la lista de mantenimientos:', err);
      this.mantenimientos.set([]);
    } finally {
      this.cargando.set(false);
    }
  }

  /** Carga los activos disponibles para el selector */
  async cargarActivos(): Promise<void> {
    try {
      const headers = await this.obtenerHeaders();
      const data = await firstValueFrom(
        this.http.get<ActivoItem[]>(this.activosUrl, { headers })
      );
      if (data && data.length > 0) {
        this.activos.set(data);
        return;
      }
    } catch (err) {
      console.warn('Usando catálogo local de activos de prueba');
    }

    // Activos de prueba del condominio mientras el endpoint de activos esté listo
    this.activos.set([
      { id: 1, codigo: 'ASC-01', nombre: 'Ascensor Torre 1 Principal' },
      { id: 2, codigo: 'ASC-02', nombre: 'Ascensor Torre 2' },
      { id: 3, codigo: 'BOM-01', nombre: 'Sistema de Bombeo de Cisterna' },
      { id: 4, codigo: 'POR-01', nombre: 'Portón Vehicular Acceso Principal' },
      { id: 5, codigo: 'GEN-01', nombre: 'Grupo Electrógeno de Emergencia' }
    ]);
  }

  /** Registra una nueva programación preventiva (POST) con autenticación */
async programarMantenimiento(datos: MantenimientoPreventivo): Promise<MantenimientoPreventivo> {
    const headers = await this.obtenerHeaders();
    
    const payload = {
      activoId: Number(datos.activoId),
      activo: { id: Number(datos.activoId) },
      tipoMantenimiento: datos.tipoMantenimiento,
      fechaProgramada: datos.fechaProgramada
    };
    try {
      // 1. Intenta enviar al endpoint de Gean
      const res = await firstValueFrom(
        this.http.post<MantenimientoPreventivo>(this.apiUrl, payload, { headers })
      );
      this.mantenimientos.update(prev => [res, ...prev]);
      return res;
    } catch (error: any) {
      // Si el endpoint no existe aún en el backend de Gean (404), guardamos en memoria (Modo Mock / Demo)
      if (error?.status === 404 || error?.message?.includes('No static resource')) {
        console.warn('El backend aún no tiene implementado el endpoint. Guardando en memoria para la demo.');
        
        const activoEncontrado = this.activos().find(a => String(a.id) === String(datos.activoId));
        const nuevoMock: MantenimientoPreventivo = {
          id: Date.now(),
          activoId: datos.activoId,
          nombreActivo: activoEncontrado ? `${activoEncontrado.codigo} - ${activoEncontrado.nombre}` : `Activo #${datos.activoId}`,
          tipoMantenimiento: datos.tipoMantenimiento,
          fechaProgramada: datos.fechaProgramada,
          estado: 'PROGRAMADO'
        };
        this.mantenimientos.update(prev => [nuevoMock, ...prev]);
        return nuevoMock;
      }
      // Si es otro error (por ejemplo validación de negocio 400), lo propagamos
      throw error;
    }
  }
}