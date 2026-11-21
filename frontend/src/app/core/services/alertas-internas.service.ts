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

    // PMS-246: información de recepción confirmada.
    // Los campos permanecen vacíos hasta que portería confirma.
    recibidoPor?: {
        id: number;
        nombre?: string;
        apellido?: string;
    } | null;

    fechaRecepcion?: string | null;
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

        return firstValueFrom(
            this.http.patch<AlertaInterna>(
                `${this.apiUrl}/alerta-interna/${id}/confirmar-recepcion`,
                null,
                { headers }
            )
        );
    }

    /**
     * Consulta las alertas del residente autenticado.
     */
    async obtenerMisAlertas(): Promise<AlertaInterna[]> {
        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.get<AlertaInterna[]>(
                `${this.apiUrl}/alerta-interna/mis-alertas`,
                { headers }
            )
        );
    }

    private async obtenerUsuario(): Promise<User> {
        if (auth.currentUser) {
            return auth.currentUser;
        }

        const usuario = await new Promise<User | null>((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });

        if (!usuario) {
            throw new Error('Debes iniciar sesión para continuar.');
        }

        return usuario;
    }

    private async obtenerCabeceras(): Promise<HttpHeaders> {
        const usuario = await this.obtenerUsuario();
        const token = await usuario.getIdToken();

        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    async obtenerTipos(): Promise<TipoAlertaInterna[]> {
        const headers = await this.obtenerCabeceras();

        const tipos = await firstValueFrom(
            this.http.get<TipoAlertaInterna[]>(
                `${this.apiUrl}/tipo-alerta-interna`,
                { headers }
            )
        );

        return tipos.filter((tipo) => tipo.activo);
    }

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