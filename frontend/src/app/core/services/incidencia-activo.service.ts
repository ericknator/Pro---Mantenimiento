import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface ActivoSeleccionable {
  id: number;
  codigo: string;
  nombre: string;
  ubicacion?: string;
}

@Injectable({ providedIn: 'root' })
export class IncidenciaActivoService {
  private readonly http = inject(HttpClient);

  async listarActivos(): Promise<ActivoSeleccionable[]> {
    const datos = await firstValueFrom(this.http.get<ActivoSeleccionable[]>(
      `${API_BASE_URL}/activo/custom`, { headers: await this.cabeceras() }));
    if (!Array.isArray(datos)) throw new Error('La respuesta de activos no es válida.');
    return datos;
  }

  async asociar(id: string, activoId: number | null): Promise<{
    incidenciaId: number; activo: ActivoSeleccionable | null;
  }> {
    return firstValueFrom(this.http.patch<{
      incidenciaId: number; activo: ActivoSeleccionable | null;
    }>(`${API_BASE_URL}/incidencia/${encodeURIComponent(id)}/activo`,
      { activoId }, { headers: await this.cabeceras() }));
  }

  private async cabeceras(): Promise<HttpHeaders> {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) throw new Error('Inicia sesión para continuar.');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
