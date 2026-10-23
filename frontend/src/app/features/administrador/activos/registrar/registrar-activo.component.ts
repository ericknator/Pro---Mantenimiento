import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';
import { ActivoService } from '../../../../core/services/activo.service';

@Component({
  selector: 'app-registrar-activo',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeroComponent],
  templateUrl: './registrar-activo.component.html',
  styleUrl: './registrar-activo.component.scss'
})
export class RegistrarActivoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly activoService = inject(ActivoService);

  readonly enviando = signal(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    tipo: ['', [Validators.required]],
    ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
    criticidad: ['', [Validators.required]],
    descripcion: ['', [Validators.maxLength(500)]],
    marca: ['', [Validators.maxLength(80)]],
    modelo: ['', [Validators.maxLength(80)]],
    numeroSerie: ['', [Validators.maxLength(100)]],
    fechaInstalacion: ['']
  });

  ngOnInit(): void {
    void this.activoService.cargarTiposActivo();
    void this.activoService.cargar();
  }

  invalido(campo: 'nombre' | 'tipo' | 'ubicacion' | 'criticidad'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  async enviar(): Promise<void> {
    if (this.enviando()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeError.set('Completa todos los campos obligatorios.');
      return;
    }

    const valores = this.form.getRawValue();
    const tipoActivoId = Number(valores.tipo);

    if (!Number.isInteger(tipoActivoId) || tipoActivoId <= 0) {
      this.form.controls.tipo.setErrors({ required: true });
      this.form.controls.tipo.markAsTouched();
      this.mensajeError.set('Selecciona un tipo de activo válido.');
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    try {
      const creado = await this.activoService.registrar({
        nombre: valores.nombre.trim(),
        tipoActivoId,
        ubicacion: valores.ubicacion.trim(),
        esCritico: valores.criticidad === 'true',
        descripcion: valores.descripcion,
        marca: valores.marca,
        modelo: valores.modelo,
        numeroSerie: valores.numeroSerie,
        fechaInstalacion: valores.fechaInstalacion
      });

      this.mensajeExito.set(
        `Activo "${creado.codigo} - ${creado.nombre}" registrado exitosamente.`
      );
      this.form.reset({
        nombre: '',
        tipo: '',
        ubicacion: '',
        criticidad: '',
        descripcion: '',
        marca: '',
        modelo: '',
        numeroSerie: '',
        fechaInstalacion: ''
      });
    } catch (error: unknown) {
      console.error('Error al registrar el activo:', error);
      this.mensajeError.set(this.obtenerMensajeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  private obtenerMensajeError(error: unknown): string {
    const httpError = error as {
      status?: number;
      error?: unknown;
      message?: string;
    };

    if (httpError.status === 401 || httpError.status === 403) {
      return 'Tu sesión ha vencido o no tienes permiso para registrar activos. Inicia sesión nuevamente e inténtalo.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté disponible e inténtalo nuevamente.';
    }

    if (httpError.status && httpError.status >= 500) {
      return 'Tuvimos un problema al registrar el activo. Tus datos siguen en el formulario; inténtalo nuevamente en unos minutos.';
    }

    const cuerpo = typeof httpError.error === 'string'
      ? httpError.error
      : httpError.error as {
          message?: unknown;
          error?: unknown;
          detail?: unknown;
        } | null | undefined;
    const detalle = typeof cuerpo === 'string'
      ? cuerpo
      : [cuerpo?.message, cuerpo?.error, cuerpo?.detail]
          .filter((valor): valor is string => typeof valor === 'string')
          .join(' ');

    return detalle.trim() || httpError.message || 'No se pudo registrar el activo.';
  }
}
