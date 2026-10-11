import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-placeholder',
  imports: [RouterLink, PageHeroComponent],
  template: `
    <app-page-hero [title]="titulo" subtitle="Pantalla en construcción" />
    <section class="panel dock">
      <header class="panel__head"><h2 class="label">Fuera del alcance actual</h2></header>
      <p>
        Este módulo forma parte del diseño, pero todavía no está comprometido en el MVP vigente.
        Se implementará en un sprint posterior según el Product Backlog.
      </p>
      <a class="btn" routerLink="/inicio">Volver al inicio</a>
    </section>
  `,
  styles: `
    h2 { margin: 0; }
    p { margin: 14px 0 20px; color: var(--c-muted); line-height: 1.5; }
  `,
})
export class PlaceholderComponent {
  titulo: string = inject(ActivatedRoute).snapshot.data['titulo'] ?? 'Módulo';
}