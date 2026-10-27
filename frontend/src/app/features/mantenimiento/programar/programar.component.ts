import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { MantenimientoService } from '../../../core/services/mantenimiento.service';
import { PlanMantenimientoPayload } from '../../../models/mantenimiento.model';

type CampoProgramacion =
  | 'activoId'
  | 'frecuenciaId'
  | 'responsableId'
  | 'titulo'
  | 'descripcion'
  | 'primeraTareaProgramadaPara';

@Component({
  selector: 'app-programar-mantenimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeroComponent],
  templateUrl: './programar.component.html',
  styleUrl: './programar.component.scss',
})
export class ProgramarMantenimientoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly service = inject(MantenimientoService);

  readonly enviando = signal(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);
  readonly fechaMinima = this.obtenerFechaMinima();

  readonly form = this.fb.nonNullable.group({
    activoId: [0, [Validators.required, Validators.min(1)]],
    frecuenciaId: [0, [Validators.required, Validators.min(1)]],
    responsableId: [0, [Validators.required, Validators.min(1)]],
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(500)]],
    primeraTareaProgramadaPara: ['', [Validators.required]],
  });

  ngOnInit(): void {
    void this.service.cargarCatalogos();
    void this.service.cargarMantenimientos();
  }

  invalido(campo: CampoProgramacion): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  fechaInvalida(): boolean {
    const control = this.form.controls.primeraTareaProgramadaPara;
    return (
      control.touched &&
      control.value.length > 0 &&
      !this.fechaEsFutura(control.value)
    );
  }

  async enviar(): Promise<void> {
    if (this.enviando()) return;

    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeError.set(
        'Completa el activo, la frecuencia, el responsable, el título y la fecha y hora.'
      );
      return;
    }

    const datos = this.form.getRawValue();

    if (!this.fechaEsFutura(datos.primeraTareaProgramadaPara)) {
      this.form.controls.primeraTareaProgramadaPara.markAsTouched();
      this.mensajeError.set('La fecha y hora de la primera tarea deben ser futuras.');
      return;
    }

    const programacion: PlanMantenimientoPayload = {
      activoId: datos.activoId,
      frecuenciaId: datos.frecuenciaId,
      responsableId: datos.responsableId,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      primeraTareaProgramadaPara: this.normalizarFechaHora(
        datos.primeraTareaProgramadaPara
      ),
    };

    this.enviando.set(true);

    try {
      await this.service.programarMantenimiento(programacion);
      this.mensajeExito.set(
        'Plan guardado. El listado de tareas preventivas se actualizó.'
      );
      this.form.reset({
        activoId: 0,
        frecuenciaId: 0,
        responsableId: 0,
        titulo: '',
        descripcion: '',
        primeraTareaProgramadaPara: '',
      });
    } catch (error: unknown) {
      console.error('Error al programar mantenimiento:', error);
      this.mensajeError.set(this.mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  private fechaEsFutura(valor: string): boolean {
    const fecha = new Date(valor);
    return !Number.isNaN(fecha.getTime()) && fecha.getTime() > Date.now();
  }

  private normalizarFechaHora(valor: string): string {
    return valor.length === 16 ? `${valor}:00` : valor;
  }

  private obtenerFechaMinima(): string {
    const ahora = new Date(Date.now() + 60_000);
    const pad = (valor: number) => String(valor).padStart(2, '0');
    return [
      ahora.getFullYear(),
      pad(ahora.getMonth() + 1),
      pad(ahora.getDate()),
    ].join('-') + `T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
  }

  private mensajeDeError(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return (
      this.service.error() ??
      'No se pudo programar el mantenimiento. Inténtalo nuevamente.'
    );
  }
}
