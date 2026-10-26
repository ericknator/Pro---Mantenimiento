import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
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
  private readonly auth = inject(AuthService);
  private readonly data = inject(ActivatedRoute).snapshot.data;

  titulo: string = this.data['titulo'];
  private readonly filtro: Filtro = this.data['filtro'];

  readonly subtitulo = computed(() => {
    const cantidad = this.items().length;

    return this.filtro === 'asignadas'
      ? `${cantidad} incidencias asignadas`
      : `${cantidad} incidencias`;
  });

  constructor() {
    void this.cargarFuente();
  }

  async recargar(): Promise<void> {
    await this.cargarFuente();
  }

  private async cargarFuente(): Promise<void> {
    await this.auth.inicializacion;

    const rol = this.auth.usuario()?.rol;
    const consultaAsignada =
      this.filtro === 'asignadas' ||
      (this.filtro === 'cerradas' &&
        (rol === 'mantenimiento' || rol === 'seguridad'));

    if (consultaAsignada) {
      await this.service.cargarAsignadas();
    } else {
      await this.service.cargar();
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
          (i) => {
            const estado = i.estado.trim().toLowerCase();
            return estado === 'solucionada' || estado === 'cerrada';
          }
        );
      case 'asignadas':
        return lista.filter((i) => {
          const est = i.estado.trim().toLowerCase();
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
