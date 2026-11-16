
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
    AlertaInterna,
    AlertasInternasService
} from '../../core/services/alertas-internas.service';

@Component({
    selector: 'app-mis-alertas',
    imports: [DatePipe, RouterLink],
    templateUrl: './mis-alertas.component.html',
    styleUrl: './mis-alertas.component.scss'
})
export class MisAlertasComponent implements OnInit {

    private readonly alertasService = inject(AlertasInternasService);

    readonly alertas = signal<AlertaInterna[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    ngOnInit(): void {
        void this.cargarAlertas();
    }

    async cargarAlertas(): Promise<void> {
        if (this.cargando()) return;

        this.cargando.set(true);
        this.error.set(null);

        try {
            const resultado = await this.alertasService.obtenerMisAlertas();

            if (!Array.isArray(resultado)) {
                throw new Error('Respuesta inesperada del servidor.');
            }

            this.alertas.set(resultado);

        } catch (err: unknown) {
            this.alertas.set([]);

            if (err instanceof HttpErrorResponse) {
                switch (err.status) {
                    case 401:
                        this.error.set('Tu sesión no es válida. Inicia sesión nuevamente.');
                        break;
                    case 403:
                        this.error.set('No tienes permiso para consultar estas alertas.');
                        break;
                    case 0:
                        this.error.set('No se pudo conectar con el servidor.');
                        break;
                    default:
                        this.error.set('No se pudieron cargar tus alertas.');
                }
            } else {
                this.error.set('Ocurrió un problema al consultar tus alertas.');
            }

        } finally {
            this.cargando.set(false);
        }
    }

    nombreEstado(alerta: AlertaInterna): string {
        return alerta.estado?.nombre ?? 'Estado no disponible';
    }

    codigoEstado(alerta: AlertaInterna): string {
        return alerta.estado?.codigo ?? 'DESCONOCIDO';
    }

    nombreTipo(alerta: AlertaInterna): string {
        return alerta.tipoAlerta?.nombre ?? 'Tipo no disponible';
    }
}
