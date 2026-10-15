import { Component } from '@angular/core';
import { ADMIN_INCIDENCIAS_ACTIONS } from '../../../core/data/admin-incidencias.data';
import { EDIFICIO_NOMBRE } from '../../../core/data/navigation.data';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { TilePanelComponent } from '../../../shared/tile-panel/tile-panel.component';

@Component({
  selector: 'app-admin-incidencias-hub',
  imports: [PageHeroComponent, TilePanelComponent],
  template: `
    <app-page-hero
      [eyebrow]="eyebrow"
      title="Incidencias"
      [subtitle]="acciones.length + ' opciones disponibles en este módulo.'"
    />
    <app-tile-panel class="dock" title="Incidencias" [subtitle]="acciones.length + ' opciones'" [items]="acciones" />
  `,
})
export class IncidenciasHubComponent {
  acciones = ADMIN_INCIDENCIAS_ACTIONS;
  eyebrow = `${EDIFICIO_NOMBRE} · Administración`;
}
