import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncidenciasService } from '../../../core/services/incidencias.service';
import { Incidencia } from '../../../models/incidencia.model';

@Component({
  selector: 'app-reportar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reportar.component.html',
  styleUrl: './reportar.component.scss',
})
export class ReportarComponent {
  private fb = inject(FormBuilder);
  private service = inject(IncidenciasService);

  categorias = ['Agua', 'Electricidad', 'Ascensor', 'Iluminación', 'Puerta / portón', 'Área común', 'Otro'];
  torres = Array.from({ length: 12 }, (_, i) => String(i + 1));
  pisos = Array.from({ length: 8 }, (_, i) => String(i + 1));

  form = this.fb.nonNullable.group({
    categoria: ['', Validators.required],
    torre: ['', Validators.required],
    piso: ['', Validators.required],
    detalle: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  archivos = signal<File[]>([]);
  creada = signal<Incidencia | null>(null);

  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivos.set(Array.from(input.files ?? []).slice(0, 3));
  }

  invalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.creada.set(
      this.service.crear({ ...valores, evidencias: this.archivos().map((f) => f.name) }),
    );
  }

  nueva() {
    this.form.reset();
    this.archivos.set([]);
    this.creada.set(null);
  }
}