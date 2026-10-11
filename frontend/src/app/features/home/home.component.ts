import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_ITEMS } from '../../core/data/navigation.data';
import { AuthService } from '../../core/services/auth.service';
import { IncidenciasService } from '../../core/services/incidencias.service';
import { IncidenciaRowComponent } from '../../shared/incidencia-row/incidencia-row.component';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, PageHeroComponent, IncidenciaRowComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly incidencias = inject(IncidenciasService);

  nombre = inject(AuthService).primerNombre;
  modulos = NAV_ITEMS.filter((i) => i.grid);
  recientes = computed(() => this.incidencias.propias().slice(0, 2));
  enCurso = computed(() => this.incidencias.propias().filter((i) => i.estado !== 'Cerrada').length);
  fecha = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}
