import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { MantenimientoService } from '../../../core/services/mantenimiento.service';
import { MantenimientoPreventivo } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-programar-mantenimiento',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeroComponent],
  templateUrl: './programar.component.html',
  styleUrl: './programar.component.scss'
})
export class ProgramarMantenimientoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly service = inject(MantenimientoService);

  readonly enviando = signal(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  // Tipos de mantenimiento preventivo estándar
  readonly tiposMantenimiento = [
    'Revisión Mensual',
    'Mantenimiento Bimestral',
    'Mantenimiento Semestral',
    'Inspección Anual Integral',
    'Calibración y Pruebas Técnicas'
  ];

  form = this.fb.nonNullable.group({
    activoId: ['', [Validators.required]],
    tipoMantenimiento: ['', [Validators.required]],
    fechaProgramada: ['', [Validators.required]]
  });

  ngOnInit(): void {
    void this.service.cargarActivos();
    void this.service.cargarMantenimientos();
  }

  invalido(campo: 'activoId' | 'tipoMantenimiento' | 'fechaProgramada'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  async enviar(): Promise<void> {
    if (this.enviando()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeError.set('Por favor completa todos los campos requeridos.');
      return;
    }

    const { activoId, tipoMantenimiento, fechaProgramada } = this.form.getRawValue();

    // Validación de fecha no vacía o inválida (CA-02)
    const fechaObj = new Date(fechaProgramada);
    if (isNaN(fechaObj.getTime())) {
      this.mensajeError.set('La fecha programada no es válida.');
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    const nuevaProgramacion: MantenimientoPreventivo = {
      activoId: Number(activoId), // 👈 Convertir a número
      tipoMantenimiento,
      fechaProgramada
    };

    try {
      await this.service.programarMantenimiento(nuevaProgramacion);

      this.mensajeExito.set('Mantenimiento preventivo programado exitosamente.');
      this.form.reset({
        activoId: '',
        tipoMantenimiento: '',
        fechaProgramada: ''
      });
    } catch (error: any) {
      console.error('Error al programar mantenimiento:', error);
      const detalle = error?.error?.message || error?.message || 'Error de comunicación con el servidor.';
      this.mensajeError.set(`No se pudo programar el mantenimiento: ${detalle}`);
    } finally {
      this.enviando.set(false);
    }
  }
}