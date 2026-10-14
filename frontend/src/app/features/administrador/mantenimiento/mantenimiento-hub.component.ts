import { Component } from '@angular/core';
import { ADMIN_MANTENIMIENTO_ACTIONS } from '../../../core/data/admin-navigation.data';
import { EDIFICIO_NOMBRE } from '../../../core/data/navigation.data';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { TilePanelComponent } from '../../../shared/tile-panel/tile-panel.component';

@Component({
  selector: 'app-admin-mantenimiento-hub',
  imports: [PageHeroComponent, TilePanelComponent],
  template: `
    <app-page-hero
      [eyebrow]="eyebrow"
      title="Mantenimiento"
      [subtitle]="acciones.length + ' opciones disponibles en este módulo.'"
    />
    <app-tile-panel class="dock" title="Mantenimiento" [subtitle]="acciones.length + ' opciones'" [items]="acciones" />
  `,
})
export class MantenimientoHubComponent {
  acciones = ADMIN_MANTENIMIENTO_ACTIONS;
  eyebrow = `${EDIFICIO_NOMBRE} · Administración`;
}
