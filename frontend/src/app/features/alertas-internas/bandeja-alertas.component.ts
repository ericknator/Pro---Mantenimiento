import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
    AlertaInterna,
    AlertasInternasService
} from '../../core/services/alertas-internas.service';

@Component({
    selector: 'app-bandeja-alertas',
    imports: [DatePipe, FormsModule, RouterLink],
    templateUrl: './bandeja-alertas.component.html',
    styleUrl: './bandeja-alertas.component.scss'
})
export class BandejaAlertasComponent implements OnInit {

    private readonly alertasService = inject(AlertasInternasService);

    readonly alertas = signal<AlertaInterna[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);
    readonly procesandoId = signal<number | null>(null);
    readonly errorAccion = signal<string | null>(null);

    readonly alertaModal = signal<AlertaInterna | null>(null);
    readonly proximoEstado = signal<'EN_ATENCION' | 'ATENDIDA' | null>(null);
    observacionTexto: string = '';

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

            if (!Array.isArray(resultado)) {
                throw new Error('Respuesta de bandeja inesperada.');
            }

            this.alertas.set(resultado);

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
        if (this.procesandoId() !== null || this.identificarEstado(alerta) !== 'EMITIDA') {
            return;
        }

        this.procesandoId.set(alerta.id);
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
            this.procesandoId.set(null);
        }
    }

    abrirModalTransicion(alerta: AlertaInterna, destino: 'EN_ATENCION' | 'ATENDIDA'): void {
        this.alertaModal.set(alerta);
        this.proximoEstado.set(destino);
        this.observacionTexto = destino === 'EN_ATENCION'
            ? 'El personal de seguridad se dirige al punto para verificar la situación.'
            : 'Situación atendida y controlada por seguridad.';
        this.errorAccion.set(null);
    }

    cerrarModal(): void {
        this.alertaModal.set(null);
        this.proximoEstado.set(null);
        this.observacionTexto = '';
    }

    async guardarTransicion(): Promise<void> {
        const alerta = this.alertaModal();
        const destino = this.proximoEstado();

        if (!alerta || !destino || this.procesandoId() !== null) {
            return;
        }

        const estadoActual = this.identificarEstado(alerta);

        if (destino === 'EN_ATENCION' && estadoActual !== 'RECIBIDA') {
            this.errorAccion.set('Transición no permitida: la alerta debe estar RECIBIDA para iniciar atención.');
            this.cerrarModal();
            return;
        }

        if (destino === 'ATENDIDA' && estadoActual !== 'EN_ATENCION') {
            this.errorAccion.set('Transición no permitida: la alerta debe estar EN ATENCIÓN para marcarse como atendida.');
            this.cerrarModal();
            return;
        }

        this.procesandoId.set(alerta.id);
        this.errorAccion.set(null);

        try {
            const actualizada = await this.alertasService.actualizarEstado(alerta.id, {
                nuevoEstadoCodigo: destino,
                observacion: this.observacionTexto.trim() || undefined
            });

            this.alertas.update((actuales) =>
                actuales.map((item) => (item.id === alerta.id ? actualizada : item))
            );
            this.cerrarModal();
        } catch (err: unknown) {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 409 || err.status === 400) {
                    this.errorAccion.set('Transición rechazada por el sistema. El estado vigente fue conservado.');
                    void this.cargarBandeja();
                    this.cerrarModal();
                    return;
                }
            }
            this.errorAccion.set('Ocurrió un error al actualizar el estado de la alerta.');
        } finally {
            this.procesandoId.set(null);
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