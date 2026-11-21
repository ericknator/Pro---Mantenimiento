import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
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

    private readonly service = inject(AlertasInternasService);

    readonly alertas = signal<AlertaInterna[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    ngOnInit(): void {
        void this.cargarAlertas();
    }

    async cargarAlertas(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const data = await this.service.obtenerMisAlertas();
            this.alertas.set(data);
        } catch (err: unknown) {
            this.alertas.set([]);
            if (err instanceof HttpErrorResponse) {
                if (err.status === 403 || err.status === 401) {
                    this.error.set('No tienes autorización para consultar estas alertas.');
                } else {
                    this.error.set('No se pudieron cargar tus alertas. Intenta nuevamente.');
                }
            } else {
                this.error.set('Ocurrió un problema al consultar tus alertas.');
            }
        } finally {
            this.cargando.set(false);
        }
    }

    codigoEstado(alerta: AlertaInterna): string {
        return alerta.estado?.codigo ?? 'DESCONOCIDO';
    }

    nombreEstado(alerta: AlertaInterna): string {
        return alerta.estado?.nombre ?? 'Estado no disponible';
    }

    nombreTipo(alerta: AlertaInterna): string {
        return alerta.tipoAlerta?.nombre ?? 'Tipo no disponible';
    }
}