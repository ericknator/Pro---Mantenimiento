import { Component } from '@angular/core';
import { TilePanelComponent } from '../../shared/tile-panel/tile-panel.component';
import { INCIDENT_ACTIONS } from '../../core/data/navigation.data';

@Component({
  selector: 'app-incidencias',
  imports: [TilePanelComponent],
  templateUrl: './incidencias.component.html',
  styleUrl: './incidencias.component.scss',
})
export class IncidenciasComponent {
  actions = INCIDENT_ACTIONS;
}