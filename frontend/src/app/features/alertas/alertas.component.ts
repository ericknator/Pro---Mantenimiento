import { Component } from '@angular/core';
import { ALERTAS_ACTIONS } from '../../core/data/navigation.data';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';
import { TilePanelComponent } from '../../shared/tile-panel/tile-panel.component';

@Component({
  selector: 'app-alertas',
  imports: [PageHeroComponent, TilePanelComponent],
  templateUrl: './alertas.component.html',
})
export class AlertasComponent {
  acciones = ALERTAS_ACTIONS;
}