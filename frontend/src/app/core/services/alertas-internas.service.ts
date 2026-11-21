
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

    tipoAlerta: TipoAlertaInterna;

    estado: {
        id: number;
        codigo: string;
        nombre: string;
    };

    // PMS-246: confirmación de recepción.
    recibidoPor?: {
        id: number;
        nombre?: string;
        apellido?: string;
    } | null;

    fechaRecepcion?: string | null;

    // HU-ALT-04: última observación,
    // cuando el backend la incluya en la respuesta.
    observacion?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AlertasInternasService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        'http://localhost:8085/promantenimiento/api';

    /**
     * Consulta la bandeja de alertas internas.
     * El backend controla el acceso por rol.
     */
    async obtenerBandeja(): Promise<AlertaInterna[]> {
        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.get<AlertaInterna[]>(
                `${this.apiUrl}/alerta-interna/bandeja`,
                { headers }
            )
        );
    }

    /**
     * PMS-246 / HU-ALT-03
     *
     * Confirma la recepción de una alerta.
     * El backend determina el estado, actor y fecha.
     */
    async confirmarRecepcion(
        id: number
    ): Promise<AlertaInterna> {

        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.patch<AlertaInterna>(
                `${this.apiUrl}/alerta-interna/${id}/confirmar-recepcion`,
                null,
                { headers }
            )
        );
    }

    /**
     * PMS-255 / HU-ALT-04
     *
     * Solicita la siguiente transición de estado.
     *
     * RECIBIDA -> EN_ATENCION
     * EN_ATENCION -> ATENDIDA
     *
     * El backend valida permisos y transiciones,
     * actualiza la alerta y registra su actuación.
     */
    async actualizarEstado(
        id: number,
        observacion: string | null = null
    ): Promise<AlertaInterna> {

        const headers = await this.obtenerCabeceras();

        return firstValueFrom(
            this.http.patch<AlertaInterna>(
                `${this.apiUrl}/alerta-interna/${id}/actualizar-estado`,
                { observacion },
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

    /**
     * Espera a que Firebase confirme la sesión.
     */
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
