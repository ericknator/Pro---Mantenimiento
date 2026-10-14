import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EDIFICIO_NOMBRE } from '../../../core/data/navigation.data';
import { PageHeroComponent } from '../../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-admin-pendiente',
  imports: [RouterLink, PageHeroComponent],
  template: `
    <app-page-hero [eyebrow]="eyebrow" [title]="titulo" subtitle="Pantalla en construcción" />
    <section class="panel dock">
      <header class="panel__head"><h2 class="label">Aún no implementada</h2></header>
      <p>Esta pantalla forma parte del diseño y se implementará según el Product Backlog.</p>
      <a class="btn" [routerLink]="volver">{{ volverTexto }}</a>
    </section>
  `,
  styles: `
    h2 { margin: 0; }
    p { margin: 14px 0 20px; color: var(--c-muted); line-height: 1.5; }
  `,
})
export class AdminPendienteComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;

  eyebrow = `${EDIFICIO_NOMBRE} · Administración`;
  titulo: string = this.data['titulo'] ?? 'Módulo';
  volver: string = this.data['volver'] ?? '/administrador/dashboard';
  volverTexto: string = this.data['volverTexto'] ?? 'Volver al dashboard';
}
