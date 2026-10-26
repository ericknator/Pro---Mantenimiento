import { Component } from '@angular/core';
import { MANTENIMIENTO_ACTIONS } from '../../core/data/navigation.data';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';
import { TilePanelComponent } from '../../shared/tile-panel/tile-panel.component';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [PageHeroComponent, TilePanelComponent],
  templateUrl: './mantenimiento.component.html',
})
export class MantenimientoComponent {
  acciones = MANTENIMIENTO_ACTIONS;
}