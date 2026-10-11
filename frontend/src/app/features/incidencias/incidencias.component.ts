import { Component, inject } from '@angular/core';
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
  nombre = inject(AuthService).primerNombre;
  acciones = INCIDENT_ACTIONS;
}
