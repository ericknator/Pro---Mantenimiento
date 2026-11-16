
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
    AlertasInternasService,
    AlertaInterna,
    TipoAlertaInterna
} from '../../core/services/alertas-internas.service';

@Component({
    selector: 'app-reportar-alerta',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './reportar-alerta.component.html',
    styleUrl: './reportar-alerta.component.scss'
})
export class ReportarAlertaComponent implements OnInit {

    private readonly fb = inject(FormBuilder);
    private readonly service = inject(AlertasInternasService);

    readonly tipos = signal<TipoAlertaInterna[]>([]);
    readonly cargandoTipos = signal(false);
    readonly enviando = signal(false);
    readonly error = signal<string | null>(null);
    readonly creada = signal<AlertaInterna | null>(null);

    readonly form = this.fb.group({
        tipoAlertaId: [
            null as number | null,
            Validators.required
        ],
        ubicacion: [
            '',
            [
                Validators.required,
                Validators.pattern(/.*\S.*/),
                Validators.maxLength(255)
            ]
        ],
        descripcion: ['']
    });

    ngOnInit(): void {
        void this.cargarTipos();
    }

    invalido(
        campo: 'tipoAlertaId' | 'ubicacion'
    ): boolean {
        const control = this.form.controls[campo];

        return control.invalid && (control.touched || control.dirty);
    }

    async cargarTipos(): Promise<void> {
        this.cargandoTipos.set(true);
        this.error.set(null);

        try {
            const tipos = await this.service.obtenerTipos();
            this.tipos.set(tipos);

            if (tipos.length === 0) {
                this.error.set(
                    'No hay tipos de alerta disponibles actualmente.'
                );
            }
        } catch {
            this.tipos.set([]);
            this.error.set(
                'No se pudieron cargar los tipos de alerta. Verifica tu conexión e inténtalo nuevamente.'
            );
        } finally {
            this.cargandoTipos.set(false);
        }
    }

    async registrar(): Promise<void> {
        if (
            this.form.invalid ||
            this.enviando() ||
            this.cargandoTipos() ||
            this.tipos().length === 0
        ) {
            this.form.markAllAsTouched();
            return;
        }

        const tipoAlertaId = this.form.controls.tipoAlertaId.value;
        const ubicacion = this.form.controls.ubicacion.value?.trim();

        if (tipoAlertaId == null || !ubicacion) {
            this.form.markAllAsTouched();
            this.error.set('Completa los campos obligatorios.');
            return;
        }

        if (ubicacion.length > 255) {
            this.error.set(
                'La ubicación no puede superar los 255 caracteres.'
            );
            return;
        }

        if (!this.tipos().some(tipo => tipo.id === tipoAlertaId)) {
            this.error.set('Selecciona un tipo de alerta válido.');
            return;
        }

        this.enviando.set(true);
        this.error.set(null);

        try {
            const resultado = await this.service.registrar({
                tipoAlertaId,
                ubicacion,
                descripcion:
                    this.form.controls.descripcion.value?.trim() || null
            });

            this.creada.set(resultado);
            this.form.reset();

        } catch (err) {
            this.creada.set(null);

            if (err instanceof HttpErrorResponse) {
                switch (err.status) {
                    case 400:
                        this.error.set(
                            'Verifica los datos ingresados e inténtalo nuevamente.'
                        );
                        break;

                    case 401:
                        this.error.set(
                            'Tu sesión ha expirado. Inicia sesión nuevamente.'
                        );
                        break;

                    case 403:
                        this.error.set(
                            'Tu usuario no tiene permiso para registrar alertas.'
                        );
                        break;

                    case 404:
                        this.error.set(
                            'El tipo de alerta seleccionado no está disponible.'
                        );
                        break;

                    default:
                        this.error.set(
                            'No se pudo registrar la alerta. Verifica el resultado antes de volver a enviarla.'
                        );
                }
            } else {
                this.error.set(
                    'No fue posible confirmar el registro. Verifica el resultado antes de volver a enviarla.'
                );
            }
        } finally {
            this.enviando.set(false);
        }
    }

    limpiarConfirmacion(): void {
        if (this.creada()) {
            this.creada.set(null);
        }
    }
}
