import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

const API_BASE = API_BASE_URL;

export interface UnidadAdministrada {
  id: number;
  piso: number;
  numero: string;
  torreCodigo: string;
  torreNombre: string;
  etiqueta: string;
  relacion?: 'PROPIETARIO' | 'INQUILINO';
  esPrincipal?: boolean;
}

export interface UsuarioAdministrado {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  rol: string;
  activo: boolean;
  unidades: UnidadAdministrada[];
}

export interface AltaUsuarioRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  claveTemporal: string;
  unidadId: number;
  relacion: 'PROPIETARIO' | 'INQUILINO';
}

@Injectable({ providedIn: 'root' })
export class GestionUsuariosService {
  private readonly http = inject(HttpClient);

  async listarUsuarios(): Promise<UsuarioAdministrado[]> {
    return firstValueFrom(
      this.http.get<UsuarioAdministrado[]>(
        `${API_BASE}/admin/usuarios`,
        { headers: await this.cabeceras() },
      ),
    );
  }

  async listarUnidades(): Promise<UnidadAdministrada[]> {
    return firstValueFrom(
      this.http.get<UnidadAdministrada[]>(
        `${API_BASE}/admin/usuarios/unidades`,
        { headers: await this.cabeceras() },
      ),
    );
  }

  async registrarUsuario(request: AltaUsuarioRequest): Promise<UsuarioAdministrado> {
    return firstValueFrom(
      this.http.post<UsuarioAdministrado>(
        `${API_BASE}/admin/usuarios`,
        request,
        { headers: await this.cabeceras() },
      ),
    );
  }

  private async cabeceras(): Promise<HttpHeaders> {
    const usuario = getAuth().currentUser;

    if (!usuario) {
      throw new Error('No existe una sesión Firebase activa.');
    }

    const token = await usuario.getIdToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
}
