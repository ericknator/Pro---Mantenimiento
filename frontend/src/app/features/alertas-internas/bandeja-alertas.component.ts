
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
    AlertaInterna,
    AlertasInternasService
} from '../../core/services/alertas-internas.service';

@Component({
    selector: 'app-bandeja-alertas',
    imports: [DatePipe, RouterLink],
    templateUrl: './bandeja-alertas.component.html',
    styleUrl: './bandeja-alertas.component.scss'
})
export class BandejaAlertasComponent implements OnInit {

    private readonly alertasService =
        inject(AlertasInternasService);

    readonly alertas = signal<AlertaInterna[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    // PMS-246: confirmación de recepción.
    readonly confirmandoId = signal<number | null>(null);

    readonly errorConfirmacion = signal<{
        id: number;
        mensaje: string;
    } | null>(null);

    // PMS-255: actualización de estados.
    readonly actualizandoId = signal<number | null>(null);

    readonly errorActualizacion = signal<{
        id: number;
        mensaje: string;
    } | null>(null);

    ngOnInit(): void {
        void this.cargarBandeja();
    }

    /**
     * Consulta la bandeja desde el backend.
     *
     * No permite recargas mientras se confirma
     * una recepción o actualiza un estado.
     */
    async cargarBandeja(): Promise<void> {

        if (
            this.cargando() ||
            this.confirmandoId() !== null ||
            this.actualizandoId() !== null
        ) {
            return;
        }

        this.cargando.set(true);
        this.error.set(null);

        try {
            const resultado =
                await this.alertasService.obtenerBandeja();

            if (!Array.isArray(resultado)) {
                throw new Error(
                    'Respuesta de bandeja inesperada.'
                );
            }

            this.alertas.set(resultado);

            this.errorConfirmacion.set(null);
            this.errorActualizacion.set(null);

        } catch (err: unknown) {

            this.alertas.set([]);

            if (err instanceof HttpErrorResponse) {
                switch (err.status) {
                    case 401:
                        this.error.set(
                            'Tu sesión no es válida. Inicia sesión nuevamente.'
                        );
                        break;

                    case 403:
                        this.error.set(
                            'No tienes permiso para consultar la bandeja de alertas.'
                        );
                        break;

                    case 0:
                        this.error.set(
                            'No se pudo conectar con el servidor. Verifica la conexión.'
                        );
                        break;

                    default:
                        this.error.set(
                            'No se pudieron cargar las alertas internas.'
                        );
                }
            } else {
                this.error.set(
                    'Ocurrió un problema al consultar la bandeja.'
                );
            }

        } finally {
            this.cargando.set(false);
        }
    }

    /**
     * PMS-246 / HU-ALT-03
     *
     * Confirma la recepción de una alerta EMITIDA.
     * El backend registra el usuario y fecha reales.
     */
    async confirmarRecepcion(
        alerta: AlertaInterna
    ): Promise<void> {

        if (
            this.confirmandoId() !== null ||
            this.actualizandoId() !== null ||
            this.cargando()
        ) {
            return;
        }

        const alertaActual = this.alertas().find(
            item => item.id === alerta.id
        );

        if (
            !alertaActual ||
            this.identificarEstado(alertaActual) !== 'EMITIDA'
        ) {
            return;
        }

        this.confirmandoId.set(alerta.id);
        this.errorConfirmacion.set(null);

        try {
            const respuesta =
                await this.alertasService.confirmarRecepcion(
                    alerta.id
                );

            if (
                respuesta?.id !== alerta.id ||
                respuesta.estado?.codigo !== 'RECIBIDA'
            ) {
                throw new Error(
                    'El servidor no devolvió una confirmación válida.'
                );
            }

            this.alertas.update(actuales =>
                actuales.map(item =>
                    item.id === alerta.id
                        ? respuesta
                        : item
                )
            );

        } catch (err: unknown) {

            let mensaje =
                'No se pudo confirmar la recepción de la alerta.';

            if (err instanceof HttpErrorResponse) {
                switch (err.status) {
                    case 401:
                        mensaje =
                            'Tu sesión expiró. Inicia sesión nuevamente.';
                        break;

                    case 403:
                        mensaje =
                            'No tienes permisos para confirmar esta alerta.';
                        break;

                    case 404:
                        mensaje =
                            'La alerta ya no existe. Actualiza la bandeja.';
                        break;

                    case 409:
                        mensaje =
                            'La alerta no permite esta transición. Actualiza la bandeja para comprobar su estado.';
                        break;

                    case 0:
                        mensaje =
                            'No se pudo conectar con el servidor. Comprueba la conexión y actualiza la bandeja antes de reintentar.';
                        break;
                }

            } else if (err instanceof Error) {
                mensaje = err.message;
            }

            this.errorConfirmacion.set({
                id: alerta.id,
                mensaje
            });

        } finally {
            this.confirmandoId.set(null);
        }
    }

    /**
     * PMS-255 / HU-ALT-04
     *
     * Solicita al backend la siguiente transición.
     *
     * RECIBIDA -> EN_ATENCION
     * EN_ATENCION -> ATENDIDA
     *
     * No se modifica el estado artificialmente.
     */
    async actualizarEstado(
        alerta: AlertaInterna
    ): Promise<void> {

        if (
            this.cargando() ||
            this.confirmandoId() !== null ||
            this.actualizandoId() !== null
        ) {
            return;
        }

        const actual = this.alertas().find(
            item => item.id === alerta.id
        );

        if (!actual) {
            return;
        }

        const estadoActual =
            this.identificarEstado(actual);

        const siguienteEstado =
            estadoActual === 'RECIBIDA'
                ? 'EN_ATENCION'
                : estadoActual === 'EN_ATENCION'
                    ? 'ATENDIDA'
                    : null;

        // Solo se permiten transiciones conocidas.
        // El backend realiza la validación definitiva.
        if (!siguienteEstado) {
            return;
        }

        this.actualizandoId.set(alerta.id);
        this.errorActualizacion.set(null);

        try {
            const respuesta =
                await this.alertasService.actualizarEstado(
                    alerta.id
                );

            // Exigir el estado esperado en la respuesta.
            if (
                respuesta?.id !== alerta.id ||
                respuesta.estado?.codigo !== siguienteEstado
            ) {
                throw new Error(
                    'El servidor no devolvió el estado esperado. Actualiza la bandeja para verificar el resultado.'
                );
            }

            // Actualizar únicamente con la respuesta real.
            this.alertas.update(actuales =>
                actuales.map(item =>
                    item.id === alerta.id
                        ? respuesta
                        : item
                )
            );

        } catch (err: unknown) {

            let mensaje =
                'No se pudo actualizar el estado de la alerta.';

            if (err instanceof HttpErrorResponse) {
                switch (err.status) {
                    case 401:
                        mensaje =
                            'Tu sesión expiró. Inicia sesión nuevamente.';
                        break;

                    case 403:
                        mensaje =
                            'No tienes permisos para actualizar esta alerta.';
                        break;

                    case 404:
                        mensaje =
                            'La alerta ya no existe. Actualiza la bandeja.';
                        break;

                    case 409:
                        mensaje =
                            'Esta transición no está permitida. Actualiza la bandeja para comprobar el estado real.';
                        break;

                    case 0:
                        mensaje =
                            'No se pudo conectar con el servidor. Comprueba el estado de la alerta antes de reintentar.';
                        break;
                }

            } else if (err instanceof Error) {
                mensaje = err.message;
            }

            this.errorActualizacion.set({
                id: alerta.id,
                mensaje
            });

        } finally {
            this.actualizandoId.set(null);
        }
    }

    /**
     * Identifica el estado real devuelto por la API.
     */
    identificarEstado(
        alerta: AlertaInterna
    ): string {
        return alerta.estado?.codigo ?? 'DESCONOCIDO';
    }

    /**
     * Obtiene el nombre del tipo de alerta.
     */
    obtenerNombreTipo(
        alerta: AlertaInterna
    ): string {
        return alerta.tipoAlerta?.nombre ??
            'Tipo no disponible';
    }

    /**
     * Obtiene el nombre del estado.
     */
    obtenerNombreEstado(
        alerta: AlertaInterna
    ): string {
        return alerta.estado?.nombre ??
            'Estado no disponible';
    }
}
