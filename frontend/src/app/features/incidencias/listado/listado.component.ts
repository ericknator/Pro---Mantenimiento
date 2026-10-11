import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IncidenciasService } from '../../../core/services/incidencias.service';
import { IncidenciaRowComponent } from '../../../shared/incidencia-row/incidencia-row.component';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';

type Filtro = 'todas' | 'activas' | 'cerradas';

/** Un solo componente para tres vistas; la ruta define título y filtro (data). */
@Component({
  selector: 'app-listado-incidencias',
  imports: [RouterLink, PageHeroComponent, IncidenciaRowComponent],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss',
})
export class ListadoIncidenciasComponent {
  private readonly service = inject(IncidenciasService);
  private readonly data = inject(ActivatedRoute).snapshot.data;

  titulo: string = this.data['titulo'];
  private readonly filtro: Filtro = this.data['filtro'];

  items = computed(() => {
    const propias = this.service.propias();
    switch (this.filtro) {
      case 'activas': return propias.filter((i) => i.estado !== 'Cerrada');
      case 'cerradas': return propias.filter((i) => i.estado === 'Solucionada' || i.estado === 'Cerrada');
      default: return propias;
    }
  });
}
