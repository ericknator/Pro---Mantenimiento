import { Component } from '@angular/core';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';
import { TilePanelComponent } from '../../../shared/tile-panel/tile-panel.component';
import { ADMIN_ALERTAS_ACTIONS } from '../../../core/data/admin-alertas.data';

@Component({
  selector: 'app-alertas-hub',
  standalone: true,
  imports: [PageHeroComponent, TilePanelComponent],
  template: `
    <app-page-hero
      tone="dark"
      eyebrow="CONDOMINIO NUEVO ALCÁZAR · ADMINISTRACIÓN"
      title="Alertas"
      subtitle="5 opciones disponibles en este módulo."
    />
    <app-tile-panel
      class="dock"
      title="ALERTAS"
      [subtitle]="acciones.length + ' opciones'"
      [items]="acciones"
    />
  `,
})
export class AlertasHubComponent {
  readonly acciones = ADMIN_ALERTAS_ACTIONS;
}