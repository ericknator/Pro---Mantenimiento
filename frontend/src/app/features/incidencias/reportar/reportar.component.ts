import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { IncidenciasService } from '../../../core/services/incidencias.service';
import { Incidencia } from '../../../models/incidencia.model';
import { IncidenciaRowComponent } from '../../../shared/incidencia-row/incidencia-row.component';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { CategoriaIncidenciaService } from '../../../core/services/categoria-incidencia.service';

@Component({
  selector: 'app-reportar',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeroComponent,
    IncidenciaRowComponent
  ],
  templateUrl: './reportar.component.html',
  styleUrl: './reportar.component.scss'
})
export class ReportarComponent {

  private readonly fb = inject(FormBuilder);

  readonly service = inject(IncidenciasService);
  readonly categoriasService = inject(CategoriaIncidenciaService);

  readonly cargando = this.service.cargando;
  readonly error = this.service.error;

  readonly archivos = signal<File[]>([]);
  readonly creada = signal<Incidencia | null>(null);
  readonly enviando = signal(false);
  readonly mensajeError = signal<string | null>(null);

  recientes = () => this.service.propias().slice(0, 3);

  form = this.fb.nonNullable.group({
    categoria: ['', Validators.required],
    ubicacion: [
      '',
      [Validators.required, Validators.maxLength(120)]
    ],
    descripcion: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]
    ]
  });

  constructor() {
    void this.service.cargar();
    void this.categoriasService.cargar();
  }

  invalido(
    campo: 'categoria' | 'ubicacion' | 'descripcion'
  ): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const seleccionados = Array.from(input.files ?? []);

    const permitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm'
    ];

    const disponibles = 3 - this.archivos().length;

    if (seleccionados.length > disponibles) {
      this.mensajeError.set(
        'Solo puedes adjuntar un máximo de 3 archivos.'
      );
      input.value = '';
      return;
    }

    for (const archivo of seleccionados) {
      if (!permitidos.includes(archivo.type)) {
        this.mensajeError.set(
          `El archivo "${archivo.name}" tiene un formato no permitido.`
        );
        input.value = '';
        return;
      }

      if (archivo.size > 20 * 1024 * 1024) {
        this.mensajeError.set(
          `El archivo "${archivo.name}" supera el límite de 20 MB.`
        );
        input.value = '';
        return;
      }
    }

    this.mensajeError.set(null);
    this.archivos.update(actuales => [
      ...actuales,
      ...seleccionados
    ]);

    // Permite volver a seleccionar el mismo archivo si fuera necesario.
    input.value = '';
  }

  eliminarArchivo(indice: number): void {
    this.archivos.update(actuales =>
      actuales.filter((_, i) => i !== indice)
    );

    this.mensajeError.set(null);
  }

  async enviar(): Promise<void> {
    if (this.enviando()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();

    const incidencia = {
      categoria: {
        id: Number(valores.categoria)
      },
      ubicacion: valores.ubicacion.trim(),
      descripcion: valores.descripcion.trim()
    };

    if (
      !Number.isInteger(incidencia.categoria.id) ||
      incidencia.categoria.id <= 0
    ) {
      this.form.controls.categoria.setErrors({ required: true });
      this.form.controls.categoria.markAsTouched();
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set(null);
    this.creada.set(null);

    try {
      await this.service.crearConEvidencias(
        incidencia,
        this.archivos()
      );

      // El servicio vuelve a cargar la lista de incidencias.
      this.form.reset({
        categoria: '',
        ubicacion: '',
        descripcion: ''
      });

      this.archivos.set([]);
      this.creada.set(null);

      alert('Incidencia registrada correctamente.');

    } catch (error: unknown) {
      console.error('Error al registrar la incidencia:', error);
      this.mensajeError.set(this.obtenerMensajeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  private obtenerMensajeError(error: unknown): string {
    const httpError = error as {
      status?: number;
      error?: {
        message?: string;
        error?: string;
        detail?: string;
      } | string;
      message?: string;
    };

    const status = httpError.status ?? 0;

    const cuerpo = typeof httpError.error === 'string'
      ? httpError.error
      : [
          httpError.error?.message,
          httpError.error?.error,
          httpError.error?.detail
        ].filter(Boolean).join(' ');

    const detalle = `${cuerpo} ${httpError.message ?? ''}`.toLowerCase();

    if (
      status === 413 ||
      detalle.includes('maximum upload size') ||
      detalle.includes('maxuploadsizeexceeded') ||
      detalle.includes('payload too large')
    ) {
      return 'Los archivos son demasiado pesados. Quita alguna foto o video, o selecciona archivos más ligeros e inténtalo nuevamente.';
    }

    if (status === 0) {
      return 'No pudimos enviar tu incidencia. Prueba quitando una foto o video, o seleccionando archivos más ligeros. Si el problema continúa, inténtalo más tarde.';
    }

    if (status === 401 || status === 403) {
      return 'Tu sesión ha vencido o no tienes permiso para realizar esta acción. Inicia sesión nuevamente e inténtalo.';
    }

    if (status >= 500) {
      return 'Tuvimos un problema al registrar tu incidencia. Tus datos siguen en el formulario. Inténtalo nuevamente en unos minutos.';
    }

    return 'No pudimos registrar tu incidencia. Verifica la información e inténtalo nuevamente.';
  }

}
