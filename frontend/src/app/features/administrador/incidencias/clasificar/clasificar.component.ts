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
import { Location } from '@angular/common';
import { UsuarioPerfilService, RolResponsable, UsuarioResponsable } from '../../../../core/services/usuario-perfil.service';

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
  private readonly usuariosService = inject(UsuarioPerfilService);

  roles = signal<RolResponsable[]>([]);
  responsables = signal<UsuarioResponsable[]>([]);
  cargandoRoles = signal(false);
  cargandoResponsables = signal(false);

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
    rolId: this.fb.control<number | null>(null, Validators.required),
    responsableId: this.fb.control<number | null>(null, Validators.required),
  });

  enviando = signal(false);
  error = signal('');
  confirmada = signal(false);
  private inicializado = false;

  constructor() {
    void this.cargarRoles();

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

  invalido( campo: 'categoria' | 'prioridad' | 'rolId' | 'responsableId' ): boolean {
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

    const { categoria, prioridad, responsableId } =
      this.form.getRawValue();

    this.enviando.set(true);

    try {
      await this.service.clasificar(
        inc.id,
        categoria!,
        prioridad!,
        responsableId!
      );

      this.confirmada.set(true);
    } catch (e) {
      this.error.set(
        this.service.mensaje(
          e,
          'No se pudo guardar la clasificación y asignación.'
        )
      );
    } finally {
      this.enviando.set(false);
    }
  }

  private readonly location = inject(Location);

  volver(): void {
    this.location.back();
  }

  async cargarRoles(): Promise<void> {
    this.cargandoRoles.set(true);

    try {
      this.roles.set(await this.usuariosService.listarRoles());
    } catch (e) {
      this.error.set('No se pudieron cargar los roles disponibles.');
    } finally {
      this.cargandoRoles.set(false);
    }
  }

  async cambiarRol(rolId: number | null): Promise<void> {
    this.form.controls.responsableId.setValue(null);
    this.responsables.set([]);

    if (rolId === null) return;

    this.cargandoResponsables.set(true);

    try {
      this.responsables.set(
        await this.usuariosService.listarResponsables(rolId)
      );
    } catch {
      this.error.set('No se pudieron cargar los responsables del rol seleccionado.');
    } finally {
      this.cargandoResponsables.set(false);
    }
  }



}
