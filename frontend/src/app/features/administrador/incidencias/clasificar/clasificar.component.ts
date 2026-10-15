import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CATEGORIAS_BD, PRIORIDADES_BD } from '../../../../core/data/catalogos-bd.data';
import { EDIFICIO_NOMBRE } from '../../../../core/data/navigation.data';
import { IncidenciasAdminService } from '../../../../core/services/incidencias-admin.service';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-clasificar-incidencia',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, PageHeroComponent],
  templateUrl: './clasificar.component.html',
  styleUrl: './clasificar.component.scss',
})
export class ClasificarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(IncidenciasAdminService);
  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))), { initialValue: null });

  eyebrow = `${EDIFICIO_NOMBRE} · Administración`;
  categorias = CATEGORIAS_BD;
  prioridades = PRIORIDADES_BD;

  cargando = this.service.cargando;
  incidencia = computed(() => this.service.incidencias().find((i) => i.id === this.id()) ?? null);
  // Solo se clasifica una incidencia en estado Reportada (HU-INC-03-CA-01)
  puedeClasificar = computed(() => this.incidencia()?.estadoCodigo === 'REPORTADA');

  form = this.fb.group({
    categoria: this.fb.control<number | null>(null, Validators.required),
    prioridad: this.fb.control<number | null>(null, Validators.required),
  });

  enviando = signal(false);
  error = signal('');
  confirmada = signal(false);
  private inicializado = false;

  constructor() {
    if (this.service.incidencias().length === 0) void this.service.cargar();

    // Precarga el formulario con los valores actuales cuando la incidencia está disponible
    effect(() => {
      const inc = this.incidencia();
      if (inc && !this.inicializado) {
        this.inicializado = true;
        this.form.patchValue({ categoria: inc.categoriaId, prioridad: inc.prioridadId });
      }
    });
  }

  invalido(campo: 'categoria' | 'prioridad'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  async guardar(): Promise<void> {
    const inc = this.incidencia();
    if (!inc) return;
    this.error.set('');
    this.confirmada.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { categoria, prioridad } = this.form.getRawValue();
    this.enviando.set(true);
    try {
      await this.service.clasificar(inc.id, categoria!, prioridad!);
      this.confirmada.set(true);
    } catch (e) {
      // Sin cambios en pantalla: la incidencia conserva sus valores anteriores
      this.error.set(this.service.mensaje(e, 'No se pudo guardar la clasificación'));
      this.form.patchValue({ categoria: inc.categoriaId, prioridad: inc.prioridadId });
    } finally {
      this.enviando.set(false);
    }
  }
}
