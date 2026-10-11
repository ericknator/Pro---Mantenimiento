import { Component, input } from '@angular/core';
import { EstadoIncidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-estado-badge',
  template: `<span class="badge" [attr.data-estado]="estado()">{{ estado() }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 4px 11px;
      border-radius: 999px;
      font-family: var(--font-mono);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
      background: #eef1f6;
      color: #4b566b;
    }
    .badge[data-estado='Reportada'] { background: #fdf0d3; color: #9a6200; }
    .badge[data-estado='En atención'] { background: #e1eaff; color: #2850d0; }
    .badge[data-estado='Solucionada'] { background: #d9f3e3; color: #1c7f47; }
    .badge[data-estado='Cerrada'] { background: #e8ebf1; color: #4b566b; }
    .badge[data-estado='Reabierta'] { background: #fde2e2; color: #b42323; }
  `,
})
export class EstadoBadgeComponent {
  estado = input.required<EstadoIncidencia>();
}
