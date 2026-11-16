
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

    ngOnInit(): void {
        void this.cargarBandeja();
    }

    async cargarBandeja(): Promise<void> {
        if (this.cargando()) {
            return;
        }

        this.cargando.set(true);
        this.error.set(null);

        try {
            const resultado = await this.alertasService.obtenerBandeja();

            // El endpoint devuelve una lista ordenada desde el backend.
            // Se valida la estructura antes de presentarla.
            if (!Array.isArray(resultado)) {
                throw new Error('Respuesta de bandeja inesperada.');
            }

            this.alertas.set(resultado);

        } catch (err: unknown) {
            // No conservar datos anteriores si la consulta falla.
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
