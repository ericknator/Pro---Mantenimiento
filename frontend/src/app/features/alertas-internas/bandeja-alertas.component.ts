
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

    private readonly alertasService = inject(AlertasInternasService);

    readonly alertas = signal<AlertaInterna[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    // PMS-246: control de confirmación de recepción.
    readonly confirmandoId = signal<number | null>(null);
    readonly errorConfirmacion = signal<{
        id: number;
        mensaje: string;
    } | null>(null);

    ngOnInit(): void {
        void this.cargarBandeja();
    }

    async cargarBandeja(): Promise<void> {
        // Evitar actualizar la lista durante una confirmación.
        if (this.cargando() || this.confirmandoId() !== null) {
            return;
        }

        this.cargando.set(true);
        this.error.set(null);

        try {
            const resultado = await this.alertasService.obtenerBandeja();

            // Validar la estructura antes de mostrar los datos.
            if (!Array.isArray(resultado)) {
                throw new Error('Respuesta de bandeja inesperada.');
            }

            this.alertas.set(resultado);
            this.errorConfirmacion.set(null);

        } catch (err: unknown) {
            // No conservar información anterior si falla la consulta.
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
     * Confirma la recepción de una alerta emitida.
     *
     * El backend valida los permisos, registra el usuario,
     * almacena la fecha de recepción y evita duplicados.
     */
    async confirmarRecepcion(alerta: AlertaInterna): Promise<void> {

        // Evitar solicitudes simultáneas.
        if (this.confirmandoId() !== null || this.cargando()) {
            return;
        }

        // Solo confirmar alertas que la interfaz conoce como EMITIDA.
        // El backend realiza la validación definitiva del estado.
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
            const respuesta = await this.alertasService.confirmarRecepcion(
                alerta.id
            );

            // No asumir que la confirmación se realizó correctamente.
            // Debemos recibir el estado RECIBIDA desde el backend.
            if (
                respuesta?.id !== alerta.id ||
                respuesta.estado?.codigo !== 'RECIBIDA'
            ) {
                throw new Error(
                    'El servidor no devolvió una confirmación válida.'
                );
            }

            // Actualizar únicamente la alerta confirmada,
            // usando la respuesta real del servidor.
            this.alertas.update(actuales =>
                actuales.map(item =>
                    item.id === alerta.id ? respuesta : item
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
     * Identifica el estado real de una alerta.
     */
    identificarEstado(alerta: AlertaInterna): string {
        return alerta.estado?.codigo ?? 'DESCONOCIDO';
    }

    obtenerNombreTipo(alerta: AlertaInterna): string {
        return alerta.tipoAlerta?.nombre ?? 'Tipo no disponible';
    }

    obtenerNombreEstado(alerta: AlertaInterna): string {
        return alerta.estado?.nombre ?? 'Estado no disponible';
    }
}
