
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerfilUsuario {
  id: number;
  uid: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: 'RESIDENTE' | 'MANTENIMIENTO' | 'ADMINISTRADOR' | 'PORTERIA_SEGURIDAD';
}

@Injectable({
  providedIn: 'root'
})
export class PerfilApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8086/promantenimiento/api/auth/perfil';

  obtenerPerfil(token: string): Observable<PerfilUsuario> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<PerfilUsuario>(this.apiUrl, { headers });
  }
}
