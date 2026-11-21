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
    readonly confirmandoId = signal<number | null>(null);
    readonly errorAccion = signal<string | null>(null);

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

            if (!Array.isArray(resultado)) {
                throw new Error('Respuesta de bandeja inesperada.');
            }

            this.alertas.set(resultado);
            this.errorConfirmacion.set(null);

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

    async confirmar(alerta: AlertaInterna): Promise<void> {
        if (this.confirmandoId() !== null || this.identificarEstado(alerta) !== 'EMITIDA') {
            return;
        }

        this.confirmandoId.set(alerta.id);
        this.errorAccion.set(null);

        try {
            const actualizada = await this.alertasService.confirmarRecepcion(alerta.id);

            this.alertas.update((actuales) =>
                actuales.map((item) => (item.id === alerta.id ? actualizada : item))
            );
        } catch (err: unknown) {
            if (err instanceof HttpErrorResponse && err.status === 409) {
                void this.cargarBandeja();
                return;
            }
            this.errorAccion.set('No se pudo confirmar la recepción de la alerta.');
        } finally {
            this.confirmandoId.set(null);
        }
    }

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