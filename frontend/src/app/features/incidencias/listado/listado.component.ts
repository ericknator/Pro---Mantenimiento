import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IncidenciasService } from '../../../core/services/incidencias.service';
import { IncidenciaRowComponent } from '../../../shared/incidencia-row/incidencia-row.component';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';

type Filtro = 'todas' | 'activas' | 'cerradas' | 'asignadas';

@Component({
  selector: 'app-listado-incidencias',
  imports: [RouterLink, PageHeroComponent, IncidenciaRowComponent],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss',
})
export class ListadoIncidenciasComponent {
  readonly service = inject(IncidenciasService);
  private readonly data = inject(ActivatedRoute).snapshot.data;

  titulo: string = this.data['titulo'];
  private readonly filtro: Filtro = this.data['filtro'];

  constructor() {
    if (this.filtro === 'asignadas') {
      void this.service.cargarAsignadas();
    } else {
      void this.service.cargar();
    }
  }

  items = computed(() => {
    // Si tu servicio tiene this.service.todas() o this.service.items(), úsalo, sino propias():
    const lista = this.service.propias();

    switch (this.filtro) {
      case 'activas':
        return lista.filter((i) => i.estado !== 'Cerrada');
      case 'cerradas':
        return lista.filter(
          (i) => i.estado === 'Solucionada' || i.estado === 'Cerrada'
        );
      case 'asignadas':
        return lista.filter((i) => {
          const est = (i.estado as string ?? '').toLowerCase();
          return (
            est === 'asignada' ||
            est.includes('atenci') ||
            est.includes('proceso') ||
            est === 'solucionada'
          );
        });
      default:
        return lista;
    }
  });
}
