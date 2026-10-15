import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EDIFICIO_NOMBRE } from '../../../../core/data/navigation.data';
import { IncidenciasAdminService } from '../../../../core/services/incidencias-admin.service';
import { PageHeroComponent } from '../../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-admin-pendientes',
  imports: [RouterLink, DatePipe, PageHeroComponent],
  templateUrl: './pendientes.component.html',
  styleUrl: './pendientes.component.scss',
})
export class PendientesComponent {
  private readonly service = inject(IncidenciasAdminService);

  eyebrow = `${EDIFICIO_NOMBRE} · Administración`;
  cargando = this.service.cargando;
  error = this.service.error;

  // Pendientes de clasificar = estado Reportada
  items = computed(() => this.service.incidencias().filter((i) => i.estadoCodigo === 'REPORTADA'));

  constructor() {
    void this.service.cargar();
  }

  actualizar(): void {
    void this.service.cargar();
  }
}
