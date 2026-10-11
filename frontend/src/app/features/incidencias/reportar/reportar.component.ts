import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORIAS_INCIDENCIA } from '../../../core/data/navigation.data';
import { IncidenciasService } from '../../../core/services/incidencias.service';
import { Incidencia } from '../../../models/incidencia.model';
import { IncidenciaRowComponent } from '../../../shared/incidencia-row/incidencia-row.component';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-reportar',
  imports: [ReactiveFormsModule, RouterLink, PageHeroComponent, IncidenciaRowComponent],
  templateUrl: './reportar.component.html',
  styleUrl: './reportar.component.scss',
})
export class ReportarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(IncidenciasService);

  categorias = CATEGORIAS_INCIDENCIA;
  recientes = () => this.service.propias().slice(0, 3);

  // HU-INC-01: categoría, ubicación, descripción y evidencia.
  // La prioridad NO se captura aquí: la define la administración (HU-INC-03).
  form = this.fb.nonNullable.group({
    categoria: ['', Validators.required],
    ubicacion: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  archivos = signal<string[]>([]);
  creada = signal<Incidencia | null>(null);

  onArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivos.set(Array.from(input.files ?? []).slice(0, 3).map((f) => f.name));
  }

  invalido(campo: 'categoria' | 'ubicacion' | 'descripcion'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // HU-INC-01-CA-02: se indica el campo faltante y no se crea el caso
      this.creada.set(null);
      return;
    }
    const nueva = this.service.crear({ ...this.form.getRawValue(), evidencias: this.archivos() });
    this.creada.set(nueva);
    this.form.reset();
    this.archivos.set([]);
  }
}
