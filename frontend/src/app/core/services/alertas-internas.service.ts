import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth } from './firebase.config';

export interface TipoAlertaInterna {
    id: number;
    codigo: string;
    nombre: string;
    activo: boolean;
}

export interface CrearAlertaInterna {
    tipoAlertaId: number;
    ubicacion: string;
    descripcion: string | null;
}

export interface ActualizarEstadoAlerta {
    nuevoEstadoCodigo?: string;
    estadoNuevoId?: number;
    observacion?: string;
}

export interface AlertaInterna {
    id: number;
    ubicacion: string;
    descripcion: string | null;
    fechaEmision: string;
    actualizadoEn: string;
    fechaRecepcion?: string | null;
    recibidoPor?: {
        id: number;
        nombres: string;
        apellidos: string;
    } | null;
    tipoAlerta: TipoAlertaInterna;

    estado: {
        id: number;
        codigo: string;
        nombre: string;
    };
}

@Injectable({ providedIn: 'root' })
export class AlertasInternasService {

    private readonly http = inject(HttpClient);

    async obtenerBandeja(): Promise<AlertaInterna[]> {
        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.get<AlertaInterna[]>(
                `${this.apiUrl}/alerta-interna/bandeja`,
                { headers }
            )
        );
    }

    async confirmarRecepcion(id: number): Promise<AlertaInterna> {
        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.patch<AlertaInterna>(
                `${this.apiUrl}/alerta-interna/${id}/confirmar-recepcion`,
                {},
                { headers }
            )
        );
    }

    async actualizarEstado(
        id: number,
        datos: ActualizarEstadoAlerta
    ): Promise<AlertaInterna> {
        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.patch<AlertaInterna>(
                `${this.apiUrl}/alerta-interna/${id}/actualizar-estado`,
                datos,
                { headers }
            )
        );
    }

    async obtenerMisAlertas(): Promise<AlertaInterna[]> {

        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.get<AlertaInterna[]>(
                `${this.apiUrl}/alerta-interna/mis-alertas`,
                { headers }
            )
        );
    }

    private readonly apiUrl =
        'http://localhost:8086/promantenimiento/api';

    private async obtenerUsuario(): Promise<User> {

        if (auth.currentUser) {
            return auth.currentUser;
        }

        const usuario = await new Promise<User | null>(
            (resolve) => {
                const unsubscribe = onAuthStateChanged(
                    auth,
                    (user) => {
                        unsubscribe();
                        resolve(user);
                    }
                );
            }
        );

        if (!usuario) {
            throw new Error(
                'Debes iniciar sesión para continuar.'
            );
        }

        return usuario;
    }

    /**
     * Obtiene el token Firebase para solicitudes
     * protegidas por Spring Security.
     */
    private async obtenerCabeceras(): Promise<HttpHeaders> {

        const usuario = await this.obtenerUsuario();
        const token = await usuario.getIdToken();

        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * Obtiene los tipos de alertas activos.
     */
    async obtenerTipos(): Promise<TipoAlertaInterna[]> {

        const headers = await this.obtenerCabeceras();

        const tipos = await firstValueFrom(
            this.http.get<TipoAlertaInterna[]>(
                `${this.apiUrl}/tipo-alerta-interna`,
                { headers }
            )
        );

        return tipos.filter(tipo => tipo.activo);
    }

    /**
     * Permite al residente registrar una alerta.
     */
    async registrar(
        datos: CrearAlertaInterna
    ): Promise<AlertaInterna> {

        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.post<AlertaInterna>(
                `${this.apiUrl}/alerta-interna`,
                datos,
                { headers }
            )
        );
    }
}