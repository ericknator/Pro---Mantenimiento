import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EDIFICIO_NOMBRE } from '../../core/data/navigation.data';

@Component({
  selector: 'app-page-hero',
  imports: [RouterLink],
  template: `
    <header class="hero" [class.hero--dark]="tone() === 'dark'">
      @if (backLink()) {
        <a class="hero__eyebrow hero__back" [routerLink]="backLink()">
          <span class="material-symbols-rounded">arrow_back</span>{{ backLabel() }}
        </a>
      } @else {
        <p class="hero__eyebrow">{{ eyebrow() }}</p>
      }
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p class="hero__sub">{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: `
    .hero { color: #fff; text-shadow: 0 2px 16px rgba(10, 25, 60, 0.35); max-width: 640px; }
    .hero--dark { color: var(--c-ink); text-shadow: none; }
    .hero__eyebrow {
      display: inline-flex; align-items: center; gap: 6px; margin: 0 0 10px;
      font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.85;
    }
    .hero__back { color: var(--c-primary); opacity: 1; }
    .hero__back .material-symbols-rounded { font-size: 16px; }
    h1 { margin: 0; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.05; font-weight: 700; letter-spacing: -0.02em; }
    .hero__sub { margin: 10px 0 0; font-size: 1rem; opacity: 0.9; }

    /* En móvil el fondo es claro: el texto pasa a color oscuro */
    @media (max-width: 767.98px) {
      .hero { color: var(--c-ink); text-shadow: none; }
      .hero__eyebrow { color: var(--c-primary); }
      h1 { font-size: 1.6rem; }
    }
  `,
})
export class PageHeroComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  eyebrow = input<string>(EDIFICIO_NOMBRE);
  tone = input<'light' | 'dark'>('light');
  backLink = input<string>('');
  backLabel = input<string>('Volver');
}
