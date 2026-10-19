import { Component, computed, inject } from '@angular/core';
import { INCIDENT_ACTIONS } from '../../core/data/navigation.data';
import { AuthService } from '../../core/services/auth.service';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';
import { TilePanelComponent } from '../../shared/tile-panel/tile-panel.component';

@Component({
  selector: 'app-incidencias',
  imports: [PageHeroComponent, TilePanelComponent],
  templateUrl: './incidencias.component.html',
})
export class IncidenciasComponent {
  private readonly auth = inject(AuthService);

  nombre = this.auth.primerNombre;

  // Filtramos para que a 'residente' no le aparezca 'Incidencias asignadas'
  get acciones() {
    const rol = this.auth.usuario()?.rol;
    if (rol === 'residente') {
      return INCIDENT_ACTIONS.filter(
        (accion) => accion.route !== '/incidencias/asignadas'
      );
    }
    return INCIDENT_ACTIONS;
  }
}