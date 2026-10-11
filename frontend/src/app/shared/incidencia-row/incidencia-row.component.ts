import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Incidencia } from '../../models/incidencia.model';
import { EstadoBadgeComponent } from '../estado-badge/estado-badge.component';

@Component({
  selector: 'app-incidencia-row',
  imports: [RouterLink, DatePipe, EstadoBadgeComponent],
  template: `
    <a class="row" [routerLink]="['/incidencias/caso', incidencia().id]">
      <span class="row__text">
        <strong>{{ incidencia().descripcion }}</strong>
        <small>{{ incidencia().categoria }} · {{ incidencia().ubicacion }} · {{ incidencia().creada | date: 'd MMM, HH:mm' }}</small>
      </span>
      <app-estado-badge [estado]="incidencia().estado" />
    </a>
  `,
  styles: `
    :host { display: block; }
    .row {
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      padding: 13px 0; border-bottom: 1px solid var(--c-line);
    }
    :host(:last-child) .row { border-bottom: 0; }
    .row:hover strong { color: var(--c-primary); }
    .row__text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    strong { font-size: 0.92rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    small { font-size: 0.74rem; color: var(--c-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `,
})
export class IncidenciaRowComponent {
  incidencia = input.required<Incidencia>();
}
