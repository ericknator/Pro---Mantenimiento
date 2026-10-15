import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EDIFICIO_NOMBRE } from '../../../../core/data/navigation.data';
import { IncidenciasAdminService } from '../../../../core/services/incidencias-admin.service';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-admin-todas-incidencias',
  imports: [RouterLink, DatePipe, PageHeroComponent],
  templateUrl: './todas.component.html',
  styleUrl: './todas.component.scss',
})
export class TodasComponent {
  private readonly service = inject(IncidenciasAdminService);

  eyebrow = `${EDIFICIO_NOMBRE} · Administración`;
  cargando = this.service.cargando;
  error = this.service.error;

  // Incluye todos los estados y prioridades.
  items = computed(() => this.service.incidencias());

  constructor() {
    void this.service.cargar();
  }

  actualizar(): void {
    void this.service.cargar();
  }
}
