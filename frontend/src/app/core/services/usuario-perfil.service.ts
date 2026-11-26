
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

const API_BASE = API_BASE_URL;

export interface RolResponsable {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface UsuarioResponsable {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  activo: boolean;
  rol: RolResponsable;
}

@Injectable({ providedIn: 'root' })
export class UsuarioPerfilService {
  private readonly http = inject(HttpClient);

  async listarRoles(): Promise<RolResponsable[]> {
    const datos = await firstValueFrom(
      this.http.get<RolResponsable[]>(
        `${API_BASE}/rol`,
        { headers: await this.cabeceras() }
      )
    );

    return datos.filter(rol => rol.activo);
  }

  async listarResponsables(rolId: number): Promise<UsuarioResponsable[]> {
    return firstValueFrom(
      this.http.get<UsuarioResponsable[]>(
        `${API_BASE}/usuario-perfil/responsables/rol/${rolId}`,
        { headers: await this.cabeceras() }
      )
    );
  }

  private async cabeceras(): Promise<HttpHeaders> {
    const token = await getAuth().currentUser?.getIdToken();

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
